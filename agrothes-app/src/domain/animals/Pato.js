import { Animal } from "./Animal.js";
import { EngordeStrategy } from "../strategies/EngordeStrategy.js";

export class Pato extends Animal {
    constructor(data) {
        super({ ...data, prefijo: "PAT", estrategia: new EngordeStrategy() });
        this.especie = "Pato";
        this.emoji = "🦆";
    }
    validarPeso(peso) {
        return peso >= 0.5 && peso <= 4;
    }
}
