// ============================================================
// GoF: STRATEGY — Interfaz base para cálculo de ICA
// ============================================================

export class ICAStrategy {
    constructor(tipo) {
        this.tipo = tipo;
    }
    /**
     * Calcula el Índice de Conversión Alimenticia.
     * @param {number} pesoActual kg
     * @param {number} pesoAnterior kg
     * @param {number} alimentoGramos gramos suministrados
     * @returns {number} ICA — kg alimento / kg ganado
     */
    calcular(pesoActual, pesoAnterior, alimentoGramos) {
        throw new Error("calcular() debe ser implementado por la subclase.");
    }

    /** Umbral de alerta: si ICA supera este valor → alerta roja */
    umbralAlerta() {
        return 4.0;
    }

    /** Evalúa si el ICA está en rango óptimo */
    evaluarEstado(ica) {
        if (ica <= this.umbralAlerta() * 0.6) return { color: "verde", label: "Óptimo" };
        if (ica <= this.umbralAlerta()) return { color: "amarillo", label: "Aceptable" };
        return { color: "rojo", label: "Crítico" };
    }
}
