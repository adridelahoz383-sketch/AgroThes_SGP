import { Animal } from "./Animal.js";
import { EngordeStrategy } from "../strategies/EngordeStrategy.js";

export class Oveja extends Animal {
    constructor(data) {
        super({ ...data, prefijo: "OVE", estrategia: new EngordeStrategy() });
        this.pesoMinimoAdulto = 30.0;
        this.especie = "Oveja";
        this.emoji = "🐑";
    }
    validarPeso(peso) {
        return peso >= 0.5 && peso <= 150;
    }
}
