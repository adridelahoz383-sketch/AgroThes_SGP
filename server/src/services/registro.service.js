import prisma from "../prisma/client.js";
import { getAnimalById } from "./animal.service.js";

/**
 * Obtiene todos los registros de peso.
 * Incluye información del animal asociado.
 */
export const getAllRegistros = async () => {
  return await prisma.registro.findMany({
    include: {
      animal: {
        select: { id: true, tipo: true, codigo: true },
      },
    },
    orderBy: { fecha: "desc" },
  });
};

/**
 * Obtiene un registro por su ID.
 * @param {number} id
 */
export const getRegistroById = async (id) => {
  const registro = await prisma.registro.findUnique({
    where: { id },
    include: { animal: true },
  });

  if (!registro) {
    const error = new Error(`Registro con id ${id} no encontrado`);
    error.statusCode = 404;
    throw error;
  }

  return registro;
};

/**
 * Crea un nuevo registro de peso para un animal.
 * También actualiza el peso actual del animal.
 * @param {{ peso: number, animalId: number, fecha?: Date }} data
 */
export const createRegistro = async (data) => {
  const { peso, animalId, fecha } = data;

  // Verificar que el animal existe
  await getAnimalById(Number(animalId));

  // Transacción: crear registro y actualizar peso del animal
  const [registro] = await prisma.$transaction([
    prisma.registro.create({
      data: {
        peso: parseFloat(peso),
        animalId: Number(animalId),
        fecha: fecha ? new Date(fecha) : new Date(),
      },
      include: { animal: { select: { id: true, tipo: true, codigo: true } } },
    }),
    prisma.animal.update({
      where: { id: Number(animalId) },
      data: { peso: parseFloat(peso) },
    }),
  ]);

  return registro;
};

/**
 * Elimina un registro por su ID.
 * @param {number} id
 */
export const deleteRegistro = async (id) => {
  await getRegistroById(id);
  return await prisma.registro.delete({ where: { id } });
};
