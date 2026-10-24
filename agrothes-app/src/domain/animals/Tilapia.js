import { Animal } from "./Animal.js";
import { EngordeStrategy } from "../strategies/EngordeStrategy.js";

export class Tilapia extends Animal {
    constructor(data) {
        super({ ...data, prefijo: "TIL", estrategia: new EngordeStrategy() });
        this.especie = "Tilapia";
        this.emoji = "🐟";
    }
    validarPeso(peso) {
        return peso >= 0.05 && peso <= 2;
    }
}
