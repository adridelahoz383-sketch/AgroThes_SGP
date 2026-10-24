# 🌾 AgroThes SGP - Sistema de Gestión Pecuaria

**Proyecto de Aula**: Sistema moderno para gestión de animales en granja, biometría, nutrición y alertas de salud.

---

## 🚀 Quick Start

### Para tu PC (Ya configurada)

```bash
# Terminal 1: Backend
cd server
npm run dev

# Terminal 2: Frontend
cd agrothes-app
npm run dev

# Abrir: http://localhost:5173
```

---

## 📤 Compartir con tu Compañero

### Opción 1: Archivo ZIP (Más Simple)
1. Comprime la carpeta `AgroThes_SGP`
2. Envía por email o USB
3. Tu compañero extrae y sigue SETUP.md

### Opción 2: Git (Si trabajarán en equipo)
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <tu-repositorio>
git push -u origin main
```

---

## 📋 Configuración del Compañero

**IMPORTANTE: Leer `SETUP.md` completamente antes de empezar**

### Resumen de pasos:
1. ✅ Tener MySQL instalado
2. ✅ Descargar/clonar proyecto
3. ✅ Crear BD en MySQL: `CREATE DATABASE agrothes;`
4. ✅ Configurar `server/.env` con sus credenciales MySQL
5. ✅ Ejecutar: `cd server && npx prisma migrate deploy`
6. ✅ Instalar dependencias: `npm install` en ambas carpetas
7. ✅ Ejecutar ambos servidores con `npm run dev`

### Opción Automática (Windows)
```bash
double-click setup.bat
```

---

## 📁 Estructura del Proyecto

```
AgroThes_SGP/
├── server/                 # Backend Node.js + Express
│   ├── .env               # Variables de entorno (NO subir a Git)
│   ├── .env.example       # Template de variables
│   ├── package.json
│   ├── prisma/
│   │   ├── schema.prisma  # Esquema de BD
│   │   └── migrations/    # Cambios de BD
│   ├── src/
│   │   ├── controllers/   # Lógica de negocio
│   │   ├── services/      # Servicios
│   │   ├── routes/        # Endpoints API
│   │   └── prisma/        # Cliente Prisma
│   └── index.js           # Servidor Express
│
├── agrothes-app/          # Frontend React + Vite
│   ├── .env               # Variables de entorno
│   ├── .env.example       # Template de variables
│   ├── package.json
│   ├── src/
│   │   ├── pages/         # Páginas principales
│   │   ├── components/    # Componentes React
│   │   ├── domain/        # Lógica de dominio
│   │   ├── infra/         # Infraestructura
│   │   ├── store/         # Estado global (Zustand)
│   │   └── App.jsx
│   ├── vite.config.js
│   └── index.html
│
├── SETUP.md               # 📖 Guía completa de instalación
├── setup.bat              # ⚙️ Script automático (Windows)
└── README.md              # Este archivo
```

---

## 🗄️ Base de Datos

**IMPORTANTE: El compañero DEBE ejecutar las migraciones**

```bash
cd server
npx prisma migrate deploy
```

Esto creará automáticamente todas las tablas:
- `animales` - Registro de animales
- `registros` - Histórico de pesos/biometría

---

## 📡 API Endpoints

El backend expone estos endpoints:

```
GET    /api/animales              - Lista todos los animales
POST   /api/animales              - Crear animal
GET    /api/animales/:id          - Obtener un animal
PUT    /api/animales/:id          - Actualizar animal
DELETE /api/animales/:id          - Eliminar animal

GET    /api/registros             - Listar registros
POST   /api/registros             - Crear registro de peso
```

---

## 🔐 Variables de Entorno

### Backend (server/.env)
```env
DATABASE_URL="mysql://usuario:contraseña@localhost:3306/agrothes"
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### Frontend (agrothes-app/.env)
```env
VITE_API_URL=http://localhost:3001/api
```

---

## ⚙️ Scripts Disponibles

### Backend
```bash
npm run dev              # Servidor con watch mode
npm run start            # Servidor producción
npm run db:migrate       # Ejecutar migraciones
npm run db:studio        # UI para ver la BD
npm run db:reset         # Resetear BD (⚠️ borra datos)
```

### Frontend
```bash
npm run dev              # Servidor desarrollo con hot reload
npm run build            # Build para producción
npm run lint             # Verificar código
npm run preview          # Previsualizar build
```

---

## 🏗️ Arquitectura

### Patrones de Diseño Implementados

- **Factory Method** (AnimalFactory) - Creación polimórfica de animales
- **Observer Pattern** (HealthMonitor) - Sistema de alertas
- **Proxy Pattern** (PersistenceProxy) - Sincronización offline-first
- **Memento Pattern** (RegistroMemento) - Undo de operaciones
- **Saga Pattern** (SyncSaga) - Cola de sincronización con reintentos

### Stack Tecnológico

**Frontend:**
- React 19 + Vite
- Zustand (estado global)
- React Router (navegación)
- IndexedDB (BD local con IDB)
- CSS custom (diseño moderno oscuro)

**Backend:**
- Node.js + Express
- Prisma ORM + MySQL
- dotenv (variables de entorno)
- CORS habilitado

---

## 🐛 Troubleshooting

### Problema: "Cannot find module"
```bash
# Solución:
cd server
npm install
npx prisma generate

cd ../agrothes-app
npm install
```

### Problema: Error de conexión a BD
```
Verificar:
✓ MySQL está corriendo: mysql -u root -p
✓ BD existe: SHOW DATABASES;
✓ Credenciales en .env coinciden
```

### Problema: Puerto 3001 o 5173 en uso
```bash
# Cambiar puerto en server/.env
PORT=3002

# O matar proceso:
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

Ver guía completa en **SETUP.md**

---

## 📞 Soporte

Si hay problemas:
1. Leer **SETUP.md** completamente
2. Verificar variables en `.env`
3. Revisar terminal para errores específicos
4. Reiniciar ambos servidores

---

## 📝 Licencia

Proyecto de aula - Uso académico

---

**¡Éxito con AgroThes! 🌾** 🚀
