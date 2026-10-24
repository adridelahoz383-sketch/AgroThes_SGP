// ============================================================
// IoT / IA — Captura de imagen para pesaje
// Conteo YOLO removido (ver Biometría para OCR completo).
// ============================================================
import { useState } from "react";
import { useAgroStore } from "../store/useAgroStore.js";

export default function IoTCaptura() {
    const { animales, registrarPesajeImagen } = useAgroStore();
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [selectedAnimalImg, setSelectedAnimalImg] = useState("");
    const [uploading, setUploading] = useState(false);
    const [guardado, setGuardado] = useState(false);

    const handleFileChange = (e) => {
        const f = e.target.files?.[0];
        if (!f) return;
        if (!/image\/(jpeg|png|webp)/.test(f.type)) {
            alert("Solo se permiten imágenes JPG/PNG/WebP");
            return;
        }
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setSelectedFile(f);
        setPreviewUrl(URL.createObjectURL(f));
        setGuardado(false);
    };

    const handleGuardar = async () => {
        if (!selectedFile || !selectedAnimalImg) return;
        setUploading(true);
        await registrarPesajeImagen({ idAnimal: selectedAnimalImg, imagenFile: selectedFile });
        setUploading(false);
        setGuardado(true);
        setSelectedFile(null);
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
        setSelectedAnimalImg("");
    };

    return (
        <div className="fade-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Captura IoT</h1>
                    <p className="page-subtitle">RF-06 — Registro de imágenes de pesaje asociadas a animales</p>
                </div>
                <span className="chip chip-blue">📷 IndexedDB</span>
            </div>

            <div style={{ maxWidth: 520 }}>
                <div className="card">
                    <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 16 }}>
                        📷 Asociar imagen de pesaje
                    </h2>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", marginBottom: 20 }}>
                        Sube una foto del pesaje (JPG/PNG/WebP) y asóciala al animal.
                        Para OCR automático usa el módulo <strong>Biometría → Imagen</strong>.
                    </p>

                    {/* Selector de animal */}
                    <div className="form-group" style={{ marginBottom: 14 }}>
                        <label className="form-label">Animal</label>
                        <select className="form-control" value={selectedAnimalImg}
                            onChange={e => setSelectedAnimalImg(e.target.value)}>
                            <option value="">— Asignar a animal —</option>
                            {animales.map(a => (
                                <option key={a.idUnico} value={a.idUnico}>
                                    {a.emoji} {a.idUnico} — {a.especie}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Input de archivo */}
                    <div className="form-group" style={{ marginBottom: 14 }}>
                        <label className="form-label">Foto de báscula</label>
                        <input type="file" accept="image/png,image/jpeg,image/webp"
                            className="form-control" style={{ padding: "6px" }}
                            onChange={handleFileChange} />
                    </div>

                    {/* Preview */}
                    {previewUrl && (
                        <div style={{ marginBottom: 14 }}>
                            <img src={previewUrl} alt="preview" style={{
                                width: "100%", maxHeight: 220,
                                objectFit: "cover", borderRadius: 8,
                                border: "1px solid var(--border)",
                            }} />
                        </div>
                    )}

                    {/* Botón */}
                    <button className="btn btn-primary" style={{ width: "100%" }}
                        onClick={handleGuardar}
                        disabled={!selectedAnimalImg || !selectedFile || uploading}>
                        {uploading
                            ? <><span className="spinning">⟳</span> Guardando...</>
                            : guardado ? "✅ Imagen guardada"
                                : "💾 Guardar imagen"}
                    </button>

                    {guardado && (
                        <div style={{
                            marginTop: 12, padding: "10px 14px", borderRadius: 8,
                            background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)",
                            color: "#4ade80", fontSize: "0.85rem",
                        }}>
                            ✅ Imagen guardada en IndexedDB correctamente.
                        </div>
                    )}
                </div>

                {/* Info de redirección */}
                <div style={{
                    marginTop: 16, padding: "14px 18px", borderRadius: 10,
                    background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.25)",
                    fontSize: "0.82rem", color: "var(--text-muted)",
                }}>
                    <div style={{ fontWeight: 700, color: "#a78bfa", marginBottom: 6 }}>💡 ¿Quieres extraer el peso automáticamente?</div>
                    Ve a <strong>Biometría → tab Imagen</strong> para cargar la foto y ejecutar OCR
                    sobre la lectura de la báscula.
                </div>
            </div>
        </div>
    );
}
