// ============================================================
// INFRAESTRUCTURA: ImagePipeline — Pipeline YOLOv8 Simulado
// Pipeline de 5 etapas: capture → preprocess → infer
//                       → postprocess → aggregate
// Genera ConteoResult que alimenta al Observer HealthMonitor.
// ============================================================

const DELAY = ms => new Promise(r => setTimeout(r, ms));

// Etiquetas de especie conocidas por el modelo (solo permitidas)
const CLASES_MODELO = [
    "Conejo",
    "Cuy",
    "Cabra",
    "Oveja",
    "Gallina",
    "Codorniz",
    "Pato",
    "Ganso",
    "Pavo",
    "Tilapia",
    "Trucha"
];

export class ImagePipeline {
    constructor() {
        this._onResult = null;  // callback
        this._running = false;
    }

    /** Registra el callback que recibe el ConteoResult */
    onResult(fn) {
        this._onResult = fn;
        return this;
    }

    /**
     * Ejecuta el pipeline completo sobre un frame (simulado).
     * @param {string} especieFiltro — especie objetivo del conteo
     */
    async ejecutar(especieFiltro = null) {
        if (this._running) return null;
        this._running = true;

        const resultado = {
            etapas: [],
            conteo: {},
            totalAnimales: 0,
            confianzaPromedio: 0,
            duracionMs: 0,
            timestamp: new Date().toISOString(),
        };

        const t0 = Date.now();

        // ── ETAPA 1: Pre-procesamiento ────────────────────────
        await DELAY(10);
        resultado.etapas.push({ nombre: "Pre-procesamiento", ms: 10, estado: "OK" });

        // ── ETAPA 2: Inferencia YOLOv8-nano ──────────────────
        await DELAY(120);
        const detecciones = this._simularDetecciones(especieFiltro);
        resultado.etapas.push({ nombre: "Inferencia YOLOv8", ms: 120, estado: "OK" });

        // ── ETAPA 3: Post-procesamiento (NMS 0.70) ────────────
        await DELAY(15);
        const filtradas = detecciones.filter(d => d.confianza >= 0.70);
        resultado.etapas.push({
            nombre: "Post-procesamiento (NMS)",
            ms: 15,
            estado: "OK",
            filtradas: detecciones.length - filtradas.length,
        });

        // ── ETAPA 4: Agregación por especie ───────────────────
        await DELAY(5);
        const conteo = {};
        filtradas.forEach(d => {
            conteo[d.especie] = (conteo[d.especie] || 0) + 1;
        });
        resultado.conteo = conteo;
        resultado.totalAnimales = filtradas.length;
        resultado.confianzaPromedio = filtradas.length
            ? parseFloat((filtradas.reduce((s, d) => s + d.confianza, 0) / filtradas.length).toFixed(2))
            : 0;
        resultado.etapas.push({ nombre: "Agregación", ms: 5, estado: "OK" });

        // ── ETAPA 5: Callback al Observer ─────────────────────
        resultado.duracionMs = Date.now() - t0;
        resultado.etapas.push({ nombre: "Notificación Observer", ms: 2, estado: "OK" });

        if (this._onResult) this._onResult(resultado);
        this._running = false;
        return resultado;
    }

    _simularDetecciones(especieFiltro) {
        const especies = especieFiltro ? [especieFiltro] : CLASES_MODELO;
        const detecciones = [];
        especies.forEach(especie => {
            const n = Math.floor(Math.random() * 6) + 1; // 1-6 animales por especie
            for (let i = 0; i < n; i++) {
                detecciones.push({
                    especie,
                    confianza: parseFloat((0.65 + Math.random() * 0.34).toFixed(2)),
                    bbox: [
                        Math.random() * 300,
                        Math.random() * 200,
                        Math.random() * 100 + 50,
                        Math.random() * 80 + 40,
                    ],
                });
            }
        });
        return detecciones;
    }
}

// Singleton global
export const imagePipeline = new ImagePipeline();
