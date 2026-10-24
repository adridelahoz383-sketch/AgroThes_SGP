import { useEffect } from "react";
import { Routes, Route, NavLink, useLocation } from "react-router-dom";
import { useAgroStore } from "../../store/useAgroStore.js";

import Dashboard from "../../pages/Dashboard.jsx";
import Animales from "../../pages/Animales.jsx";
import Biometria from "../../pages/Biometria.jsx";
import Nutricion from "../../pages/Nutricion.jsx";
import IoTCaptura from "../../pages/IoTCaptura.jsx";
import Alertas from "../../pages/Alertas.jsx";

const NAV_ITEMS = [
    { to: "/", icon: "📊", label: "Dashboard" },
    { to: "/animales", icon: "🐄", label: "Animales" },
    { to: "/biometria", icon: "⚖️", label: "Biometría" },
    { to: "/nutricion", icon: "🌿", label: "Nutrición" },
    { to: "/iot", icon: "📡", label: "IoT" },
    { to: "/alertas", icon: "🔔", label: "Alertas" },
];

export default function AppShell() {
    const { inicializar, isOnline, alertas } = useAgroStore();
    const noLeidas = alertas.filter(a => !a.leido).length;
    const location = useLocation();

    useEffect(() => { inicializar(); }, []);

    return (
        <div className="app-shell">
            {/* ── Topbar ── */}
            <header className="topbar">
                <div className="topbar-brand">
                    <span className="logo-icon">🌱</span>
                    AgroThes
                    <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 500, marginLeft: 4 }}>
                        SGP v1.0
                    </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div className={`status-badge ${isOnline ? "online" : "offline"}`}>
                        <span className="status-dot" />
                        {isOnline ? "EN LÍNEA" : "OFFLINE — datos guardados localmente"}
                    </div>
                </div>
            </header>

            {/* ── Sidebar ── */}
            <aside className="sidebar">
                <span className="sidebar-section">Módulos</span>
                {NAV_ITEMS.map(({ to, icon, label }) => (
                    <NavLink
                        key={to}
                        to={to}
                        end={to === "/"}
                        className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
                    >
                        <span className="nav-icon">{icon}</span>
                        {label}
                        {label === "Alertas" && noLeidas > 0 && (
                            <span className="nav-badge">{noLeidas}</span>
                        )}
                    </NavLink>
                ))}

                <div style={{ flex: 1 }} />
                <div style={{ padding: "12px", borderTop: "1px solid var(--border)", fontSize: "0.72rem", color: "var(--text-muted)" }}>
                    <div style={{ marginBottom: 4 }}>Sistema Inteligente de</div>
                    <div style={{ fontWeight: 700, color: "var(--text-secondary)" }}>Gestión y Control Productivo</div>
                    <div style={{ marginTop: 8, opacity: 0.6 }}>Ganado menor · Offline-first</div>
                </div>
            </aside>

            {/* ── Contenido principal ── */}
            <main className="main-content">
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/animales" element={<Animales />} />
                    <Route path="/biometria" element={<Biometria />} />
                    <Route path="/nutricion" element={<Nutricion />} />
                    <Route path="/iot" element={<IoTCaptura />} />
                    <Route path="/alertas" element={<Alertas />} />
                </Routes>
            </main>
        </div>
    );
}
