import { Router } from "express";
import {
  getRegistros,
  getRegistro,
  createRegistro,
  deleteRegistro,
} from "../controllers/registro.controller.js";

const router = Router();

// GET /registros          → Lista todos los registros
// POST /registros         → Crea un nuevo registro de peso
// GET /registros/:id      → Obtiene un registro específico
// DELETE /registros/:id   → Elimina un registro

router.get("/", getRegistros);
router.post("/", createRegistro);
router.get("/:id", getRegistro);
router.delete("/:id", deleteRegistro);

export default router;
