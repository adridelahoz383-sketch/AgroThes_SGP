import { useState, useMemo } from "react";
import { useAgroStore } from "../store/useAgroStore.js";
import { EngordeStrategy } from "../domain/strategies/EngordeStrategy.js";
import { ProduccionStrategy } from "../domain/strategies/ProduccionStrategy.js";

const ALIMENTOS = ["Heno", "Concentrado", "Maíz", "Soya", "Forraje", "Balanceado", "Sal mineral"];

export default function Nutricion() {
    const { animales, biometrico, alimentacion, registrarAlimentacion } = useAgroStore();
    const [idAnimal, setIdAnimal] = useState("");
    const [tipoAlimento, setTipoAlimento] = useState("Concentrado");
    const [cantidadGramos, setCantidadGramos] = useState("");
    const [cargando, setCargando] = useState(false);
    const [ok, setOk] = useState(false);

    const animalSel = animales.find(a => a.idUnico === idAnimal);

    // Calcular ICA al momento
    const icaInfo = useMemo(() => {
        if (!animalSel || !cantidadGramos) return null;
        const historicoAnimal = biometrico.filter(b => b.idAnimal === idAnimal);
        if (historicoAnimal.length < 2) return null;

        const pe = historicoAnimal.at(-2).peso;
        const pa = historicoAnimal.at(-1).peso;
        const gramos = parseFloat(cantidadGramos);

        const estrategia = animalSel.especie === "Gallina" ? new ProduccionStrategy() : new EngordeStrategy();
        const ica = estrategia.calcular(pa, pe, gramos);
        if (!ica) return null;
        const estado = estrategia.evaluarEstado(ica);
        return { ica, estado, tipo: estrategia.tipo };
    }, [idAnimal, cantidadGramos, biometrico, animalSel]);

    const handleRegistrar = async () => {
        if (!idAnimal || !cantidadGramos || !tipoAlimento) return;
        setCargando(true);
        await registrarAlimentacion({
            idAnimal,
            tipoAlimento,
            cantidadGramos: parseFloat(cantidadGramos),
            idLote: `L${Date.now()}`,
        });
        setCantidadGramos("");
        setOk(true);
        setCargando(false);
        setTimeout(() => setOk(false), 3000);
    };

    const colorMap = { verde: "var(--green-400)", amarillo: "var(--amber-400)", rojo: "var(--red-500)" };

    return (
        <div className="fade-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Control Nutricional</h1>
                    <p className="page-subtitle">RF-04 — Registro de alimento con cálculo de ICA en tiempo real</p>
                </div>
                <span className="chip chip-green">⚙️ Strategy Pattern</span>
            </div>

            <div className="grid-2 mb-4">
                <div className="card">
                    <h2 style={{ fontSize: "0.9rem", fontWeight: 700, marginBottom: 16, color: "var(--text-muted)" }}>
                        Registrar Suministro — ALI-[ID]-[Lote]
                    </h2>

                    {ok && (
                        <div style={{
                            padding: "10px 14px", borderRadius: "var(--radius-sm)", marginBottom: 14,
                            background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)",
                            color: "var(--green-400)", fontSize: "0.85rem"
                        }}>
                            ✅ Suministro registrado correctamente
                        </div>
                    )}

                    <div className="form-group mb-4">
                        <label className="form-label">Animal</label>
                        <select className="form-control" value={idAnimal} onChange={e => setIdAnimal(e.target.value)}>
                            <option value="">— Seleccionar —</option>
                            {animales.map(a => (
                                <option key={a.idUnico} value={a.idUnico}>
                                    {a.emoji} {a.idUnico} — {a.especie}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group mb-4">
                        <label className="form-label">Tipo de Alimento</label>
                        <select className="form-control" value={tipoAlimento} onChange={e => setTipoAlimento(e.target.value)}>
                            {ALIMENTOS.map(a => <option key={a}>{a}</option>)}
                        </select>
                    </div>

                    <div className="form-group mb-4">
                        <label className="form-label">Cantidad suministrada (gramos)</label>
                        <input
                            type="number" className="form-control" placeholder="ej: 250"
                            value={cantidadGramos} onChange={e => setCantidadGramos(e.target.value)}
                        />
                    </div>

                    {/* ICA en tiempo real — Strategy Pattern */}
                    {icaInfo && (
                        <div style={{
                            background: "var(--bg-surface)", border: `1px solid ${colorMap[icaInfo.estado.color]}44`,
                            borderRadius: "var(--radius-sm)", padding: "14px 18px", marginBottom: 16
                        }}>
                            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600, marginBottom: 6 }}>
                                ⚙️ ICA calculado con {icaInfo.tipo === "engorde" ? "EngordeStrategy" : "ProduccionStrategy"}
                            </div>
                            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                                <span style={{ fontSize: "2rem", fontWeight: 800, color: colorMap[icaInfo.estado.color] }}>
                                    {icaInfo.ica}
                                </span>
                                <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
                                    {icaInfo.tipo === "engorde" ? "kg alimento / kg ganado" : "kg alimento / docena"}
                                </span>
                            </div>
                            <span className={`chip chip-${icaInfo.estado.color === "verde" ? "green" : icaInfo.estado.color === "amarillo" ? "amber" : "red"}`}>
                                {icaInfo.estado.label}
                            </span>
                        </div>
                    )}

                    <button
                        className="btn btn-primary"
                        onClick={handleRegistrar}
                        disabled={cargando || !idAnimal || !cantidadGramos}
                        style={{ width: "100%" }}
                    >
                        {cargando ? <span className="spinning">⟳</span> : "🌿"}
                        {cargando ? "Guardando..." : "Registrar Suministro"}
                    </button>
                </div>

                {/* Resumen nutricional */}
                <div className="card">
                    <h2 style={{ fontSize: "0.9rem", fontWeight: 700, marginBottom: 16, color: "var(--text-muted)" }}>
                        Estadísticas por Especie
                    </h2>
                    {animales.length === 0 ? (
                        <div className="empty-state"><div className="empty-icon">🌿</div><p>Sin animales.</p></div>
                    ) : (
                        animales.reduce((acc, a) => {
                            if (!acc.find(x => x.especie === a.especie)) {
                                const ali = alimentacion.filter(al => {
                                    const animal = animales.find(an => an.idUnico === al.idAnimal);
                                    return animal?.especie === a.especie;
                                });
                                const totalGramos = ali.reduce((s, r) => s + (r.cantidadGramos || 0), 0);
                                acc.push({ especie: a.especie, emoji: a.emoji, count: 0, totalGramos });
                            }
                            acc.find(x => x.especie === a.especie).count++;
                            return acc;
                        }, []).map(({ especie, emoji, count, totalGramos }) => (
                            <div key={especie} className="card-sm mb-4">
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <span style={{ fontSize: "1.1rem", fontWeight: 700 }}>{emoji} {especie}</span>
                                    <span className="chip chip-blue">{count} animales</span>
                                </div>
                                <div style={{ marginTop: 8, color: "var(--text-muted)", fontSize: "0.82rem" }}>
                                    Total suministrado: <strong style={{ color: "var(--green-400)" }}>{(totalGramos / 1000).toFixed(2)} kg</strong>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Tabla de alimentación */}
            <div className="card">
                <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 16 }}>
                    Historial de Suministros <span style={{ color: "var(--text-muted)", fontWeight: 400, fontSize: "0.85rem" }}>({alimentacion.length})</span>
                </h2>
                {alimentacion.length === 0 ? (
                    <div className="empty-state"><div className="empty-icon">🌿</div><p>Sin suministros registrados aún.</p></div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>ID Registro</th>
                                <th>Animal</th>
                                <th>Alimento</th>
                                <th>Cantidad</th>
                                <th>Fecha</th>
                            </tr>
                        </thead>
                        <tbody>
                            {alimentacion.slice().reverse().slice(0, 20).map(r => (
                                <tr key={r.idRegistro}>
                                    <td className="id-cell" style={{ fontSize: "0.72rem" }}>{r.idRegistro}</td>
                                    <td>{animales.find(a => a.idUnico === r.idAnimal)?.emoji || "🐄"} {r.idAnimal}</td>
                                    <td>{r.tipoAlimento}</td>
                                    <td style={{ color: "var(--green-400)", fontWeight: 700 }}>{r.cantidadGramos} g</td>
                                    <td style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
                                        {new Date(r.fechaSuministro).toLocaleString("es-CO")}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
