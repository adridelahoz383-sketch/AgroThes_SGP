// ============================================================
// GoF: MEMENTO — RegistroMemento
// Captura el estado anterior de un registro biométrico
// para permitir "Deshacer" (Undo) en la UX rural.
// ============================================================

export class RegistroMemento {
    constructor({ idAnimal, peso, fecha, observaciones }) {
        this._idAnimal = idAnimal;
        this._peso = peso;
        this._fecha = fecha;
        this._observaciones = observaciones;
        this._capturedAt = new Date().toISOString();
    }

    getEstado() {
        return {
            idAnimal: this._idAnimal,
            peso: this._peso,
            fecha: this._fecha,
            observaciones: this._observaciones,
        };
    }

    getCapturedAt() {
        return this._capturedAt;
    }
}

// ============================================================
// GoF: MEMENTO — Caretaker
// Almacena hasta MAX_SLOTS snapshots por sesión.
// ============================================================

const MAX_SLOTS = 3;

export class Caretaker {
    constructor() {
        this._historial = []; // stack LIFO
    }

    push(memento) {
        this._historial.push(memento);
        if (this._historial.length > MAX_SLOTS) {
            this._historial.shift(); // elimina el más antiguo
        }
    }

    pop() {
        return this._historial.pop() || null;
    }

    peek() {
        return this._historial.length > 0
            ? this._historial[this._historial.length - 1]
            : null;
    }

    size() {
        return this._historial.length;
    }

    clear() {
        this._historial = [];
    }
}

// Singleton global del caretaker de biometría
export const biometriaCaretaker = new Caretaker();
