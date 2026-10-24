# 🚀 AgroThes SGP - Guía de Instalación para Compañeros

## 📋 Requisitos Previos

Tu compañero necesita tener instalado:
- **Node.js** (v18 o superior): https://nodejs.org/
- **MySQL** (v8 o superior): https://www.mysql.com/
- **Git** (opcional, para clonar): https://git-scm.com/

---

## 📦 Paso 1: Obtener el Proyecto

### Opción A: Descargar como ZIP (Más fácil)
1. Copia la carpeta `AgroThes_SGP` a la PC de tu compañero
2. Ve al siguiente paso

### Opción B: Usar Git (Recomendado para equipos)
```bash
git clone <tu-repositorio-url>
cd AgroThes_SGP
```

---

## 🗄️ Paso 2: Crear la Base de Datos

Tu compañero debe crear la BD en MySQL. Hay dos formas:

### Opción A: Línea de comandos MySQL
```bash
mysql -u root -p
```

Luego en la consola MySQL:
```sql
CREATE DATABASE agrothes CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

### Opción B: Usar MySQL Workbench (GUI)
1. Conectar a la BD local
2. Botón derecho → Crear schema
3. Nombre: `agrothes`
4. Character set: `utf8mb4`
5. Collation: `utf8mb4_unicode_ci`

---

## 🔧 Paso 3: Configurar Variables de Entorno

### Backend (server/.env)

**IMPORTANTE:** El archivo `.env` DEBE existir. Si no está, crear uno con:

```env
# Base de datos MySQL
DATABASE_URL="mysql://root:PASSWORD@localhost:3306/agrothes"

# Puerto del servidor
PORT=3001

# Entorno
NODE_ENV=development

# CORS - Frontend
FRONTEND_URL=http://localhost:5173
```

⚠️ **CAMBIAR**: 
- `PASSWORD` → por la contraseña de MySQL del compañero
- `localhost` → si la BD está en otro servidor
- `agrothes` → si le puso otro nombre a la BD

### Frontend (agrothes-app/.env)

```env
VITE_API_URL=http://localhost:3001/api
```

---

## 📥 Paso 4: Instalar Dependencias

### Backend
```bash
cd server
npm install
```

### Frontend
```bash
cd agrothes-app
npm install
```

---

## 🗃️ Paso 5: Migrar la Base de Datos

Este es el paso **MÁS IMPORTANTE**. Ejecutar en la carpeta `server`:

```bash
cd server
npx prisma migrate deploy
```

Esto ejecutará todas las migraciones y creará las tablas automáticamente.

**Alternativa (si `migrate deploy` da error):**
```bash
npx prisma migrate dev --name init
```

**Para ver la BD en UI visual (opcional):**
```bash
npx prisma studio
```

---

## ▶️ Paso 6: Ejecutar la Aplicación

### Terminal 1 - Backend
```bash
cd server
npm run dev
```

Debería ver:
```
✓ Servidor corriendo en http://localhost:3001
```

### Terminal 2 - Frontend
```bash
cd agrothes-app
npm run dev
```

Debería ver:
```
✓ Servidor Vite corriendo en http://localhost:5173
```

---

## ✅ Verificación

Si todo fue bien:
- ✅ Abre http://localhost:5173 en el navegador
- ✅ Ves la interfaz de AgroThes
- ✅ Puedes registrar animales
- ✅ Los datos se guardan en la BD

---

## 🐛 Problemas Comunes

### ❌ Error: "Cannot find module '@prisma/client'"
**Solución:**
```bash
cd server
npm install
npx prisma generate
```

### ❌ Error: "connect ECONNREFUSED 127.0.0.1:3306"
**Causas:**
- MySQL no está corriendo
- Contraseña incorrecta en `.env`
- BD no existe

**Solución:**
```bash
# Verificar que MySQL está corriendo
mysql -u root -p

# Crear BD si no existe
CREATE DATABASE agrothes;
```

### ❌ Error: "Access denied for user 'root'@'localhost'"
**Solución:**
- Actualizar contraseña en `server/.env`
- O resetear MySQL:
```bash
mysql -u root
SET PASSWORD FOR 'root'@'localhost' = PASSWORD('nueva_contraseña');
```

### ❌ Puerto 3001 o 5173 ya en uso
**Solución:**
```bash
# Cambiar puerto en server/.env
PORT=3002

# O matar el proceso en Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

### ❌ CORS errors
**Si aparecen errores CORS:**
- Verificar que `FRONTEND_URL=http://localhost:5173` en `server/.env`
- Reiniciar ambos servidores

---

## 📝 Resumen de Comandos

```bash
# Clonar o descargar proyecto
git clone <repo> && cd AgroThes_SGP

# Backend - Setup
cd server
npm install
npx prisma migrate deploy  # ← MUY IMPORTANTE

# Frontend - Setup
cd ../agrothes-app
npm install

# Ejecutar (necesita 2 terminales)
# Terminal 1:
cd server && npm run dev

# Terminal 2:
cd agrothes-app && npm run dev

# Luego abrir http://localhost:5173
```

---

## 🔐 Notas de Seguridad

⚠️ **NUNCA subir .env a Git o email sin encriptar**

Crear `.gitignore` si no existe:
```
node_modules/
.env
.env.local
.DS_Store
dist/
build/
```

---

## 📞 Soporte

Si tu compañero tiene problemas:
1. Verificar que MySQL está corriendo
2. Verificar variables en `.env`
3. Ejecutar `npm install` en ambas carpetas
4. Correr migraciones: `npx prisma migrate deploy`
5. Reiniciar ambos servidores

---

**¡Listo! 🎉**
