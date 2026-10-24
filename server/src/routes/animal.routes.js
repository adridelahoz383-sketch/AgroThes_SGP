import { Router } from "express";
import {
  getAnimales,
  getAnimal,
  createAnimal,
  updateAnimal,
  deleteAnimal,
} from "../controllers/animal.controller.js";

const router = Router();

// GET /animales          → Lista todos los animales
// POST /animales         → Crea un nuevo animal
// GET /animales/:id      → Obtiene un animal con sus registros
// PUT /animales/:id      → Actualiza un animal
// DELETE /animales/:id   → Elimina un animal

router.get("/", getAnimales);
router.post("/", createAnimal);
router.get("/:id", getAnimal);
router.put("/:id", updateAnimal);
router.delete("/:id", deleteAnimal);

export default router;
