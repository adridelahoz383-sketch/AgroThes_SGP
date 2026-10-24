// ============================================================
// HOOK: useOCR — OCR con Tesseract.js + cámara trasera
// Desacoplado del store: solo retorna texto y peso detectado.
// El componente decide qué hacer con el resultado.
// ============================================================

import { useState, useRef, useCallback, useEffect } from "react";
import { extractWeightFromOCR } from "../weight.js";

// Carga Tesseract de forma lazy para no bloquear el bundle inicial
let Tesseract = null;
async function getTesseract() {
    if (!Tesseract) {
        const mod = await import("tesseract.js");
        Tesseract = mod.default ?? mod;
    }
    return Tesseract;
}

/**
 * @typedef {Object} OcrState
 * @property {boolean} procesando — OCR en curso
 * @property {string|null} textoOCR — texto crudo detectado
 * @property {number|null} pesoDetectado — peso parseado o null
 * @property {string|null} error — mensaje de error si falla
 */

/**
 * Hook que expone:
 *  - runOCR(fileOrCanvas): ejecuta OCR sobre imagen/frame
 *  - startCamera(): activa cámara trasera
 *  - stopCamera(): detiene cámara
 *  - captureFrame(): toma screenshot del video y corre OCR
 *  - videoRef: ref para el <video>
 *  - previewUrl: URL de objeto de la imagen cargada
 *  - estado: { procesando, textoOCR, pesoDetectado, error }
 *  - resetOCR(): limpia estado
 */
export function useOCR() {
    const [procesando, setProcesando] = useState(false);
    const [textoOCR, setTextoOCR] = useState(null);
    const [pesoDetectado, setPesoDetectado] = useState(null);
    const [error, setError] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [camaraActiva, setCamaraActiva] = useState(false);

    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const throttleRef = useRef(null);
    const autoScanRef = useRef(null);

    // Limpieza al desmontar
    useEffect(() => {
        return () => {
            stopCamera();
            if (throttleRef.current) clearTimeout(throttleRef.current);
            if (autoScanRef.current) clearInterval(autoScanRef.current);
        };
    }, []);

    /** Ejecuta Tesseract sobre un File, Blob o HTMLCanvasElement */
    const runOCR = useCallback(async (source) => {
        setProcesando(true);
        setError(null);
        setTextoOCR(null);
        setPesoDetectado(null);

        try {
            const tess = await getTesseract();
            const { data: { text } } = await tess.recognize(source, "spa", {
                logger: () => {},  // silenciar logs internos
            });

            const textLimpio = text.trim();
            setTextoOCR(textLimpio);

            const peso = extractWeightFromOCR(textLimpio);
            setPesoDetectado(peso);

            if (peso === null) {
                setError("No se detectó un peso válido en la imagen");
            }

            return { textoOCR: textLimpio, pesoDetectado: peso };
        } catch (err) {
            const msg = err.message || "Error ejecutando OCR";
            setError(msg);
            return { textoOCR: null, pesoDetectado: null, error: msg };
        } finally {
            setProcesando(false);
        }
    }, []);

    /** Carga un File y genera preview + ejecuta OCR automáticamente */
    const loadFile = useCallback(async (file) => {
        if (!file) return;
        // Limpiar preview anterior
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        return runOCR(file);
    }, [previewUrl, runOCR]);

    /** Activa la cámara trasera */
    const startCamera = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 } },
                audio: false,
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
            }
            setCamaraActiva(true);

            // Auto-scan cada 500ms con throttle
            autoScanRef.current = setInterval(() => {
                if (!throttleRef.current) {
                    throttleRef.current = setTimeout(() => {
                        throttleRef.current = null;
                    }, 500);
                    captureFrameInternal();
                }
            }, 500);
        } catch (err) {
            setError(`No se pudo acceder a la cámara: ${err.message}`);
        }
    }, []);

    /** Detiene la cámara y el auto-scan */
    const stopCamera = useCallback(() => {
        if (autoScanRef.current) {
            clearInterval(autoScanRef.current);
            autoScanRef.current = null;
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setCamaraActiva(false);
    }, []);

    /** Captura un frame del video y lo pasa a OCR */
    const captureFrameInternal = useCallback(() => {
        if (!videoRef.current || !videoRef.current.videoWidth) return;
        const canvas = document.createElement("canvas");
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        canvas.getContext("2d").drawImage(videoRef.current, 0, 0);
        runOCR(canvas);
    }, [runOCR]);

    /** Captura un frame manualmente y retorna el resultado */
    const captureFrame = useCallback(() => {
        captureFrameInternal();
    }, [captureFrameInternal]);

    const resetOCR = useCallback(() => {
        setTextoOCR(null);
        setPesoDetectado(null);
        setError(null);
        setProcesando(false);
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
        }
    }, [previewUrl]);

    return {
        // Estado
        procesando,
        textoOCR,
        pesoDetectado,
        error,
        previewUrl,
        camaraActiva,
        // Refs
        videoRef,
        // Acciones
        runOCR,
        loadFile,
        startCamera,
        stopCamera,
        captureFrame,
        resetOCR,
    };
}
