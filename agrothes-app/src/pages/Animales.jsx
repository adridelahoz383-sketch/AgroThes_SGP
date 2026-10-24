import { useState } from "react";
import { useAgroStore } from "../store/useAgroStore.js";
import { AnimalFactory } from "../domain/animals/AnimalFactory.js";

const ESPECIES = AnimalFactory.especiesDisponibles();

// Validar que la especie seleccionada siempre esté en la lista permitida
function especieValida(especie) {
    return ESPECIES.some(e => e.especie === especie);
}

// Modal de Edición de Animal
function ModalEditarAnimal({ animal, isOpen, onClose, onSave }) {
    const [formData, setFormData] = useState({
        fechaNacimiento: animal?.fechaNacimiento || "",
        estadoInicial: animal?.estadoInicial || "Activo",
        pesoActual: animal?.pesoActual || 0,
    });
    const [cargando, setCargando] = useState(false);

    const handleSave = async () => {
        setCargando(true);
        try {
            await onSave(formData);
            onClose();
        } finally {
            setCargando(false);
        }
    };

    if (!isOpen || !animal) return null;

    return (
        <div style={{ 
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0, 
            background: "rgba(0,0,0,0.5)", display: "flex", 
            alignItems: "center", justifyContent: "center", zIndex: 1000 
        }}>
            <div className="card" style={{ width: "90%", maxWidth: 500 }}>
                <h2 style={{ marginBottom: 20 }}>Editar {animal.especie}</h2>
                
                <div className="form-group">
                    <label className="form-label">ID Único</label>
                    <input 
                        type="text" 
                        className="form-control" 
                        value={animal.idUnico} 
                        disabled 
                        style={{ background: "var(--bg-secondary)" }}
                    />
                </div>

                <div className="grid-2">
                    <div className="form-group">
                        <label className="form-label">Fecha de Nacimiento</label>
                        <input 
                            type="date" 
                            className="form-control" 
                            value={formData.fechaNacimiento}
                            onChange={e => setFormData({...formData, fechaNacimiento: e.target.value})}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Peso Actual (kg)</label>
                        <input 
                            type="number" 
                            className="form-control" 
                            value={formData.pesoActual}
                            onChange={e => setFormData({...formData, pesoActual: parseFloat(e.target.value) || 0})}
                            step="0.1"
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">Estado</label>
                    <select 
                        className="form-control" 
                        value={formData.estadoInicial}
                        onChange={e => setFormData({...formData, estadoInicial: e.target.value})}
                    >
                        <option>Activo</option>
                        <option>En Cuarentena</option>
                        <option>En Observación</option>
                        <option>Vendido</option>
                    </select>
                </div>

                <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                    <button 
                        className="btn btn-secondary" 
                        onClick={onClose}
                        style={{ flex: 1 }}
                    >
                        Cancelar
                    </button>
                    <button 
                        className="btn btn-primary" 
                        onClick={handleSave}
                        disabled={cargando}
                        style={{ flex: 1 }}
                    >
                        {cargando ? "Guardando..." : "Guardar cambios"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function Animales() {
    const { animales, crearAnimal, actualizarAnimal, eliminarAnimal } = useAgroStore();
    const [especieSeleccionada, setEspecieSeleccionada] = useState("Oveja");
    const [fechaNacimiento, setFechaNacimiento] = useState("");
    const [estadoInicial, setEstadoInicial] = useState("Activo");
    const [cargando, setCargando] = useState(false);
    const [ultimo, setUltimo] = useState(null);
    
    // Estado del modal de edición
    const [modalAbierto, setModalAbierto] = useState(false);
    const [animalEnEdicion, setAnimalEnEdicion] = useState(null);
    const [eliminando, setEliminando] = useState(null);

    const handleCrear = async () => {
        if (!especieSeleccionada || !especieValida(especieSeleccionada)) return;
        setCargando(true);
        const animal = await crearAnimal(especieSeleccionada, {
            fechaNacimiento: fechaNacimiento || new Date().toISOString().split("T")[0],
            estadoInicial,
        });
        setUltimo(animal);
        setCargando(false);
        // Logs de depuración
        setTimeout(() => {
            // eslint-disable-next-line no-console
            console.log('[DEBUG] Estado de animales:', animales);
            // eslint-disable-next-line no-console
            console.log('[DEBUG] Último animal registrado:', animal);
        }, 100);
    };

    const handleEditarAnimal = (animal) => {
        setAnimalEnEdicion(animal);
        setModalAbierto(true);
    };

    const handleGuardarEdicion = async (datosActualizados) => {
        if (!animalEnEdicion) return;
        try {
            await actualizarAnimal(animalEnEdicion.idUnico, datosActualizados);
            // eslint-disable-next-line no-console
            console.log('Animal actualizado:', animalEnEdicion.idUnico);
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Error actualizando animal:', error);
        }
    };

    const handleDarDeBaja = async (animal) => {
        if (confirm(`¿Cambiar estado de ${animal.idUnico} a "Vendido"?`)) {
            try {
                await actualizarAnimal(animal.idUnico, { estadoInicial: "Vendido" });
            } catch (error) {
                // eslint-disable-next-line no-console
                console.error('Error cambiando estado:', error);
            }
        }
    };

    const handleEliminarAnimal = async (animal) => {
        if (confirm(`¿Está seguro de que desea ELIMINAR a ${animal.idUnico}? Esta acción no se puede deshacer.`)) {
            setEliminando(animal.idUnico);
            try {
                await eliminarAnimal(animal.idUnico);
                // eslint-disable-next-line no-console
                console.log('Animal eliminado:', animal.idUnico);
            } catch (error) {
                // eslint-disable-next-line no-console
                console.error('Error eliminando animal:', error);
            } finally {
                setEliminando(null);
            }
        }
    };

    // Chequeo de unicidad de idUnico
    const idSet = new Set();
    const duplicados = animales.filter(a => {
        if (idSet.has(a.idUnico)) return true;
        idSet.add(a.idUnico);
        return false;
    });

    // Log de depuración en cada render
    // eslint-disable-next-line no-console
    console.log('[DEBUG][RENDER] Animales recibidos:', animales);

    return (
        <div className="fade-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Registrar Animal</h1>
                    <p className="page-subtitle">RF-01 · RF-02 — Registro multiespecie con ID jerárquico automático</p>
                </div>
                <span className="chip chip-green">🏭 Factory Method</span>
            </div>

            {/* Selector de especie */}
            <div className="card mb-4">
                <h2 style={{ fontSize: "0.9rem", fontWeight: 700, marginBottom: 16, color: "var(--text-muted)" }}>
                    1. Selecciona la especie
                </h2>
                <div className="especie-grid">
                    {ESPECIES.map(({ especie, prefijo, emoji }, index) => (
                        <button
                            key={especie + '-' + index}
                            className={`especie-btn ${especieSeleccionada === especie ? "selected" : ""}`}
                            onClick={() => setEspecieSeleccionada(especie)}
                        >
                            <span className="emj">{emoji}</span>
                            <span className="lbl">{especie}</span>
                            <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: 4 }}>{prefijo}-XXX</span>
                        </button>
                    ))}
                </div>

                <div className="grid-2 mb-4">
                    <div className="form-group">
                        <label className="form-label">Fecha de Nacimiento</label>
                        <input
                            type="date"
                            className="form-control"
                            value={fechaNacimiento}
                            onChange={e => setFechaNacimiento(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Estado Inicial</label>
                        <select className="form-control" value={estadoInicial} onChange={e => setEstadoInicial(e.target.value)}>
                            <option>Activo</option>
                            <option>En Cuarentena</option>
                            <option>En Observación</option>
                            <option>Vendido</option>
                        </select>
                    </div>
                </div>

                {ultimo && (
                    <div style={{
                        background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.3)",
                        borderRadius: "var(--radius-sm)", padding: "14px 18px", marginBottom: 16,
                        display: "flex", alignItems: "center", gap: 12
                    }}>
                        <span style={{ fontSize: "1.8rem" }}>{ESPECIES.find(e => e.especie === ultimo.especie)?.emoji}</span>
                        <div>
                            <div style={{ fontWeight: 700, color: "var(--green-400)", fontFamily: "monospace", fontSize: "1.1rem" }}>
                                {ultimo.idUnico}
                            </div>
                            <div style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>Creado con AnimalFactory.crear()</div>
                        </div>
                        <span className="chip chip-green" style={{ marginLeft: "auto" }}>REGISTRADO</span>
                    </div>
                )}

                <button className="btn btn-primary" onClick={handleCrear} disabled={cargando}>
                    {cargando ? <span className="spinning">⟳</span> : "🏷️"}
                    {cargando ? "Generando ID..." : "Registrar"}
                </button>
            </div>

            {/* Tabla de animales */}
            {duplicados.length > 0 && (
                <div style={{ background: "#ffeaea", color: "#b91c1c", padding: 12, borderRadius: 6, marginBottom: 12, border: "1px solid #fca5a5" }}>
                    <b>¡Error!</b> Hay animales con <b>ID duplicado</b> en la lista:<br />
                    {duplicados.map(a => a.idUnico).join(", ")}
                </div>
            )}
            <div className="card">
                <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 16 }}>
                    Inventario de Animales <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>({animales.length})</span>
                </h2>
                {animales.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">🐄</div>
                        <p>Sin animales registrados. Crea el primero arriba.</p>
                    </div>
                ) : (
                    <div style={{ overflowX: "auto" }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>ID Único</th>
                                    <th>Especie</th>
                                    <th>F. Nacimiento</th>
                                    <th>Estado</th>
                                    <th>Peso Actual</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {animales.slice().reverse().map(a => (
                                    <tr key={a.idUnico}>
                                        <td className="id-cell">{a.idUnico}</td>
                                        <td>{a.emoji || ""} {a.especie || a.idEspecie}</td>
                                        <td style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>{a.fechaNacimiento}</td>
                                        <td>
                                            <span className={`chip ${a.estadoInicial === "Activo" ? "chip-green" : "chip-amber"}`}>
                                                {a.estadoInicial}
                                            </span>
                                        </td>
                                        <td style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                                            {a.pesoActual > 0 ? `${a.pesoActual} kg` : "—"}
                                        </td>
                                        <td>
                                            <div style={{ display: "flex", gap: 8 }}>
                                                <button 
                                                    className="btn btn-sm btn-primary"
                                                    onClick={() => handleEditarAnimal(a)}
                                                    title="Editar información"
                                                    style={{ padding: "4px 8px", fontSize: "0.85rem" }}
                                                >
                                                    ✏️ Editar
                                                </button>
                                                {a.estadoInicial !== "Vendido" && (
                                                    <button 
                                                        className="btn btn-sm btn-warning"
                                                        onClick={() => handleDarDeBaja(a)}
                                                        title="Dar de baja (cambiar a Vendido)"
                                                        style={{ padding: "4px 8px", fontSize: "0.85rem" }}
                                                    >
                                                        📦 De baja
                                                    </button>
                                                )}
                                                <button 
                                                    className="btn btn-sm btn-danger"
                                                    onClick={() => handleEliminarAnimal(a)}
                                                    disabled={eliminando === a.idUnico}
                                                    title="Eliminar animal"
                                                    style={{ padding: "4px 8px", fontSize: "0.85rem" }}
                                                >
                                                    {eliminando === a.idUnico ? "⟳" : "🗑️"} Eliminar
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal de Edición */}
            <ModalEditarAnimal 
                animal={animalEnEdicion}
                isOpen={modalAbierto}
                onClose={() => {
                    setModalAbierto(false);
                    setAnimalEnEdicion(null);
                }}
                onSave={handleGuardarEdicion}
            />
        </div>
    );
}
