// ============================================================
// GoF: PROXY — PersistenceProxy (Offline-first)
// Intercepta TODAS las escrituras. Si hay red → Firebase mock.
// Si no hay red → SQLite local (IndexedDB) + sync_queue.
// ============================================================

import {
    dbSaveAnimal, dbSaveBiometrico, dbSaveAlimentacion, dbEnqueue, dbSavePesajeImagen,
    dbUpdateAnimal, dbDeleteAnimal,
} from "../db/LocalDB.js";
import { SyncSaga } from "../sync/SyncSaga.js";

export class PersistenceProxy {
    constructor() {
        this._saga = new SyncSaga();
        this._isOnline = navigator.onLine;

        // Escuchar cambios de conectividad
        window.addEventListener("online", () => {
            this._isOnline = true;
            console.log("[Proxy] Conexión restaurada → iniciando sincronización");
            this._saga.procesarCola();
        });
        window.addEventListener("offline", () => {
            this._isOnline = false;
            console.log("[Proxy] Sin conexión → modo offline activado");
        });
    }

    isOnline() {
        return this._isOnline;
    }

    // ── Guardar Animal ────────────────────────────────────────
    async guardarAnimal(animal) {
        await dbSaveAnimal(animal);
        if (this._isOnline) {
            await this._saga.enviarDirecto({ tabla: "animales", payload: animal });
        } else {
            await dbEnqueue({ id: `Q-animal-${animal.idUnico}-${Date.now()}`, tabla: "animales", payload: animal });
        }
        return { syncStatus: this._isOnline ? "SYNCED" : "LOCAL" };
    }

    // ── Guardar Registro Biométrico ───────────────────────────
    async guardarBiometrico(registro) {
        await dbSaveBiometrico(registro);
        if (this._isOnline) {
            await this._saga.enviarDirecto({ tabla: "historico_biometrico", payload: registro });
        } else {
            await dbEnqueue({ id: `Q-pes-${registro.idRegistro}`, tabla: "historico_biometrico", payload: registro });
        }
        return { syncStatus: this._isOnline ? "SYNCED" : "LOCAL" };
    }

    // ── Guardar Pesaje (Imagen) ───────────────────────────────
    async guardarPesajeImagen(registro) {
        await dbSavePesajeImagen(registro);
        if (this._isOnline) {
            await this._saga.enviarDirecto({ tabla: "pesajes_imagen", payload: registro });
        } else {
            await dbEnqueue({ id: `Q-img-${registro.id}`, tabla: "pesajes_imagen", payload: registro });
        }
        return { syncStatus: this._isOnline ? "SYNCED" : "LOCAL" };
    }

    // ── Guardar Registro Alimentación ─────────────────────────
    async guardarAlimentacion(registro) {
        await dbSaveAlimentacion(registro);
        if (this._isOnline) {
            await this._saga.enviarDirecto({ tabla: "gestion_alimentacion", payload: registro });
        } else {
            await dbEnqueue({ id: `Q-ali-${registro.idRegistro}`, tabla: "gestion_alimentacion", payload: registro });
        }
        return { syncStatus: this._isOnline ? "SYNCED" : "LOCAL" };
    }

    // ── Actualizar Animal ───────────────────────────────────
    async actualizarAnimal(animal) {
        await dbUpdateAnimal(animal);
        if (this._isOnline) {
            await this._saga.enviarDirecto({ 
                tabla: "animales", 
                payload: animal, 
                operacion: "UPDATE" 
            });
        } else {
            await dbEnqueue({ 
                id: `Q-update-${animal.idUnico}-${Date.now()}`, 
                tabla: "animales", 
                payload: animal,
                operacion: "UPDATE"
            });
        }
        return { syncStatus: this._isOnline ? "SYNCED" : "LOCAL" };
    }

    // ── Eliminar Animal ─────────────────────────────────────
    async eliminarAnimal(animal) {
        await dbDeleteAnimal(animal.idUnico);
        if (this._isOnline) {
            await this._saga.enviarDirecto({ 
                tabla: "animales", 
                payload: animal, 
                operacion: "DELETE" 
            });
        } else {
            await dbEnqueue({ 
                id: `Q-delete-${animal.idUnico}-${Date.now()}`, 
                tabla: "animales", 
                payload: animal,
                operacion: "DELETE"
            });
        }
        return { syncStatus: this._isOnline ? "SYNCED" : "LOCAL" };
    }

    // ── Forzar sincronización manual ──────────────────────────
    async sincronizarYa() {
        return this._saga.procesarCola();
    }
}

// Singleton global
export const persistenceProxy = new PersistenceProxy();
