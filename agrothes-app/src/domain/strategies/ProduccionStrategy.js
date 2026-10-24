import { ICAStrategy } from "./ICAStrategy.js";

// ============================================================
// GoF: STRATEGY — Producción (aves ponedoras)
// Fórmula: g de alimento por unidad de producción estimada
// ICA óptimo gallinas ponedoras: < 2.0 kg alimento/docena
// ============================================================

export class ProduccionStrategy extends ICAStrategy {
    constructor() {
        super("produccion");
    }

    calcular(pesoActual, pesoAnterior, alimentoGramos) {
        // Para producción estimamos producción de huevos basada en peso corporal
        // Regla estándar: gallina >1.5kg produce ~0.8 huevos/día
        const ciclosDias = 1;
        const huevosEstimados = pesoActual >= 1.5 ? 0.8 * ciclosDias : 0.4 * ciclosDias;
        if (huevosEstimados <= 0 || alimentoGramos <= 0) return null;
        const alimentoKg = alimentoGramos / 1000;
        // kg de alimento por docena producida (factor 12 huevos)
        const docenable = (alimentoKg / (huevosEstimados / 12));
        return parseFloat(docenable.toFixed(2));
    }

    umbralAlerta() {
        return 4.0; // > 4 kg alimento/docena → ineficiente
    }
}
