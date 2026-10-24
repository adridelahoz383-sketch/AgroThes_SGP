/**
 * Middleware centralizado de manejo de errores.
 * Captura todos los errores lanzados con next(error) en controladores.
 */
export const errorHandler = (err, req, res, next) => {
  // Log detallado en consola (solo en desarrollo)
  if (process.env.NODE_ENV === "development") {
    console.error("❌ Error:", err.message);
    console.error(err.stack);
  } else {
    console.error("❌ Error:", err.message);
  }

  // Errores de Prisma
  if (err.code === "P2002") {
    return res.status(409).json({
      success: false,
      message: "Ya existe un registro con ese valor único",
      field: err.meta?.target,
    });
  }

  if (err.code === "P2025") {
    return res.status(404).json({
      success: false,
      message: "Registro no encontrado en la base de datos",
    });
  }

  // Errores personalizados (lanzados desde los servicios)
  const statusCode = err.statusCode || 500;
  const message =
    statusCode === 500
      ? "Error interno del servidor"
      : err.message;

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

/**
 * Middleware para rutas no encontradas (404).
 */
export const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
  });
};
