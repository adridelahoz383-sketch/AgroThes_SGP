// ============================================================
// STORE GLOBAL — Zustand
// Estado centralizado de la aplicación AgroThes.
// Integra AnimalFactory, PersistenceProxy, HealthMonitor y Caretaker.
// ============================================================

import { create } from "zustand";
import { AnimalFactory } from "../domain/animals/AnimalFactory.js";
import { persistenceProxy } from "../infra/proxy/PersistenceProxy.js";
import { healthMonitor } from "../domain/observer/HealthMonitor.js";
import { RegistroMemento, biometriaCaretaker } from "../domain/memento/RegistroMemento.js";
import {
    dbGetAnimales,
    dbGetAllBiometrico,
    dbGetAllAlimentacion,
    dbGetBiometricoByAnimal,
    dbDeleteBiometrico,
    dbGetAllPesajesImagen,
} from "../infra/db/LocalDB.js";

export const useAgroStore = create((set, get) => ({
    // ── Estado ──────────────────────────────────────────────
    animales: [],
    biometrico: [],
    alimentacion: [],
    pesajesImagen: [],
    alertas: [],
    isOnline: navigator.onLine,
    cargando: false,

    // ── Inicialización ───────────────────────────────────────
    inicializar: async () => {
        set({ cargando: true });
        const [animales, biometrico, alimentacion, pesajesImagen] = await Promise.all([
            dbGetAnimales(),
            dbGetAllBiometrico(),
            dbGetAllAlimentacion(),
            dbGetAllPesajesImagen(),
        ]);
        // Suscribir el store al HealthMonitor (Observer)
        healthMonitor.subscribe({
            onAlerta: (alerta) => {
                set(s => ({ alertas: [alerta, ...s.alertas] }));
            },
        });
        set({
            animales,
            biometrico,
            alimentacion,
            pesajesImagen,
            alertas: healthMonitor.getAlertas(),
            isOnline: persistenceProxy.isOnline(),
            cargando: false,
        });
        // Listener de red → actualizar badge de estado
        window.addEventListener("online", () => set({ isOnline: true }));
        window.addEventListener("offline", () => set({ isOnline: false }));
    },

    // ── RF-01/02: Crear Animal (Factory Method) ───────────────
    crearAnimal: async (especie, datosExtra = {}) => {
        // Clonar el array para asegurar inmutabilidad
        const animalesActuales = [...get().animales];
        const mismaEspecie = animalesActuales.filter(a => a.idEspecie === especie);
        const correlativo = mismaEspecie.length + 1;

        const animal = AnimalFactory.crear(especie, correlativo, datosExtra);
        const plain = { ...animal.toPlainObject(), especie, emoji: animal.emoji };

        await persistenceProxy.guardarAnimal(plain);
        // Retornar SIEMPRE un nuevo array
        set(s => ({ animales: [...s.animales, plain].map(a => ({ ...a })) }));
        return plain;
    },

    // ── RF-03: Registrar Pesaje Biométrico (+ Observer) ──────
    registrarPeso: async ({ idAnimal, especie, emoji, peso, observaciones }) => {
        const idRegistro = `PES-${idAnimal}-${Date.now()}`;
        const fecha = new Date().toISOString();

        // Memento: capturar estado anterior antes de modificar
        const anterior = get().biometrico.filter(b => b.idAnimal === idAnimal).at(-1);
        if (anterior) {
            biometriaCaretaker.push(
                new RegistroMemento({
                    idAnimal: anterior.idAnimal,
                    peso: anterior.peso,
                    fecha: anterior.fecha,
                    observaciones: anterior.observaciones,
                })
            );
        }

        const registro = { idRegistro, idAnimal, especie, emoji, peso, fecha, observaciones: observaciones || "" };
        await persistenceProxy.guardarBiometrico(registro);

        // Observer: notificar al HealthMonitor
        healthMonitor.notify({
            idAnimal,
            especie,
            emoji,
            pesoNuevo: peso,
            pesoAnterior: anterior?.peso || 0,
            fecha,
        });

        set(s => ({ biometrico: [...s.biometrico, registro] }));
        return registro;
    },

    // ── MEMENTO: Deshacer último pesaje ──────────────────────
    deshacerUltimoPeso: async () => {
        const memento = biometriaCaretaker.pop();
        if (!memento) return null;
        const estado = memento.getEstado();

        // Eliminar el último registro del animal y restaurar el anterior
        const bios = get().biometrico.filter(b => b.idAnimal === estado.idAnimal);
        const ultimo = bios.at(-1);
        if (ultimo) {
            await dbDeleteBiometrico(ultimo.idRegistro);
            const actualizado = get().biometrico.filter(b => b.idRegistro !== ultimo.idRegistro);
            set({ biometrico: actualizado });
        }
        return estado;
    },

    canUndo: () => biometriaCaretaker.size() > 0,

    // ── RF-04: Registrar Alimentación ────────────────────────
    registrarAlimentacion: async ({ idAnimal, tipoAlimento, cantidadGramos, idLote }) => {
        const idRegistro = `ALI-${idAnimal}-${idLote || Date.now()}`;
        const fechaSuministro = new Date().toISOString();
        const registro = { idRegistro, idAnimal, tipoAlimento, cantidadGramos, fechaSuministro };
        await persistenceProxy.guardarAlimentacion(registro);
        set(s => ({ alimentacion: [...s.alimentacion, registro] }));
        return registro;
    },

    // ── Registrar Pesaje (Imagen) ───────────────────────────
    registrarPesajeImagen: async ({ idAnimal, imagenFile }) => {
        if (!idAnimal || !imagenFile) throw new Error('Se requiere idAnimal y un archivo de imagen');
        const id = `IMG-${idAnimal}-${Date.now()}`;
        const fecha = new Date().toISOString();
        const registro = { id, idAnimal, imagen: imagenFile, fecha };
        await persistenceProxy.guardarPesajeImagen(registro);
        set(s => ({ pesajesImagen: [...s.pesajesImagen, registro] }));
        return registro;
    },


    // ── Actualizar Animal ───────────────────────────────────
    actualizarAnimal: async (idUnico, datosActualizados) => {
        const animal = get().animales.find(a => a.idUnico === idUnico);
        if (!animal) throw new Error(`Animal con ID ${idUnico} no encontrado`);
        
        const animalActualizado = { ...animal, ...datosActualizados };
        await persistenceProxy.actualizarAnimal(animalActualizado);
        
        set(s => ({
            animales: s.animales.map(a => a.idUnico === idUnico ? animalActualizado : a)
        }));
        return animalActualizado;
    },

    // ── Eliminar Animal ─────────────────────────────────────
    eliminarAnimal: async (idUnico) => {
        const animal = get().animales.find(a => a.idUnico === idUnico);
        if (!animal) throw new Error(`Animal con ID ${idUnico} no encontrado`);
        
        await persistenceProxy.eliminarAnimal(animal);
        
        set(s => ({
            animales: s.animales.filter(a => a.idUnico !== idUnico),
            biometrico: s.biometrico.filter(b => b.idAnimal !== animal.id),
            alimentacion: s.alimentacion.filter(a => a.idAnimal !== animal.id),
        }));
    },

    // ── Alertas ───────────────────────────────────────────────
    marcarAlertaLeida: (id) => {
        healthMonitor.marcarLeido(id);
        set(s => ({
            alertas: s.alertas.map(a => a.id === id ? { ...a, leido: true } : a),
        }));
    },
}));
