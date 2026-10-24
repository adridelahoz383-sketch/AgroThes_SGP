import { ICAStrategy } from "./ICAStrategy.js";

// ============================================================
// GoF: STRATEGY — Engorde
// Fórmula: kg de alimento consumido / kg de peso ganado
// ICA óptimo para engorde: < 2.5 (menor es mejor)
// ============================================================

export class EngordeStrategy extends ICAStrategy {
    constructor() {
        super("engorde");
    }

    calcular(pesoActual, pesoAnterior, alimentoGramos) {
        const ganancia = pesoActual - pesoAnterior;
        if (ganancia <= 0 || alimentoGramos <= 0) return null;
        const alimentoKg = alimentoGramos / 1000;
        return parseFloat((alimentoKg / ganancia).toFixed(2));
    }

    umbralAlerta() {
        return 3.5; // > 3.5 kg alimento/kg ganado → ineficiente
    }
}
