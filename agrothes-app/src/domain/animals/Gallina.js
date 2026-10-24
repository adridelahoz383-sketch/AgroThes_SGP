import { Animal } from "./Animal.js";
import { ProduccionStrategy } from "../strategies/ProduccionStrategy.js";

export class Gallina extends Animal {
    constructor(data) {
        super({ ...data, prefijo: "GAL", estrategia: new ProduccionStrategy() });
        this.cicloPostura = 300;
        this.especie = "Gallina";
        this.emoji = "🐔";
    }
    validarPeso(peso) {
        return peso >= 0.2 && peso <= 6;
    }
}
