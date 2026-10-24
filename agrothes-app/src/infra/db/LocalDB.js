// ============================================================
// INFRAESTRUCTURA: LocalDB — Wrapper de IndexedDB
// Equivalente a SQLite local. Tablas: animales,
// historico_biometrico, gestion_alimentacion, sync_queue.
// ============================================================

import { openDB } from "idb";

const DB_NAME = "agrothes_db";
const DB_VERSION = 1;

let _db = null;

async function getDB() {
    if (_db) return _db;
    _db = await openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
            // Tabla Animales
            if (!db.objectStoreNames.contains("animales")) {
                const animales = db.createObjectStore("animales", { keyPath: "idUnico" });
                animales.createIndex("idEspecie", "idEspecie");
            }
            // Tabla Historico_Biometrico
            if (!db.objectStoreNames.contains("historico_biometrico")) {
                const hb = db.createObjectStore("historico_biometrico", {
                    keyPath: "idRegistro",
                });
                hb.createIndex("idAnimal", "idAnimal");
                hb.createIndex("fecha", "fecha");
            }
            // Tabla Gestion_Alimentacion
            if (!db.objectStoreNames.contains("gestion_alimentacion")) {
                const ga = db.createObjectStore("gestion_alimentacion", {
                    keyPath: "idRegistro",
                });
                ga.createIndex("idAnimal", "idAnimal");
            }
            // Tabla Pesajes_Imagen (almacena fotos de pesajes por animal)
            if (!db.objectStoreNames.contains("pesajes_imagen")) {
                const pi = db.createObjectStore("pesajes_imagen", { keyPath: "id" });
                pi.createIndex("idAnimal", "idAnimal");
                pi.createIndex("fecha", "fecha");
            }
            // Tabla sync_queue (para SyncSaga)
            if (!db.objectStoreNames.contains("sync_queue")) {
                const sq = db.createObjectStore("sync_queue", { keyPath: "id" });
                sq.createIndex("syncStatus", "syncStatus");
            }
        },
    });
    return _db;
}

// ── Animales ──────────────────────────────────────────────
export async function dbSaveAnimal(animal) {
    const db = await getDB();
    await db.put("animales", animal);
}

export async function dbGetAnimales() {
    const db = await getDB();
    return db.getAll("animales");
}

export async function dbUpdateAnimal(animal) {
    const db = await getDB();
    await db.put("animales", animal);
}

export async function dbDeleteAnimal(idUnico) {
    const db = await getDB();
    await db.delete("animales", idUnico);
}

export async function dbCountByEspecie(especie) {
    const db = await getDB();
    const animales = await db.getAllFromIndex("animales", "idEspecie", especie);
    return animales.length;
}

// ── Historico Biométrico ──────────────────────────────────
export async function dbSaveBiometrico(registro) {
    const db = await getDB();
    await db.put("historico_biometrico", registro);
}

export async function dbGetBiometricoByAnimal(idAnimal) {
    const db = await getDB();
    const resultados = await db.getAllFromIndex("historico_biometrico", "idAnimal", idAnimal);
    return resultados.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
}

export async function dbGetAllBiometrico() {
    const db = await getDB();
    return db.getAll("historico_biometrico");
}

export async function dbDeleteBiometrico(idRegistro) {
    const db = await getDB();
    await db.delete("historico_biometrico", idRegistro);
}

// ── Gestión Alimentación ──────────────────────────────────
export async function dbSaveAlimentacion(registro) {
    const db = await getDB();
    await db.put("gestion_alimentacion", registro);
}

export async function dbGetAlimentacionByAnimal(idAnimal) {
    const db = await getDB();
    const resultados = await db.getAllFromIndex("gestion_alimentacion", "idAnimal", idAnimal);
    return resultados.sort((a, b) => new Date(a.fechaSuministro) - new Date(b.fechaSuministro));
}

export async function dbGetAllAlimentacion() {
    const db = await getDB();
    return db.getAll("gestion_alimentacion");
}

// ── Sync Queue ────────────────────────────────────────────
export async function dbEnqueue(item) {
    const db = await getDB();
    await db.put("sync_queue", { ...item, syncStatus: "PENDING", intentos: 0 });
}

export async function dbGetPendientes() {
    const db = await getDB();
    return db.getAllFromIndex("sync_queue", "syncStatus", "PENDING");
}

export async function dbUpdateSyncStatus(id, syncStatus, intentos) {
    const db = await getDB();
    const item = await db.get("sync_queue", id);
    if (item) await db.put("sync_queue", { ...item, syncStatus, intentos });
}

export async function dbRemoveFromQueue(id) {
    const db = await getDB();
    await db.delete("sync_queue", id);
}

// ── Pesajes (Imágenes) ────────────────────────────────────
export async function dbSavePesajeImagen(registro) {
    const db = await getDB();
    await db.put("pesajes_imagen", registro);
}

export async function dbGetPesajesByAnimal(idAnimal) {
    const db = await getDB();
    const resultados = await db.getAllFromIndex("pesajes_imagen", "idAnimal", idAnimal);
    return resultados.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
}

export async function dbGetAllPesajesImagen() {
    const db = await getDB();
    return db.getAll("pesajes_imagen");
}

export async function dbDeletePesajeImagen(id) {
    const db = await getDB();
    await db.delete("pesajes_imagen", id);
}
