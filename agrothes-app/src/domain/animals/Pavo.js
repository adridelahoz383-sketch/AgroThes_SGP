import { Animal } from "./Animal.js";
import { EngordeStrategy } from "../strategies/EngordeStrategy.js";

export class Pavo extends Animal {
    constructor(data) {
        super({ ...data, prefijo: "PAV", estrategia: new EngordeStrategy() });
        this.especie = "Pavo";
        this.emoji = "🦃";
    }
    validarPeso(peso) {
        return peso >= 0.5 && peso <= 10;
    }
}
