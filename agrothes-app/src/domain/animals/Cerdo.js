import { Animal } from "./Animal.js";
import { EngordeStrategy } from "../strategies/EngordeStrategy.js";

export class Cerdo extends Animal {
    constructor(data) {
        super({ ...data, prefijo: "CER", estrategia: new EngordeStrategy() });
        this.pesoMinimoAdulto = 60.0;
        this.especie = "Cerdo";
        this.emoji = "🐷";
    }
    validarPeso(peso) {
        return peso >= 0.5 && peso <= 350;
    }
}
