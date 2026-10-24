// ============================================================
// INFRAESTRUCTURA: SyncSaga — Cola de Sincronización
// Patrón Saga (Coreografía): procesa la cola de pendientes
// con Exponential Backoff al detectar conectividad.
// ============================================================

import { dbGetPendientes, dbUpdateSyncStatus, dbRemoveFromQueue } from "../db/LocalDB.js";

const MAX_INTENTOS = 5;
const BASE_DELAY_MS = 1000;
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

export class SyncSaga {
    constructor() {
        this._procesando = false;
    }

    /**
     * Envía datos al backend real según la operación.
     * @param {string} tabla - Tabla objetivo (animales, historico_biometrico, etc.)
     * @param {object} payload - Datos a sincronizar
     * @param {string} operacion - CREATE, UPDATE, DELETE
     */
    async _enviarAlBackend(tabla, payload, operacion = "CREATE") {
        let url, metodo, body;

        if (tabla === "animales") {
            // Determinar si ya existe el animal
            if (operacion === "UPDATE") {
                url = `${API_BASE_URL}/animales/${payload.id || payload.idUnico}`;
                metodo = "PUT";
                body = {
                    tipo: payload.especie || payload.tipo,
                    codigo: payload.idUnico || payload.codigo,
                    estado_salud: payload.estadoInicial || payload.estado_salud,
                    peso: payload.pesoActual || payload.peso || 0,
                };
            } else if (operacion === "DELETE") {
                url = `${API_BASE_URL}/animales/${payload.id || payload.idUnico}`;
                metodo = "DELETE";
                body = null;
            } else {
                // CREATE
                url = `${API_BASE_URL}/animales`;
                metodo = "POST";
                body = {
                    tipo: payload.especie || payload.tipo,
                    codigo: payload.idUnico || payload.codigo,
                    estado_salud: payload.estadoInicial || payload.estado_salud,
                    peso: payload.pesoActual || payload.peso || 0,
                };
            }
        } else if (tabla === "historico_biometrico") {
            url = `${API_BASE_URL}/registros`;
            metodo = "POST";
            body = {
                idAnimal: payload.idAnimal,
                peso: payload.peso,
                observaciones: payload.observaciones || "",
                fecha: payload.fecha,
            };
        } else if (tabla === "gestion_alimentacion") {
            url = `${API_BASE_URL}/registros`;
            metodo = "POST";
            body = {
                idAnimal: payload.idAnimal,
                tipo_alimento: payload.tipoAlimento,
                cantidad_gramos: payload.cantidadGramos,
                fecha_suministro: payload.fechaSuministro,
            };
        } else {
            throw new Error(`Tabla desconocida: ${tabla}`);
        }

        const options = {
            method: metodo,
            headers: { "Content-Type": "application/json" },
        };

        if (body) {
            options.body = JSON.stringify(body);
        }

        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        console.log(`[Saga] ✅ Sync OK → ${tabla} (${operacion}):`, payload.idUnico || payload.idRegistro);
        return response.json();
    }

    /**
     * Envío directo cuando hay red disponible (sin cola).
     */
    async enviarDirecto({ tabla, payload, operacion = "CREATE" }) {
        try {
            await this._enviarAlBackend(tabla, payload, operacion);
        } catch (e) {
            console.warn("[Saga] Envío directo fallido, agregando a cola:", e.message);
        }
    }

    /**
     * Procesa todos los registros en estado PENDING con retry exponencial.
     */
    async procesarCola() {
        if (this._procesando) return;
        this._procesando = true;

        const pendientes = await dbGetPendientes();
        console.log(`[Saga] Procesando ${pendientes.length} registros pendientes...`);

        for (const item of pendientes) {
            await this._procesarItem(item);
        }

        this._procesando = false;
    }

    async _procesarItem(item) {
        let intentos = item.intentos || 0;

        while (intentos < MAX_INTENTOS) {
            try {
                await dbUpdateSyncStatus(item.id, "SYNCING", intentos);
                await this._enviarAlBackend(item.tabla, item.payload, item.operacion);
                await dbRemoveFromQueue(item.id);
                return;
            } catch (err) {
                intentos++;
                const delay = BASE_DELAY_MS * Math.pow(2, intentos - 1); // 1s, 2s, 4s, 8s...
                console.warn(`[Saga] ⚠️ Intento ${intentos}/${MAX_INTENTOS} fallido. Retry en ${delay}ms`, err.message);
                await dbUpdateSyncStatus(item.id, "PENDING", intentos);
                await new Promise(r => setTimeout(r, delay));
            }
        }

        // Después de MAX_INTENTOS → marcar como ERROR
        await dbUpdateSyncStatus(item.id, "CONFLICT", intentos);
        console.error(`[Saga] ❌ CONFLICT: ${item.id} superó el máximo de reintentos.`);
    }
}
