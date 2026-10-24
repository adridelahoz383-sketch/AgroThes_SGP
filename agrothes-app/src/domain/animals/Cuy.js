import { Animal } from "./Animal.js";
import { EngordeStrategy } from "../strategies/EngordeStrategy.js";

export class Cuy extends Animal {
    constructor(data) {
        super({ ...data, prefijo: "CUY", estrategia: new EngordeStrategy() });
        this.especie = "Cuy";
        this.emoji = "🐹";
    }
    validarPeso(peso) {
        return peso >= 0.2 && peso <= 1.5;
    }
}
