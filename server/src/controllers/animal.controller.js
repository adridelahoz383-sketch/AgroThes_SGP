import * as animalService from "../services/animal.service.js";

/**
 * GET /animales
 * Retorna la lista completa de animales.
 */
export const getAnimales = async (req, res, next) => {
  try {
    const animales = await animalService.getAllAnimales();
    res.status(200).json({
      success: true,
      count: animales.length,
      data: animales,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /animales/:id
 * Retorna un animal específico con sus registros de peso.
 */
export const getAnimal = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: "ID inválido" });
    }

    const animal = await animalService.getAnimalById(id);
    res.status(200).json({ success: true, data: animal });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /animales
 * Crea un nuevo animal.
 * Body: { tipo, codigo, estado_salud, peso }
 */
export const createAnimal = async (req, res, next) => {
  try {
    const { tipo, codigo, estado_salud, peso } = req.body;

    // Validaciones básicas
    if (!tipo || !codigo || !estado_salud || peso === undefined) {
      return res.status(400).json({
        success: false,
        message: "Campos requeridos: tipo, codigo, estado_salud, peso",
      });
    }

    if (isNaN(parseFloat(peso)) || parseFloat(peso) <= 0) {
      return res.status(400).json({
        success: false,
        message: "El peso debe ser un número positivo",
      });
    }

    const animal = await animalService.createAnimal({ tipo, codigo, estado_salud, peso });
    res.status(201).json({ success: true, data: animal });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /animales/:id
 * Actualiza los datos de un animal.
 */
export const updateAnimal = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: "ID inválido" });
    }

    const animal = await animalService.updateAnimal(id, req.body);
    res.status(200).json({ success: true, data: animal });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /animales/:id
 * Elimina un animal y sus registros asociados.
 */
export const deleteAnimal = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: "ID inválido" });
    }

    await animalService.deleteAnimal(id);
    res.status(200).json({
      success: true,
      message: `Animal con id ${id} eliminado correctamente`,
    });
  } catch (error) {
    next(error);
  }
};
