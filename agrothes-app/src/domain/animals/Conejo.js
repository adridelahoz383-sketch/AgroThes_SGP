import { Animal } from "./Animal.js";
import { EngordeStrategy } from "../strategies/EngordeStrategy.js";

export class Conejo extends Animal {
    constructor(data) {
        super({ ...data, prefijo: "CON", estrategia: new EngordeStrategy() });
        this.especie = "Conejo";
        this.emoji = "🐇";
    }
    validarPeso(peso) {
        return peso >= 0.5 && peso <= 4;
    }
}
