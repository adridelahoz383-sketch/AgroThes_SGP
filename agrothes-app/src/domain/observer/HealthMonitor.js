// ============================================================
// GoF: OBSERVER — HealthMonitor (Subject/Observable)
// Se suscribe a cambios en Historico_Biometrico y notifica
// a los observadores ante anomalías de peso o salud.
// ============================================================

export class HealthMonitor {
    constructor() {
        this._observers = [];
        this._alertas = [];
    }

    /**
     * Suscribe un observer que recibe onAlerta(alerta).
     * @param {{ onAlerta: Function }} observer
     */
    subscribe(observer) {
        if (!this._observers.includes(observer)) {
            this._observers.push(observer);
        }
    }

    unsubscribe(observer) {
        this._observers = this._observers.filter(o => o !== observer);
    }

    /**
     * Evalúa un nuevo registro biométrico y emite alertas si hay anomalías.
     * @param {{ idAnimal, pesoNuevo, pesoAnterior, fecha }} registro
     */
    notify(registro) {
        const alertas = this._detectarAnomalias(registro);
        alertas.forEach(alerta => {
            this._alertas.unshift(alerta); // más reciente primero
            this._observers.forEach(obs => obs.onAlerta(alerta));
        });
    }

    _detectarAnomalias({ idAnimal, especie, emoji, pesoNuevo, pesoAnterior, fecha }) {
        const alertas = [];
        const fecha_str = fecha || new Date().toISOString();

        if (pesoAnterior > 0 && pesoNuevo < pesoAnterior) {
            alertas.push({
                id: `ALT-${idAnimal}-${Date.now()}`,
                idAnimal,
                especie,
                emoji,
                tipo: "PERDIDA_PESO",
                nivel: "warning",
                mensaje: `${idAnimal} perdió ${(pesoAnterior - pesoNuevo).toFixed(1)} kg`,
                detalle: `Peso anterior: ${pesoAnterior} kg → Peso actual: ${pesoNuevo} kg`,
                fecha: fecha_str,
                leido: false,
            });
        }

        if (pesoNuevo < 1) {
            alertas.push({
                id: `ALT-${idAnimal}-crit-${Date.now()}`,
                idAnimal,
                especie,
                emoji,
                tipo: "PESO_CRITICO",
                nivel: "error",
                mensaje: `${idAnimal} tiene peso crítico: ${pesoNuevo} kg`,
                detalle: "Verificar estado de salud inmediatamente.",
                fecha: fecha_str,
                leido: false,
            });
        }

        return alertas;
    }

    getAlertas() {
        return this._alertas;
    }

    clearAlertas() {
        this._alertas = [];
    }

    marcarLeido(alertaId) {
        const a = this._alertas.find(a => a.id === alertaId);
        if (a) a.leido = true;
    }
}

// Singleton global del monitor de salud
export const healthMonitor = new HealthMonitor();
