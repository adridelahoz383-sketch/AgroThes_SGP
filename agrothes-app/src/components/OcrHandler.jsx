import React, { useState } from "react";
import handleWeightExtraction from "../infra/weight.js";

// Componente simple para procesar texto OCR y guardar peso
export default function OcrHandler({ ocrText, selectedAnimal }) {
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(false);

    const onProcess = async () => {
        setLoading(true);
        setStatus(null);
        const res = await handleWeightExtraction(ocrText, selectedAnimal);
        setLoading(false);
        if (!res.ok) {
            setStatus({ type: "error", msg: res.error });
            alert(`No se pudo extraer peso: ${res.error}`);
            return;
        }
        setStatus({ type: "ok", msg: `Peso registrado: ${res.registro.peso} kg para ${res.registro.idAnimal}` });
        alert(`Peso registrado: ${res.registro.peso} kg para ${res.registro.idAnimal}`);
    };

    return (
        <div>
            <button className="btn btn-primary" onClick={onProcess} disabled={loading || !ocrText || !selectedAnimal}>
                {loading ? "Procesando..." : "Procesar OCR y Guardar Peso"}
            </button>
            {status && (
                <div style={{ marginTop: 8, color: status.type === "ok" ? "green" : "crimson" }}>{status.msg}</div>
            )}
        </div>
    );
}
