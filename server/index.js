import "dotenv/config";
import app from "./src/app.js";
import prisma from "./src/prisma/client.js";

const PORT = process.env.PORT || 3001;

const startServer = async () => {
  try {
    // Verificar conexión a la base de datos antes de arrancar
    await prisma.$connect();
    console.log("✅ Conexión a MySQL establecida correctamente");

    app.listen(PORT, () => {
      console.log("─────────────────────────────────────────");
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
      console.log(`📦 Entorno: ${process.env.NODE_ENV || "development"}`);
      console.log("─────────────────────────────────────────");
      console.log("Endpoints disponibles:");
      console.log(`  GET    http://localhost:${PORT}/animales`);
      console.log(`  POST   http://localhost:${PORT}/animales`);
      console.log(`  GET    http://localhost:${PORT}/animales/:id`);
      console.log(`  PUT    http://localhost:${PORT}/animales/:id`);
      console.log(`  DELETE http://localhost:${PORT}/animales/:id`);
      console.log(`  GET    http://localhost:${PORT}/registros`);
      console.log(`  POST   http://localhost:${PORT}/registros`);
      console.log(`  GET    http://localhost:${PORT}/registros/:id`);
      console.log(`  DELETE http://localhost:${PORT}/registros/:id`);
      console.log("─────────────────────────────────────────");
    });
  } catch (error) {
    console.error("❌ Error al iniciar el servidor:", error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
};

// Cierre limpio al detener el servidor
process.on("SIGINT", async () => {
  console.log("\n🛑 Cerrando servidor...");
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

startServer();