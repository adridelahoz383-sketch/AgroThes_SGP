import { useAgroStore } from "../store/useAgroStore.js";

export default function Alertas() {
    const { alertas, marcarAlertaLeida } = useAgroStore();

    const noLeidas = alertas.filter(a => !a.leido);
    const leidas = alertas.filter(a => a.leido);

    return (
        <div className="fade-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Centro de Alertas</h1>
                    <p className="page-subtitle">Observer Pattern — Notificaciones del HealthMonitor</p>
                </div>
                {noLeidas.length > 0 && (
                    <span className="chip chip-red">🔔 {noLeidas.length} sin leer</span>
                )}
            </div>

            {/* Diagrama del patrón Observer */}
            <div className="card mb-4" style={{ background: "rgba(96,165,250,0.04)", borderColor: "rgba(96,165,250,0.15)" }}>
                <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: 700, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    Flujo Observer activo
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", fontSize: "0.85rem" }}>
                    {["⚖️ Pesaje registrado", "→", "📡 PersistenceProxy", "→", "👁️ HealthMonitor", "→", "🔔 Dashboard + Alertas"].map((s, i) => (
                        <span key={i} style={{ color: s === "→" ? "var(--text-muted)" : "var(--text-secondary)", fontWeight: s.includes("→") ? 400 : 600 }}>
                            {s}
                        </span>
                    ))}
                </div>
            </div>

            {alertas.length === 0 && (
                <div className="empty-state">
                    <div className="empty-icon">✅</div>
                    <p>Sin alertas. El rebaño está en buen estado.</p>
                </div>
            )}

            {noLeidas.length > 0 && (
                <>
                    <h2 style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-muted)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                        Sin leer ({noLeidas.length})
                    </h2>
                    {noLeidas.map(a => (
                        <AlertaItem key={a.id} alerta={a} onLeer={marcarAlertaLeida} />
                    ))}
                </>
            )}

            {leidas.length > 0 && (
                <>
                    <h2 style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-muted)", marginBottom: 12, marginTop: 24, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                        Historial ({leidas.length})
                    </h2>
                    {leidas.map(a => (
                        <AlertaItem key={a.id} alerta={a} onLeer={marcarAlertaLeida} />
                    ))}
                </>
            )}
        </div>
    );
}

function AlertaItem({ alerta, onLeer }) {
    return (
        <div className={`alert-item ${alerta.nivel} ${alerta.leido ? "leido" : ""}`}>
            <span className="alert-icon">{alerta.nivel === "error" ? "🚨" : "⚠️"}</span>
            <div style={{ flex: 1 }}>
                <div className="alert-msg">{alerta.emoji} {alerta.mensaje}</div>
                <div className="alert-det">{alerta.detalle}</div>
                <div className="alert-fecha">{new Date(alerta.fecha).toLocaleString("es-CO")}</div>
                <div style={{ marginTop: 4, fontSize: "0.72rem", color: "var(--text-muted)", fontFamily: "monospace" }}>
                    ID: {alerta.id}
                </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span className={`chip ${alerta.nivel === "error" ? "chip-red" : "chip-amber"}`}>
                    {alerta.tipo}
                </span>
                {!alerta.leido && (
                    <button className="btn btn-secondary btn-sm" onClick={() => onLeer(alerta.id)}>
                        ✓ Leer
                    </button>
                )}
            </div>
        </div>
    );
}
