import { Animal } from "./Animal.js";
import { EngordeStrategy } from "../strategies/EngordeStrategy.js";

export class Cabra extends Animal {
    constructor(data) {
        super({ ...data, prefijo: "CAB", estrategia: new EngordeStrategy() });
        this.pesoMinimoAdulto = 25.0;
        this.especie = "Cabra";
        this.emoji = "🐐";
    }
    validarPeso(peso) {
        return peso >= 0.5 && peso <= 120;
    }
}
