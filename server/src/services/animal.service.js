import prisma from "../prisma/client.js";

/**
 * Obtiene todos los animales registrados.
 * Incluye el conteo de registros asociados.
 */
export const getAllAnimales = async () => {
  return await prisma.animal.findMany({
    include: {
      _count: { select: { registros: true } },
    },
    orderBy: { fecha_registro: "desc" },
  });
};

/**
 * Obtiene un animal por su ID.
 * Incluye todos sus registros de peso.
 * @param {number} id
 */
export const getAnimalById = async (id) => {
  const animal = await prisma.animal.findUnique({
    where: { id },
    include: {
      registros: {
        orderBy: { fecha: "desc" },
      },
    },
  });

  if (!animal) {
    const error = new Error(`Animal con id ${id} no encontrado`);
    error.statusCode = 404;
    throw error;
  }

  return animal;
};

/**
 * Crea un nuevo animal.
 * @param {{ tipo: string, codigo: string, estado_salud: string, peso: number }} data
 */
export const createAnimal = async (data) => {
  const { tipo, codigo, estado_salud, peso } = data;

  // Verificar si el código ya existe
  const existente = await prisma.animal.findUnique({ where: { codigo } });
  if (existente) {
    const error = new Error(`Ya existe un animal con el código "${codigo}"`);
    error.statusCode = 409;
    throw error;
  }

  return await prisma.animal.create({
    data: { tipo, codigo, estado_salud, peso: parseFloat(peso) },
  });
};

/**
 * Actualiza un animal existente.
 * @param {number} id
 * @param {object} data
 */
export const updateAnimal = async (id, data) => {
  // Verificar que existe
  await getAnimalById(id);

  return await prisma.animal.update({
    where: { id },
    data,
  });
};

/**
 * Elimina un animal por su ID.
 * @param {number} id
 */
export const deleteAnimal = async (id) => {
  await getAnimalById(id);
  return await prisma.animal.delete({ where: { id } });
};
