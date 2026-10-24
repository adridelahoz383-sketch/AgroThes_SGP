import { Animal } from "./Animal.js";
import { EngordeStrategy } from "../strategies/EngordeStrategy.js";

export class Trucha extends Animal {
    constructor(data) {
        super({ ...data, prefijo: "TRU", estrategia: new EngordeStrategy() });
        this.especie = "Trucha";
        this.emoji = "🐟";
    }
    validarPeso(peso) {
        return peso >= 0.05 && peso <= 3;
    }
}
