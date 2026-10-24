import { Animal } from "./Animal.js";
import { EngordeStrategy } from "../strategies/EngordeStrategy.js";

export class Ganso extends Animal {
    constructor(data) {
        super({ ...data, prefijo: "GAN", estrategia: new EngordeStrategy() });
        this.especie = "Ganso";
        this.emoji = "🪿";
    }
    validarPeso(peso) {
        return peso >= 1 && peso <= 6;
    }
}
