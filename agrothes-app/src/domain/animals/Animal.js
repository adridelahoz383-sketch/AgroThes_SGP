// ============================================================
// GoF: FACTORY METHOD — Clase Base Abstracta
// Cada subclase define su prefijo, validaciones y estrategia ICA.
// ============================================================

export class Animal {
  constructor({ idUnico, idEspecie, prefijo, fechaNacimiento, estadoInicial, estrategia }) {
    if (new.target === Animal) {
      throw new Error("Animal es una clase abstracta. Usa AnimalFactory.crear()");
    }
    this.idUnico = idUnico;
    this.idEspecie = idEspecie;
    this.prefijo = prefijo;
    this.fechaNacimiento = fechaNacimiento || new Date().toISOString().split("T")[0];
    this.estadoInicial = estadoInicial || "Activo";
    this.estrategia = estrategia || null; // GoF Strategy — se inyecta vía Factory
    this.pesoActual = 0;
    this.pesoAnterior = 0;
  }

  // ── Template Method: subclases deben implementar validarPeso ──
  validarPeso(peso) {
    throw new Error("validarPeso() debe ser implementado por la subclase.");
  }

  // ── Strategy Pattern: delega el cálculo al objeto estrategia ──
  calcularICA(alimentoGramos) {
    if (!this.estrategia) return null;
    return this.estrategia.calcular(this.pesoActual, this.pesoAnterior, alimentoGramos);
  }

  setEstrategia(estrategia) {
    this.estrategia = estrategia;
  }

  registrarPeso(nuevoPeso) {
    this.pesoAnterior = this.pesoActual;
    this.pesoActual = nuevoPeso;
  }

  toPlainObject() {
    return {
      idUnico: this.idUnico,
      idEspecie: this.idEspecie,
      prefijo: this.prefijo,
      fechaNacimiento: this.fechaNacimiento,
      estadoInicial: this.estadoInicial,
      pesoActual: this.pesoActual,
      pesoAnterior: this.pesoAnterior,
      estrategiaTipo: this.estrategia?.tipo || null,
    };
  }
}
