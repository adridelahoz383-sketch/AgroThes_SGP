import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

// Parsear la DATABASE_URL para extraer los parámetros de conexión
// Formato: mysql://user:password@host:port/database
const parseDbUrl = (url) => {
  try {
    const parsed = new URL(url);
    return {
      host: parsed.hostname,
      port: parseInt(parsed.port) || 3306,
      user: decodeURIComponent(parsed.username),
      password: decodeURIComponent(parsed.password),
      database: parsed.pathname.replace("/", ""),
      connectionLimit: 5,
    };
  } catch {
    throw new Error("DATABASE_URL inválida. Formato esperado: mysql://user:password@host:port/database");
  }
};

const dbConfig = parseDbUrl(process.env.DATABASE_URL);

// Adaptador Prisma v7 para MySQL/MariaDB
const adapter = new PrismaMariaDb(dbConfig);

// Singleton: reutilizar la misma instancia en toda la app
const prisma = new PrismaClient({
  adapter,
  log:
    process.env.NODE_ENV === "development"
      ? ["query", "error", "warn"]
      : ["error"],
});

export default prisma;
