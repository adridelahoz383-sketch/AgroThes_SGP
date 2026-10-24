import * as registroService from "../services/registro.service.js";

/**
 * GET /registros
 * Retorna todos los registros de peso.
 */
export const getRegistros = async (req, res, next) => {
  try {
    const registros = await registroService.getAllRegistros();
    res.status(200).json({
      success: true,
      count: registros.length,
      data: registros,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /registros/:id
 * Retorna un registro específico.
 */
export const getRegistro = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: "ID inválido" });
    }

    const registro = await registroService.getRegistroById(id);
    res.status(200).json({ success: true, data: registro });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /registros
 * Crea un nuevo registro de peso para un animal.
 * Body: { peso, animalId, fecha? }
 */
export const createRegistro = async (req, res, next) => {
  try {
    const { peso, animalId, fecha } = req.body;

    // Validaciones básicas
    if (!animalId || peso === undefined) {
      return res.status(400).json({
        success: false,
        message: "Campos requeridos: peso, animalId",
      });
    }

    if (isNaN(parseFloat(peso)) || parseFloat(peso) <= 0) {
      return res.status(400).json({
        success: false,
        message: "El peso debe ser un número positivo",
      });
    }

    if (isNaN(parseInt(animalId))) {
      return res.status(400).json({
        success: false,
        message: "animalId debe ser un número entero válido",
      });
    }

    const registro = await registroService.createRegistro({ peso, animalId, fecha });
    res.status(201).json({ success: true, data: registro });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /registros/:id
 * Elimina un registro de peso.
 */
export const deleteRegistro = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: "ID inválido" });
    }

    await registroService.deleteRegistro(id);
    res.status(200).json({
      success: true,
      message: `Registro con id ${id} eliminado correctamente`,
    });
  } catch (error) {
    next(error);
  }
};
