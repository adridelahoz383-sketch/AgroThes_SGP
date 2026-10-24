// ============================================================
// GoF: FACTORY METHOD — AnimalFactory
// Instancia la subclase correcta y genera el ID jerárquico.
// ============================================================


import { Cabra } from "./Cabra.js";
import { Oveja } from "./Oveja.js";
import { Gallina } from "./Gallina.js";
// Nuevas subclases (debes crearlas):
import { Conejo } from "./Conejo.js";
import { Cuy } from "./Cuy.js";
import { Codorniz } from "./Codorniz.js";
import { Pato } from "./Pato.js";
import { Ganso } from "./Ganso.js";
import { Pavo } from "./Pavo.js";
import { Tilapia } from "./Tilapia.js";
import { Trucha } from "./Trucha.js";

const MAPA_SPECIES = {
    Conejo: { clase: Conejo, prefijo: "CON" },
    Cuy: { clase: Cuy, prefijo: "CUY" },
    Cabra: { clase: Cabra, prefijo: "CAB" },
    Oveja: { clase: Oveja, prefijo: "OVE" },
    Gallina: { clase: Gallina, prefijo: "GAL" },
    Codorniz: { clase: Codorniz, prefijo: "COD" },
    Pato: { clase: Pato, prefijo: "PAT" },
    Ganso: { clase: Ganso, prefijo: "GAN" },
    Pavo: { clase: Pavo, prefijo: "PAV" },
    Tilapia: { clase: Tilapia, prefijo: "TIL" },
    Trucha: { clase: Trucha, prefijo: "TRU" },
};

export class AnimalFactory {
    /**
     * Genera un ID jerárquico único: "OVE-005"
     * @param {string} prefijo
     * @param {number} correlativo
     */
    static generarId(prefijo, correlativo) {
        return `${prefijo}-${String(correlativo).padStart(3, "0")}`;
    }

    /**
     * Crea una instancia de la subclase Animal correcta.
     * @param {string} especie  — "Cabra" | "Oveja" | "Cerdo" | "Gallina"
     * @param {number} correlativo — número secuencial por especie
     * @param {object} datos — fecha_nacimiento, estadoInicial, etc.
     */
    static crear(especie, correlativo, datos = {}) {
        const config = MAPA_SPECIES[especie];
        if (!config) {
            throw new Error(
                `Especie desconocida: "${especie}". Válidas: ${Object.keys(MAPA_SPECIES).join(", ")}`
            );
        }
        const idUnico = AnimalFactory.generarId(config.prefijo, correlativo);
        return new config.clase({ ...datos, idUnico, idEspecie: especie });
    }

    /**
     * Devuelve las especies soportadas con icono para la UI.
     */
    static especiesDisponibles() {
        return [
            { especie: "Conejo", prefijo: "CON", emoji: "🐇" },
            { especie: "Cuy", prefijo: "CUY", emoji: "🐹" },
            { especie: "Cabra", prefijo: "CAB", emoji: "🐐" },
            { especie: "Oveja", prefijo: "OVE", emoji: "🐑" },
            { especie: "Gallina", prefijo: "GAL", emoji: "🐔" },
            { especie: "Codorniz", prefijo: "COD", emoji: "🦤" },
            { especie: "Pato", prefijo: "PAT", emoji: "🦆" },
            { especie: "Ganso", prefijo: "GAN", emoji: "🪿" },
            { especie: "Pavo", prefijo: "PAV", emoji: "🦃" },
            { especie: "Tilapia", prefijo: "TIL", emoji: "🐟" },
            { especie: "Trucha", prefijo: "TRU", emoji: "🐟" },
        ];
    }
}
