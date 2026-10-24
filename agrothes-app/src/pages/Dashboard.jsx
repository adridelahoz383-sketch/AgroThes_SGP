import { useMemo } from "react";
import { useAgroStore } from "../store/useAgroStore.js";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar,
} from "recharts";

const ANIMALES_POR_ESPECIE_COLOR = {
    Conejo: "#b4b4b4",
    Cuy: "#eab308",
    Cabra: "#22c55e",
    Oveja: "#60a5fa",
    Gallina: "#facc15",
    Codorniz: "#a3e635",
    Pato: "#38bdf8",
    Ganso: "#fbbf24",
    Pavo: "#f472b6",
    Tilapia: "#818cf8",
    Trucha: "#0ea5e9",
};

function KPICard({ icon, value, label, delta, deltaDir }) {
    return (
        <div className="kpi-card">
            <span className="kpi-icon">{icon}</span>
            <span className="kpi-value">{value}</span>
            <span className="kpi-label">{label}</span>
            {delta && (
                <span className={`kpi-delta ${deltaDir}`}>
                    {deltaDir === "up" ? "▲" : "▼"} {delta}
                </span>
            )}
        </div>
    );
}

export default function Dashboard() {
    const { animales, biometrico, alimentacion, alertas } = useAgroStore();

    const totalAnimales = animales.length;
    const noLeidas = alertas.filter(a => !a.leido).length;

    // Agrupar biométrico por animal — últimos 7 registros
    const biometricoChart = useMemo(() => {
        const byAnimal = {};
        biometrico.forEach(b => {
            if (!byAnimal[b.idAnimal]) byAnimal[b.idAnimal] = [];
            byAnimal[b.idAnimal].push(b);
        });
        // Tomar los primeros 3 animales para el gráfico
        const animalesChart = Object.keys(byAnimal).slice(0, 3);
        const maxLen = Math.max(...animalesChart.map(id => byAnimal[id].length), 0);
        if (maxLen === 0) return [];

        const data = [];
        for (let i = 0; i < maxLen; i++) {
            const point = { fecha: `R${i + 1}` };
            animalesChart.forEach(id => {
                const reg = byAnimal[id][i];
                if (reg) point[id] = reg.peso;
            });
            data.push(point);
        }
        return { data, keys: animalesChart };
    }, [biometrico]);

    // Distribución por especie
    const especieStats = useMemo(() => {
        const counts = {};
        animales.forEach(a => {
            counts[a.especie || a.idEspecie] = (counts[a.especie || a.idEspecie] || 0) + 1;
        });
        return Object.entries(counts).map(([especie, cantidad]) => ({
            especie,
            cantidad,
            fill: ANIMALES_POR_ESPECIE_COLOR[especie] || "#94aed4",
        }));
    }, [animales]);

    // Promedio de pesos por especie (Anterior vs Actual)
    const biometriaResumen = useMemo(() => {
        const res = {};
        biometrico.forEach(b => {
            const especie = animales.find(a => a.idUnico === b.idAnimal)?.especie || b.especie || "?";
            if (!res[especie]) res[especie] = { pesos: [] };
            res[especie].pesos.push(b.peso);
        });
        return Object.entries(res).map(([especie, { pesos }]) => {
            const n = pesos.length;
            const anterior = n > 1 ? parseFloat((pesos.slice(0, Math.floor(n / 2)).reduce((s, v) => s + v, 0) / Math.floor(n / 2)).toFixed(1)) : 0;
            const actual = parseFloat((pesos.slice(Math.floor(n / 2)).reduce((s, v) => s + v, 0) / Math.ceil(n / 2)).toFixed(1));
            return { especie, anterior, actual };
        });
    }, [biometrico, animales]);

    const tooltipStyle = {
        backgroundColor: "#0f2040", border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 8, color: "#f0f6ff", fontSize: 12,
    };

    return (
        <div className="fade-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Dashboard General</h1>
                    <p className="page-subtitle">Estado actual del sistema de gestión productiva</p>
                </div>
            </div>

            {/* KPIs */}
            <div className="kpi-grid mb-6">
                <KPICard icon="🐄" value={totalAnimales} label="Animales registrados" />
                <KPICard icon="📊" value={biometrico.length} label="Registros biométricos" />
                <KPICard icon="🌿" value={alimentacion.length} label="Suministros nutricionales" />
                <KPICard icon="🔔" value={noLeidas} label="Alertas activas" deltaDir={noLeidas > 0 ? "down" : undefined} />
            </div>

            {/* Gráficas principales */}
            <div className="grid-2 mb-6">
                {/* Curvas de Crecimiento — RF-05 */}
                <div className="card">
                    <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 16 }}>
                        📈 Curvas de Crecimiento (Estado Anterior vs Actual)
                    </h2>
                    {biometriaResumen.length > 0 ? (
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={biometriaResumen}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="especie" tick={{ fill: "#94aed4", fontSize: 12 }} />
                                <YAxis tick={{ fill: "#94aed4", fontSize: 12 }} unit="kg" />
                                <Tooltip contentStyle={tooltipStyle} />
                                <Legend wrapperStyle={{ fontSize: 12, color: "#94aed4" }} />
                                <Bar dataKey="anterior" name="Peso Anterior" fill="#334d6e" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="actual" name="Peso Actual" fill="#22c55e" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="empty-state">
                            <div className="empty-icon">📊</div>
                            <p>Sin datos biométricos aún. Registra pesajes para ver las curvas.</p>
                        </div>
                    )}
                </div>

                {/* Distribución por especie */}
                <div className="card">
                    <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 16 }}>
                        🐑 Distribución por Especie
                    </h2>
                    {especieStats.length > 0 ? (
                        <>
                            <ResponsiveContainer width="100%" height={180}>
                                <BarChart data={especieStats} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                    <XAxis type="number" tick={{ fill: "#94aed4", fontSize: 12 }} />
                                    <YAxis dataKey="especie" type="category" tick={{ fill: "#94aed4", fontSize: 12 }} width={60} />
                                    <Tooltip contentStyle={tooltipStyle} />
                                    <Bar dataKey="cantidad" name="Animales" radius={[0, 4, 4, 0]}>
                                        {especieStats.map((e, i) => (
                                            <rect key={i} fill={e.fill} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                            <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 8 }}>
                                {especieStats.map(({ especie, cantidad, fill }) => (
                                    <span key={especie} style={{
                                        background: `${fill}22`, color: fill,
                                        border: `1px solid ${fill}44`,
                                        padding: "3px 12px", borderRadius: 999, fontSize: "0.78rem", fontWeight: 700
                                    }}>
                                        {especie}: {cantidad}
                                    </span>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="empty-state">
                            <div className="empty-icon">🐄</div>
                            <p>Sin animales registrados aún.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Últimas alertas del Observer */}
            {alertas.length > 0 && (
                <div className="card">
                    <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 16 }}>
                        🔔 Últimas alertas del sistema
                    </h2>
                    {alertas.slice(0, 4).map(a => (
                        <div key={a.id} className={`alert-item ${a.nivel} ${a.leido ? "leido" : ""}`}>
                            <span className="alert-icon">{a.nivel === "error" ? "🚨" : "⚠️"}</span>
                            <div>
                                <div className="alert-msg">{a.mensaje}</div>
                                <div className="alert-det">{a.detalle}</div>
                                <div className="alert-fecha">{new Date(a.fecha).toLocaleString("es-CO")}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
