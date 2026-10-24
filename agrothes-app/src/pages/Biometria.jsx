import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useAgroStore } from "../store/useAgroStore.js";
import { useOCR } from "../infra/hooks/useOCR.js";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

const API = "http://localhost:3001";

// ── helpers de estilo ────────────────────────────────────────
const msgStyle = (tipo) => ({
    padding: "10px 14px", borderRadius: 8, marginBottom: 14, fontSize: "0.85rem",
    background: tipo === "ok" ? "rgba(34,197,94,0.12)" : tipo === "undo" ? "rgba(251,191,36,0.12)" : "rgba(239,68,68,0.12)",
    border: `1px solid ${tipo === "ok" ? "rgba(34,197,94,0.35)" : tipo === "undo" ? "rgba(251,191,36,0.35)" : "rgba(239,68,68,0.35)"}`,
    color: tipo === "ok" ? "#4ade80" : tipo === "undo" ? "#fbbf24" : "#f87171",
});

export default function Biometria() {
    const { animales, biometrico, pesajesImagen, registrarPeso, registrarPesajeImagen, deshacerUltimoPeso, canUndo } = useAgroStore();
    const [searchParams] = useSearchParams();

    // ── estado local ──────────────────────────────────────────
    const [idAnimal, setIdAnimal] = useState("");
    const [pesoManual, setPesoManual] = useState("");
    const [mensaje, setMensaje] = useState(null);
    const [modo, setModo] = useState("manual"); // "manual" | "imagen" | "camara"
    const [registrando, setRegistrando] = useState(false);
    const [yaRegistro, setYaRegistro] = useState(false); // anti-duplicado
    const fileRef = useRef(null);

    const { procesando, textoOCR, pesoDetectado, error: ocrError, previewUrl,
        camaraActiva, videoRef, loadFile, startCamera, stopCamera, resetOCR } = useOCR();

    // ── QR param: /biometria?animal=OVE-005 ──────────────────
    useEffect(() => {
        const animalParam = searchParams.get("animal");
        if (animalParam) {
            const existe = animales.find(a => a.idUnico === animalParam);
            setIdAnimal(existe ? animalParam : "");
            if (!existe && animalParam) mostrarMsg("error", `Animal ${animalParam} no encontrado`);
        }
    }, [searchParams, animales]);

    // ── auto-registro cuando OCR detecta peso válido ──────────
    useEffect(() => {
        if (pesoDetectado && idAnimal && !registrando && !yaRegistro) {
            handleRegistrarPeso(pesoDetectado, "OCR imagen");
        }
    }, [pesoDetectado, idAnimal]);

    // ── derivados ─────────────────────────────────────────────
    const animalSel = animales.find(a => a.idUnico === idAnimal);
    const historial = useMemo(() => biometrico.filter(b => b.idAnimal === idAnimal), [biometrico, idAnimal]);
    const histImagenes = useMemo(() => pesajesImagen.filter(p => p.idAnimal === idAnimal), [pesajesImagen, idAnimal]);
    const chartData = historial.map((b, i) => ({
        registro: `R${i + 1}`, peso: b.peso,
        fecha: new Date(b.fecha).toLocaleDateString("es-CO"),
    }));

    const mostrarMsg = (tipo, texto) => {
        setMensaje({ tipo, texto });
        setTimeout(() => setMensaje(null), 4000);
    };

    // ── registrar peso (manual u OCR) ─────────────────────────
    const handleRegistrarPeso = useCallback(async (pesoVal, obs = "") => {
        if (!idAnimal) { mostrarMsg("error", "⚠️ Selecciona un animal primero"); return; }
        if (!pesoVal || pesoVal <= 0) { mostrarMsg("error", "⚠️ Peso inválido"); return; }
        setRegistrando(true);
        setYaRegistro(true);
        try {
            const registro = await registrarPeso({
                idAnimal, especie: animalSel?.especie || idAnimal,
                emoji: animalSel?.emoji || "🐄", peso: pesoVal,
                observaciones: obs,
            });
            // Sync backend
            try {
                await fetch(`${API}/registros`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ animalId: registro.idAnimal, peso: pesoVal, observaciones: obs }),
                });
            } catch { /* offline — IndexedDB tiene el dato */ }

            // Guardar imagen si hay una
            if (previewUrl && fileRef.current?.files?.[0]) {
                await registrarPesajeImagen({ idAnimal, imagenFile: fileRef.current.files[0] });
            }
            mostrarMsg("ok", `✅ ${pesoVal} kg registrado para ${idAnimal}`);
            setPesoManual("");
            resetOCR();
            stopCamera();
            if (fileRef.current) fileRef.current.value = "";
        } catch (e) {
            mostrarMsg("error", `Error: ${e.message}`);
        } finally {
            setRegistrando(false);
            setTimeout(() => setYaRegistro(false), 3000);
        }
    }, [idAnimal, animalSel, registrarPeso, registrarPesajeImagen, previewUrl, resetOCR, stopCamera]);

    const handleUndo = async () => {
        const estado = await deshacerUltimoPeso();
        if (estado) mostrarMsg("undo", `↩ Revertido a ${estado.peso} kg`);
    };

    const handleFileChange = async (e) => {
        const f = e.target.files?.[0];
        if (!f) return;
        setYaRegistro(false);
        await loadFile(f);
    };

    const handleModoChange = (nuevoModo) => {
        setModo(nuevoModo);
        resetOCR();
        stopCamera();
        if (fileRef.current) fileRef.current.value = "";
    };

    const tooltipStyle = {
        backgroundColor: "#0f2040", border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 8, color: "#f0f6ff", fontSize: 12,
    };

    // ── OCR status badge ──────────────────────────────────────
    const renderOCRStatus = () => {
        if (procesando) return (
            <div style={{ ...msgStyle("undo"), display: "flex", alignItems: "center", gap: 8 }}>
                <span className="spinning">⟳</span> Procesando imagen con OCR...
            </div>
        );
        if (ocrError && !pesoDetectado) return <div style={msgStyle("error")}>❌ {ocrError}</div>;
        if (textoOCR) return (
            <div style={{ background: "var(--bg-surface)", borderRadius: 8, padding: "10px 14px", marginBottom: 14, fontSize: "0.82rem" }}>
                <div style={{ color: "var(--text-muted)", marginBottom: 4 }}>Texto detectado:</div>
                <div style={{ fontFamily: "monospace", color: "#94d2ff", marginBottom: 8 }}>"{textoOCR}"</div>
                {pesoDetectado ? (
                    <div style={{ color: "#4ade80", fontWeight: 700, fontSize: "1.1rem" }}>
                        ⚖️ Peso interpretado: {pesoDetectado} kg
                    </div>
                ) : (
                    <div style={{ color: "#f87171" }}>No se pudo interpretar un peso válido</div>
                )}
            </div>
        );
        return null;
    };

    return (
        <div className="fade-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Registro Biométrico</h1>
                    <p className="page-subtitle">RF-03 — Pesaje manual, OCR desde imagen o cámara en tiempo real</p>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                    <span className="chip chip-blue">👁️ Observer</span>
                    <span className="chip chip-amber">↩ Memento</span>
                    <span className="chip" style={{ background: "rgba(139,92,246,0.15)", color: "#a78bfa", border: "1px solid rgba(139,92,246,0.3)" }}>📷 OCR</span>
                </div>
            </div>

            <div className="grid-2 mb-4">
                {/* ── Panel izquierdo: formulario ── */}
                <div className="card">
                    <h2 style={{ fontSize: "0.9rem", fontWeight: 700, marginBottom: 16, color: "var(--text-muted)" }}>
                        Registrar pesaje
                    </h2>

                    {mensaje && <div style={msgStyle(mensaje.tipo)}>{mensaje.texto}</div>}

                    {/* Selector de animal */}
                    <div className="form-group mb-4">
                        <label className="form-label">Animal *</label>
                        <select className="form-control" value={idAnimal} onChange={e => setIdAnimal(e.target.value)}>
                            <option value="">— Seleccionar animal —</option>
                            {animales.map(a => (
                                <option key={a.idUnico} value={a.idUnico}>
                                    {a.emoji} {a.idUnico} — {a.especie}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Info del animal seleccionado */}
                    {animalSel && (
                        <div style={{
                            background: "var(--bg-surface)", borderRadius: 8,
                            padding: "10px 14px", marginBottom: 14, fontSize: "0.82rem",
                            display: "flex", alignItems: "center", gap: 10,
                        }}>
                            <span style={{ fontSize: "1.8rem" }}>{animalSel.emoji}</span>
                            <div>
                                <div style={{ fontFamily: "monospace", fontWeight: 700, color: "var(--green-400)" }}>{animalSel.idUnico}</div>
                                <div style={{ color: "var(--text-muted)" }}>
                                    Último peso: {historial.length > 0 ? `${historial.at(-1).peso} kg` : "Sin registros"}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tabs de modo */}
                    <div style={{ display: "flex", gap: 4, marginBottom: 16, background: "var(--bg-surface)", borderRadius: 8, padding: 4 }}>
                        {[["manual", "✏️ Manual"], ["imagen", "🖼️ Imagen"], ["camara", "📹 Cámara"]].map(([m, label]) => (
                            <button key={m} onClick={() => handleModoChange(m)} style={{
                                flex: 1, padding: "6px 0", borderRadius: 6, border: "none",
                                cursor: "pointer", fontSize: "0.78rem", fontWeight: 600,
                                background: modo === m ? "var(--blue-600, #2563eb)" : "transparent",
                                color: modo === m ? "#fff" : "var(--text-muted)",
                                transition: "all 0.2s",
                            }}>
                                {label}
                            </button>
                        ))}
                    </div>

                    {/* ── Modo Manual ── */}
                    {modo === "manual" && (
                        <div className="form-group mb-4">
                            <label className="form-label">Peso (kg)</label>
                            <input type="number" step="0.1" min="0" max="40"
                                className="form-control" placeholder="ej: 28.5"
                                value={pesoManual} onChange={e => setPesoManual(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && handleRegistrarPeso(parseFloat(pesoManual), "Manual")}
                            />
                        </div>
                    )}

                    {/* ── Modo Imagen ── */}
                    {modo === "imagen" && (
                        <div>
                            <div className="form-group mb-4">
                                <label className="form-label">Foto de báscula (JPG/PNG)</label>
                                <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp"
                                    className="form-control" style={{ padding: "6px" }}
                                    onChange={handleFileChange} />
                            </div>
                            {previewUrl && (
                                <div style={{ marginBottom: 12 }}>
                                    <img src={previewUrl} alt="preview" style={{
                                        width: "100%", maxHeight: 180, objectFit: "cover",
                                        borderRadius: 8, border: "1px solid var(--border)",
                                    }} />
                                </div>
                            )}
                            {renderOCRStatus()}
                        </div>
                    )}

                    {/* ── Modo Cámara ── */}
                    {modo === "camara" && (
                        <div>
                            <video ref={videoRef} playsInline muted style={{
                                width: "100%", maxHeight: 200, borderRadius: 8,
                                background: "#000", objectFit: "cover",
                                display: camaraActiva ? "block" : "none",
                                marginBottom: 10, border: "1px solid var(--border)",
                            }} />
                            {!camaraActiva ? (
                                <button className="btn btn-secondary" style={{ width: "100%", marginBottom: 10 }}
                                    onClick={startCamera}>
                                    📹 Activar cámara
                                </button>
                            ) : (
                                <button className="btn" style={{ width: "100%", marginBottom: 10, background: "rgba(239,68,68,0.15)", color: "#f87171", border: "1px solid rgba(239,68,68,0.3)" }}
                                    onClick={stopCamera}>
                                    ⏹ Detener cámara
                                </button>
                            )}
                            {renderOCRStatus()}
                            {camaraActiva && !pesoDetectado && (
                                <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", textAlign: "center" }}>
                                    Apunta la cámara a la báscula — escaneo automático cada 500ms
                                </div>
                            )}
                        </div>
                    )}

                    {/* Botones de acción */}
                    <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                        {modo === "manual" ? (
                            <button className="btn btn-primary"
                                onClick={() => handleRegistrarPeso(parseFloat(pesoManual), "Manual")}
                                disabled={registrando || !idAnimal || !pesoManual}
                                style={{ flex: 1 }}>
                                {registrando ? <><span className="spinning">⟳</span> Guardando...</> : "⚖️ Registrar Peso"}
                            </button>
                        ) : (
                            <button className="btn btn-primary"
                                onClick={() => pesoDetectado && handleRegistrarPeso(pesoDetectado, "OCR imagen")}
                                disabled={registrando || !idAnimal || !pesoDetectado || yaRegistro}
                                style={{ flex: 1 }}>
                                {registrando ? <><span className="spinning">⟳</span> Guardando...</> :
                                    yaRegistro ? "✅ Registrado" : `⚖️ Confirmar ${pesoDetectado ? pesoDetectado + " kg" : ""}`}
                            </button>
                        )}
                        <button className="btn btn-undo" onClick={handleUndo}
                            disabled={!canUndo()} title="Deshacer último pesaje (Memento)">
                            ↩ Deshacer
                        </button>
                    </div>
                </div>

                {/* ── Curva de crecimiento ── */}
                <div className="card">
                    <h2 style={{ fontSize: "0.9rem", fontWeight: 700, marginBottom: 16, color: "var(--text-muted)" }}>
                        Curva de crecimiento — {idAnimal || "Selecciona un animal"}
                    </h2>
                    {chartData.length >= 2 ? (
                        <ResponsiveContainer width="100%" height={260}>
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="registro" tick={{ fill: "#94aed4", fontSize: 11 }} />
                                <YAxis tick={{ fill: "#94aed4", fontSize: 11 }} unit="kg" />
                                <Tooltip contentStyle={tooltipStyle}
                                    formatter={(v) => [`${v} kg`, "Peso"]}
                                    labelFormatter={(l, items) => `${l} — ${items?.[0]?.payload?.fecha || ""}`} />
                                <Line type="monotone" dataKey="peso" stroke="#22c55e" strokeWidth={2.5}
                                    dot={{ fill: "#22c55e", r: 5 }} activeDot={{ r: 7, fill: "#4ade80" }} />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="empty-state">
                            <div className="empty-icon">📈</div>
                            <p>{idAnimal ? "Registra al menos 2 pesajes para ver la curva." : "Selecciona un animal."}</p>
                        </div>
                    )}

                    {/* Galería de imágenes */}
                    {histImagenes.length > 0 && (
                        <div style={{ marginTop: 16 }}>
                            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: 8 }}>
                                📷 Imágenes de pesaje ({histImagenes.length})
                            </div>
                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                {histImagenes.slice().reverse().slice(0, 6).map(p => (
                                    <img key={p.id}
                                        src={p.imagen ? URL.createObjectURL(p.imagen) : ""}
                                        alt="pesaje"
                                        style={{ width: 80, height: 60, objectFit: "cover", borderRadius: 6, border: "1px solid var(--border)" }} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Histórico biométrico ── */}
            <div className="card">
                <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 16 }}>
                    Histórico Biométrico
                    <span style={{ color: "var(--text-muted)", fontWeight: 400, fontSize: "0.85rem", marginLeft: 8 }}>
                        ({biometrico.length} registros totales)
                    </span>
                </h2>
                {biometrico.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">🗄️</div>
                        <p>Sin registros biométricos aún.</p>
                    </div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>ID Registro</th><th>Animal</th><th>Peso</th><th>Fecha</th><th>Observaciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {biometrico.slice().reverse().slice(0, 20).map(b => (
                                <tr key={b.idRegistro}>
                                    <td className="id-cell" style={{ fontSize: "0.72rem" }}>{b.idRegistro}</td>
                                    <td>{b.emoji} {b.idAnimal}</td>
                                    <td style={{ color: "var(--blue-400)", fontWeight: 700 }}>{b.peso} kg</td>
                                    <td style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
                                        {new Date(b.fecha).toLocaleString("es-CO")}
                                    </td>
                                    <td style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>{b.observaciones || "—"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
