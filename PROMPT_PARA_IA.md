# 🤖 PROMPT PARA TU COMPAÑERO

Copia y pega esto en tu IA (ChatGPT, Copilot, Claude, etc.) para que genere los mismos archivos de documentación y setup automático:

---

## PROMPT COMPLETO:

```
Necesito que crees una GUÍA COMPLETA DE INSTALACIÓN para mi proyecto full-stack.

ESTRUCTURA DE MI PROYECTO:
- Carpeta: /server - Backend Node.js + Express + Prisma + MySQL
- Carpeta: /agrothes-app - Frontend React + Vite + Zustand

INFORMACIÓN DE LA BASE DE DATOS:
- Motor: MySQL
- Nombre base de datos: agrothes
- Usuario por defecto: root
- Contraseña por defecto: [LA QUE USA EL USUARIO]
- Puerto MySQL: 3306
- Puerto backend: 3001
- Puerto frontend: 5173

INFORMACIÓN DEL PROYECTO:
- Backend: Expresss server con Prisma ORM
- Frontend: React con Vite (hot reload)
- La BD necesita migraciones automáticas con Prisma
- Requisitos: Node.js v18+, MySQL 8+

ARCHIVOS QUE NECESITO:

1. **SETUP.md** - Guía detallada paso a paso con:
   - Requisitos previos
   - Instalación de dependencias
   - Configuración de .env (tanto backend como frontend)
   - Comando para crear la BD
   - Comando para ejecutar migraciones Prisma
   - Cómo ejecutar backend y frontend
   - Troubleshooting de errores comunes
   - Comandos npm disponibles

2. **INSTRUCCIONES_COMPAÑERO.txt** - Versión RÁPIDA con:
   - TL;DR (lo más importante)
   - Comandos exactos que copiar/pegar
   - Checklist de verificación
   - Problemas comunes y soluciones
   - Cómo enviar el proyecto (ZIP o Git)

3. **setup.bat** - Script automático para Windows que:
   - Verifica Node.js está instalado
   - Verifica MySQL está corriendo
   - CREA la BD automáticamente si no existe
   - Instala dependencias backend (npm install)
   - Instala dependencias frontend (npm install)
   - Ejecuta TODAS las migraciones de Prisma automáticamente
   - Genera cliente Prisma
   - Muestra instrucciones finales
   - Maneja errores con mensajes claros
   - NO necesita intervención manual
   - Soporte para cambiar contraseña MySQL

4. **README.md** - Descripción general con:
   - Quick start
   - Estructura del proyecto
   - Cómo compartir con compañeros
   - Endpoints de API
   - Variables de entorno necesarias
   - Stack tecnológico usado
   - Troubleshooting

5. **server/.env.example** - Template que muestre:
   - DATABASE_URL con formato correcto
   - PORT
   - NODE_ENV
   - FRONTEND_URL
   - Comentarios explicativos

6. **agrothes-app/.env.example** - Template que muestre:
   - VITE_API_URL
   - Explicación de qué es

REQUISITOS ESPECIALES:
- El setup.bat DEBE crear la BD automáticamente
- El setup.bat DEBE ejecutar migraciones Prisma sin intervención
- Todos los archivos deben asumir que es primera vez que se instala
- Los archivos deben ser claros y fáciles de seguir
- Incluir emojis para hacerlo visual
- Explicar qué hace cada paso
- No asumir conocimientos técnicos avanzados

POR FAVOR, crea estos 6 archivos completos y listos para usar.
```

---

## CÓMO USAR ESTE PROMPT:

1. **Copia el texto anterior** (desde "Necesito que crees..." hasta el final)
2. **Pégalo en tu IA favorita:**
   - ChatGPT
   - Claude (Anthropic)
   - GitHub Copilot Chat
   - Gemini
   - Otra que uses
3. **La IA generará los 6 archivos**
4. **Tu compañero:**
   - Crea los archivos con los nombres indicados
   - Los pone en la raíz del proyecto (SETUP.md, README.md, etc.)
   - setup.bat en la raíz
   - .env.example en server/ y agrothes-app/
5. **Listo** - El compañero puede doble-click en setup.bat y todo funciona

---

## ⚡ ALTERNATIVA RÁPIDA (Si solo quiere lo mínimo):

```
Crea:
1. SETUP.md - Guía de instalación paso a paso
2. setup.bat - Script que cree BD, instale dependencias y migre automáticamente
3. README.md - Descripción del proyecto

Para un proyecto con:
- Backend: Node.js + Express + Prisma + MySQL
- Frontend: React + Vite
- BD: agrothes en MySQL
- Migraciones con Prisma
```

---

## ✅ RESULTADO ESPERADO:

Después de que la IA genere los archivos, tu compañero tendrá:

```
proyecto/
├── setup.bat              ← Doble click para instalar TODO
├── SETUP.md              ← Guía detallada
├── INSTRUCCIONES_COMPAÑERO.txt ← Versión rápida
├── README.md             ← Descripción proyecto
├── server/
│   ├── .env.example      ← Template variables
│   └── ... (resto del backend)
├── agrothes-app/
│   ├── .env.example      ← Template variables
│   └── ... (resto del frontend)
```

**Cuando tu compañero ejecute setup.bat:**
- ✅ Se crea la BD automáticamente
- ✅ Se instalan todas las dependencias
- ✅ Se ejecutan todas las migraciones
- ✅ Todo listo para `npm run dev`

**Sin necesidad de:**
- ❌ Abrir TablePlus
- ❌ Conectarse manualmente
- ❌ Escribir comandos SQL
- ❌ Configurar nada manualmente

---

## 📝 NOTAS IMPORTANTES:

- Cambiar en el prompt la contraseña MySQL si es diferente (`P1001975952` en tu caso)
- Cambiar nombre del proyecto si es diferente (`agrothes` en tu caso)
- Cambiar puertos si usa otros diferentes
- Si el proyecto es diferente, adaptar la descripción

---

**¡Listo! Tu compañero ya puede crear su propia documentación con este prompt.** 🚀
