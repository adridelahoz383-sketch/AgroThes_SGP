// ============================================================
// INFRAESTRUCTURA: weight.js — OCR robusto para básculas
// Maneja artefactos tipicos: "5 00", "500", ".5", "5.OO kg"
// ============================================================

/**
 * Extrae y normaliza el peso desde texto OCR de una báscula.
 * Retorna un número válido (0 < peso ≤ 40) o null si falla.
 *
 * Casos manejados:
 *   ".5"     → 5.00   (punto decimal suelto)
 *   "0.5"    → 5.00   (cero punto cinco → x10)
 *   "5 00"   → 5.00   (espacio en lugar de punto)
 *   "500"    → 5.00   (sin punto decimal)
 *   "5.OO"   → 5.00   (letra O confundida con 0)
 *   "5,00"   → 5.00   (coma decimal)
 *   "5.3 kg" → 5.30   (con unidades)
 *
 * @param {string} rawText — texto crudo de Tesseract
 * @returns {number|null}
 */
export function extractWeightFromOCR(rawText) {
    if (!rawText || typeof rawText !== "string") return null;

    // ── PASO 1: Sustituciones de caracteres confundidos por OCR ─
    let text = rawText
        .toUpperCase()
        .replace(/O/g, "0")   // letra O → cero
        .replace(/S/g, "5")   // letra S → cinco
        .replace(/B/g, "8")   // letra B → ocho
        .replace(/I/g, "1")   // letra I → uno
        .replace(/L/g, "1")   // letra L → uno
        .replace(/Z/g, "2")   // letra Z → dos
        .replace(/,/g, ".");  // coma decimal → punto

    // ── PASO 2: Eliminar todo excepto dígitos, puntos y espacios ─
    text = text.replace(/[^\d.\s]/g, " ").trim();

    // ── PASO 3: Normalizar separaciones tipo "5 00" → "5.00" ────
    // Patrón: dígito(s) + espacio(s) + exactamente 2 dígitos al final
    text = text.replace(/(\d+)\s+(\d{2})(?!\d)/g, "$1.$2");

    // ── PASO 4: Extraer el primer número válido del texto ────────
    const match = text.match(/(\d+(?:\.\d+)?)/);
    if (!match) return null;

    let raw = match[1];

    // ── PASO 5: Manejar "500" → "5.00" (3+ dígitos sin punto) ──
    // Solo si el número tiene exactamente 3 dígitos enteros (ej: 500, 320)
    if (/^\d{3,4}$/.test(raw)) {
        const len = raw.length;
        raw = raw.slice(0, len - 2) + "." + raw.slice(len - 2);
    }

    // ── PASO 6: Manejar ".5" suelto → "5.0" ─────────────────────
    if (raw.startsWith(".")) {
        raw = raw.slice(1);
    }

    let peso = parseFloat(raw);
    if (isNaN(peso)) return null;

    // ── PASO 7: Corrección si peso < 1 (ej: 0.5 → 5.0) ─────────
    if (peso > 0 && peso < 1) {
        peso = peso * 10;
    }

    // ── PASO 8: Validación de rango para ganado menor ───────────
    if (peso <= 0 || peso > 40) return null;

    return parseFloat(peso.toFixed(2));
}

/**
 * Handler completo: extrae peso y persiste vía Zustand/IndexedDB.
 * Usado por OcrHandler y flujos legacy.
 */
export async function handleWeightExtraction(ocrText, selectedAnimal) {
    try {
        if (!selectedAnimal || (!selectedAnimal.id && !selectedAnimal.idUnico)) {
            throw new Error("No hay animal seleccionado");
        }

        const peso = extractWeightFromOCR(ocrText);
        if (peso === null) throw new Error("No se pudo extraer un peso válido del texto OCR");

        const animalId = selectedAnimal.idUnico || selectedAnimal.id;
        const { useAgroStore } = await import("../store/useAgroStore.js");

        const registro = await useAgroStore.getState().registrarPeso({
            idAnimal: animalId,
            especie: selectedAnimal.especie || "",
            emoji: selectedAnimal.emoji || "🐄",
            peso,
            observaciones: "Capturado vía OCR",
        });

        return { ok: true, registro };
    } catch (err) {
        return { ok: false, error: err.message || String(err) };
    }
}

export default handleWeightExtraction;
