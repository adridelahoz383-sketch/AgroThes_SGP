import { Animal } from "./Animal.js";
import { ProduccionStrategy } from "../strategies/ProduccionStrategy.js";

export class Codorniz extends Animal {
    constructor(data) {
        super({ ...data, prefijo: "COD", estrategia: new ProduccionStrategy() });
        this.especie = "Codorniz";
        this.emoji = "🦤";
    }
    validarPeso(peso) {
        return peso >= 0.05 && peso <= 0.25;
    }
}
