# CONVERTIR_APP

Prompt operativo para convertir AgroThes SGP, actualmente una app web React + Vite con backend Node.js + Express + Prisma + MySQL, en una aplicacion de escritorio y movil manteniendo el mismo nucleo de producto.

## Rol de la IA

Actua como arquitecto senior full-stack y mobile/desktop engineer. Tu objetivo es adaptar este proyecto para que funcione como:

- App web actual.
- App movil Android primero y luego iOS usando Capacitor.
- App de escritorio Windows primero, luego macOS/Linux usando Tauri.

No reescribas el producto desde cero. Conserva el frontend React/Vite, el estado Zustand, IndexedDB/idb, la logica offline-first y el backend Express/Prisma/MySQL. Haz cambios incrementales, verificables y documentados.

## Contexto tecnico del proyecto

Estructura:

- `agrothes-app/`: frontend React 19 + Vite.
- `server/`: backend Node.js + Express.
- Base de datos principal: MySQL con Prisma.
- Base local/offline: IndexedDB mediante `idb`.
- Estado global: Zustand.
- Sincronizacion: `PersistenceProxy` + `SyncSaga`.
- OCR/captura: `tesseract.js` y componentes de captura de imagen.

Estado actual relevante:

- El frontend usa `BrowserRouter`, lo cual puede fallar en apps empaquetadas si se abren rutas profundas desde archivos estaticos. Para movil/escritorio se recomienda migrar a `HashRouter` o configurar correctamente fallback de rutas.
- El frontend define `VITE_API_URL=http://localhost:3001/api`, pero el backend monta rutas como `/animales` y `/registros`, no como `/api/animales`. Se debe unificar esta convencion antes de empaquetar.
- Hay codigo que llama directo a `http://localhost:3001`, por ejemplo en `agrothes-app/src/pages/Biometria.jsx`. Eso debe moverse a una configuracion central.
- El backend tiene CORS limitado a `FRONTEND_URL`, `localhost:5173` y `localhost:3000`. Para Capacitor/Tauri se deben permitir origenes como `capacitor://localhost`, `tauri://localhost`, `http://localhost`, o resolverlo por entorno.
- MySQL no debe vivir dentro de la app movil. En movil la app debe consumir una API remota o trabajar offline con IndexedDB y sincronizar cuando tenga conexion.

## Decision recomendada

### Movil: Capacitor

Usar Capacitor porque permite meter una app web existente React/Vite dentro de contenedores Android/iOS, acceder a APIs nativas como camara, archivos, notificaciones y red, y conservar el codigo web. Es la opcion mas directa para este proyecto.

### Escritorio: Tauri

Usar Tauri para escritorio porque empaqueta un frontend web con WebView nativo, genera binarios livianos y tiene mejor perfil de rendimiento/tamano que Electron. Electron es alternativa valida si se necesita compatibilidad maxima con librerias Node dentro de la app, pero para AgroThes conviene Tauri.

### Backend

Mantener el backend como servicio separado:

- Desarrollo: backend local en `http://localhost:3001`.
- Produccion movil/escritorio: backend desplegado en un servidor, VPS o nube con HTTPS.
- Escritorio local opcional avanzado: Tauri puede iniciar un backend embebido, pero no es la ruta recomendada para la primera version porque complica instaladores, actualizaciones y MySQL.

## Objetivo final

Al terminar, el repositorio debe poder ejecutar:

- Web: `cd agrothes-app && npm run dev`.
- Movil Android: `npm run cap:android` o comandos documentados equivalentes.
- Movil iOS: proyecto listo para abrir en Xcode desde macOS.
- Escritorio: `npm run tauri:dev` y `npm run tauri:build`.
- Backend: `cd server && npm run dev` en desarrollo, y guia de despliegue para produccion.

## Plan paso a paso

### 1. Preparar el frontend para multiples plataformas

1. Crear una capa central de configuracion:

   Archivo sugerido: `agrothes-app/src/infra/config/api.js`

   Debe exportar:

   ```js
   export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";
   ```

2. Reemplazar todos los `fetch` con URLs hardcodeadas:

   - Buscar `localhost`, `VITE_API_URL`, `/api`, `fetch(`.
   - Mover URLs a `API_BASE_URL`.
   - Evitar `http://localhost:3001` dentro de componentes.

3. Unificar rutas API:

   Opcion recomendada: backend con prefijo `/api`.

   En `server/src/app.js`, cambiar:

   ```js
   app.use("/animales", animalRoutes);
   app.use("/registros", registroRoutes);
   ```

   por:

   ```js
   app.use("/api/animales", animalRoutes);
   app.use("/api/registros", registroRoutes);
   ```

   Mantener temporalmente aliases sin `/api` si se quiere compatibilidad:

   ```js
   app.use("/animales", animalRoutes);
   app.use("/registros", registroRoutes);
   ```

4. Cambiar router para empaquetado:

   Opcion simple y robusta:

   ```jsx
   import { HashRouter } from "react-router-dom";
   ```

   Reemplazar `BrowserRouter` por `HashRouter` en `agrothes-app/src/App.jsx`.

   Esto evita problemas en Tauri/Capacitor cuando se refresca o se abre una ruta interna.

5. Revisar responsive/mobile:

   - Sidebar debe convertirse en navegacion inferior o drawer en pantallas pequenas.
   - Topbar debe evitar textos largos como `OFFLINE - datos guardados localmente` si no caben.
   - Formularios deben tener inputs grandes, minimo 44px de alto tactil.
   - Tablas deben convertirse en cards/listas escaneables en movil.
   - Evitar hover como unica interaccion.
   - Probar anchos: 360px, 390px, 768px, 1366px.

6. Ajustar Vite:

   En `agrothes-app/vite.config.js`, asegurar compatibilidad estatica:

   ```js
   export default defineConfig({
     plugins: [react()],
     base: "./",
     server: {
       proxy: {
         "/api": {
           target: "http://localhost:3001",
           changeOrigin: true,
         },
       },
     },
   });
   ```

### 2. Mejorar backend para clientes web, movil y escritorio

1. CORS por entorno:

   En desarrollo permitir:

   - `http://localhost:5173`
   - `http://localhost:3000`
   - `http://localhost`
   - `capacitor://localhost`
   - `tauri://localhost`

   En produccion permitir solo dominios reales.

2. Agregar variables:

   En `server/.env.example`:

   ```env
   PORT=3001
   NODE_ENV=development
   DATABASE_URL="mysql://root:TU_PASSWORD@localhost:3306/agrothes"
   CORS_ORIGINS=http://localhost:5173,http://localhost:3000,capacitor://localhost,tauri://localhost
   ```

3. Agregar endpoint versionado:

   ```http
   GET /api/health
   ```

   Respuesta:

   ```json
   { "status": "ok", "version": "1.0.0" }
   ```

4. Preparar autenticacion si la app saldra de una red local:

   - Login con JWT.
   - Refresh token o expiracion razonable.
   - Hash de password con bcrypt.
   - Middleware `requireAuth`.
   - Roles si aplica: admin, operario, consulta.

5. Seguridad minima:

   - HTTPS obligatorio en produccion.
   - Validacion de payloads con Zod o similar.
   - Rate limit en login.
   - No exponer `.env`.
   - Logs sin datos sensibles.

### 3. Implementar app movil con Capacitor

Desde `agrothes-app/`:

```bash
npm install @capacitor/core @capacitor/cli
npx cap init AgroThes com.agrothes.sgp --web-dir=dist
npm install @capacitor/android @capacitor/ios
npx cap add android
npx cap add ios
```

Agregar scripts en `agrothes-app/package.json`:

```json
{
  "scripts": {
    "build": "vite build",
    "cap:sync": "npm run build && npx cap sync",
    "cap:android": "npm run build && npx cap sync android && npx cap open android",
    "cap:ios": "npm run build && npx cap sync ios && npx cap open ios"
  }
}
```

Configurar `capacitor.config.*`:

```ts
import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.agrothes.sgp",
  appName: "AgroThes",
  webDir: "dist",
  server: {
    androidScheme: "https"
  }
};

export default config;
```

Instalar plugins segun necesidad:

```bash
npm install @capacitor/camera @capacitor/filesystem @capacitor/preferences @capacitor/network @capacitor/push-notifications @capacitor/splash-screen @capacitor/status-bar
npx cap sync
```

Uso recomendado:

- `@capacitor/camera`: reemplazar inputs de imagen/captura cuando se necesite camara nativa.
- `@capacitor/filesystem`: guardar fotos o reportes fuera de IndexedDB si crecen mucho.
- `@capacitor/preferences`: configuraciones pequenas como URL del servidor.
- `@capacitor/network`: detectar conectividad real en movil.
- `@capacitor/push-notifications`: alertas de salud o sincronizacion si hay backend preparado.

Permisos Android:

- Camara.
- Internet.
- Lectura/escritura de archivos si se exportan reportes o imagenes.

Pasos de Android:

1. Instalar Android Studio.
2. Instalar SDK Android.
3. Ejecutar `npm run cap:android`.
4. En Android Studio, probar en emulador o dispositivo fisico.
5. Generar APK/AAB desde Android Studio.

Pasos de iOS:

1. Usar macOS con Xcode.
2. Ejecutar `npm run cap:ios`.
3. Configurar firma con Apple Developer.
4. Probar en simulador/dispositivo.
5. Generar build para TestFlight/App Store.

Importante para API movil:

- En dispositivo fisico `localhost` apunta al telefono, no al PC.
- Para desarrollo Android con backend en PC usar la IP local, por ejemplo `http://192.168.1.20:3001/api`.
- Para emulador Android se puede usar `http://10.0.2.2:3001/api`.
- En produccion usar dominio HTTPS: `https://api.tudominio.com/api`.

### 4. Implementar app de escritorio con Tauri

Desde `agrothes-app/` instalar Tauri:

```bash
npm install -D @tauri-apps/cli
npm install @tauri-apps/api
npx tauri init
```

Durante `tauri init`, usar:

- `dist` como carpeta de build.
- `npm run dev` como comando dev frontend.
- `http://localhost:5173` como URL dev.
- `npm run build` como comando build frontend.

Agregar scripts:

```json
{
  "scripts": {
    "tauri:dev": "tauri dev",
    "tauri:build": "tauri build"
  }
}
```

Configurar `src-tauri/tauri.conf.json` o equivalente:

- Nombre: `AgroThes`.
- Identificador: `com.agrothes.sgp`.
- Ventana inicial: 1200x800.
- Minimo: 900x650.
- Iconos en varios tamanos.
- Permisos solo necesarios.

Backend en escritorio:

Ruta recomendada para primera version:

- La app Tauri consume una API remota igual que movil.
- En desarrollo consume `http://localhost:3001/api`.
- En produccion consume `https://api.tudominio.com/api`.

Ruta avanzada, no primera version:

- Empaquetar un backend local.
- Usar SQLite local en vez de MySQL para escritorio offline total.
- Sincronizar con servidor central cuando haya red.

Esta ruta requiere redisenar parte de Prisma/configuracion y resolver migraciones locales, instaladores y backups. Hacerla solo despues de tener la version remota estable.

### 5. PWA como paso intermedio recomendado

Antes o en paralelo con Capacitor, convertir el frontend en PWA:

```bash
npm install -D vite-plugin-pwa
```

Configurar:

- Manifest con nombre, iconos, colores.
- Service worker.
- Cache de assets.
- Estrategia offline para shell de la app.

Esto no reemplaza Capacitor/Tauri, pero mejora:

- Instalacion desde navegador.
- Funcionamiento offline.
- Pruebas tempranas en movil.

### 6. Manejo offline y sincronizacion

El proyecto ya tiene IndexedDB, `PersistenceProxy` y `SyncSaga`. Fortalecerlos antes de empaquetar:

1. Persistir cola con metadatos:

   - `id`.
   - `tabla`.
   - `operacion`.
   - `payload`.
   - `createdAt`.
   - `updatedAt`.
   - `intentos`.
   - `syncStatus`.
   - `lastError`.

2. Resolver conflictos:

   - Si dos clientes editan el mismo animal, definir regla.
   - Recomendacion inicial: `updatedAt` + ultima escritura gana, pero registrar conflicto.
   - Mejor version futura: pantalla de resolucion manual.

3. No guardar imagenes pesadas indefinidamente en IndexedDB:

   - Comprimir imagen antes de guardar.
   - Guardar miniatura local.
   - Subir original al backend cuando haya red.
   - En movil considerar Filesystem para archivos grandes.

4. Cambiar deteccion de red:

   - Web: `navigator.onLine`.
   - Capacitor: `@capacitor/network`.
   - Crear adaptador `NetworkService` que oculte diferencias.

### 7. Diseno UI especifico para movil/escritorio

Movil:

- Navegacion inferior con 4-5 destinos maximos o drawer.
- Formularios verticales.
- Botones tactiles grandes.
- Evitar tablas anchas.
- Reducir textos largos en badges.
- Confirmaciones claras para borrar animales/registros.
- Camara integrada para pesajes o evidencias.

Escritorio:

- Mantener sidebar si hay espacio.
- Mejorar densidad de datos.
- Agregar atajos opcionales.
- Exportar reportes CSV/PDF si aplica.
- Soportar ventana redimensionable.

Ambas:

- Estados de carga, error, offline, sincronizando y conflicto.
- Pantalla de configuracion para URL de API.
- Indicador de version de app.

### 8. Variables de entorno recomendadas

Frontend `.env.example`:

```env
VITE_API_URL=http://localhost:3001/api
VITE_APP_PLATFORM=web
VITE_ENABLE_MOCKS=false
```

Movil desarrollo:

```env
VITE_API_URL=http://10.0.2.2:3001/api
```

Movil produccion:

```env
VITE_API_URL=https://api.agrothes.com/api
```

Escritorio desarrollo:

```env
VITE_API_URL=http://localhost:3001/api
```

Escritorio produccion:

```env
VITE_API_URL=https://api.agrothes.com/api
```

### 9. Despliegue backend recomendado

Opciones:

- VPS con Node.js + MySQL + Nginx + HTTPS.
- Railway/Render/Fly.io para API y base de datos administrada.
- Servidor local de la institucion si es proyecto academico.

Requisitos:

- Dominio o IP fija.
- HTTPS.
- Variables de entorno seguras.
- Migraciones Prisma en deploy.
- Backups de MySQL.
- Logs basicos.

Comandos base:

```bash
cd server
npm install
npx prisma generate
npx prisma migrate deploy
npm run start
```

### 10. Testing minimo antes de empaquetar

Web:

```bash
cd agrothes-app
npm run lint
npm run build
npm run preview
```

Backend:

```bash
cd server
npm run db:generate
npm run start
```

Manual:

- Crear animal online.
- Crear animal offline.
- Reconectar y sincronizar.
- Registrar peso.
- Registrar alimentacion.
- Capturar/subir imagen.
- Borrar animal.
- Revisar alertas.
- Probar sin backend.
- Probar con API remota.

Movil:

- Probar en Android emulador.
- Probar en Android fisico.
- Probar permisos de camara.
- Probar offline real con modo avion.
- Probar reconexion.
- Probar IP/API en red local.

Escritorio:

- Probar `tauri dev`.
- Probar build instalable.
- Probar redimensionado.
- Probar sin internet.
- Probar conexion a API remota.

### 11. Orden recomendado de implementacion

1. Arreglar rutas API y URLs hardcodeadas.
2. Cambiar router a `HashRouter`.
3. Hacer build web limpio.
4. Ajustar responsive movil.
5. Agregar Capacitor Android.
6. Probar Android con backend local usando `10.0.2.2` o IP LAN.
7. Agregar Tauri.
8. Probar Tauri dev y build.
9. Mejorar CORS/envs por plataforma.
10. Desplegar backend con HTTPS.
11. Cambiar builds de produccion a API remota.
12. Agregar iconos, splash, firma y empaquetado final.

## Prompt para ejecutar automaticamente

Copia este bloque a otra IA dentro del repositorio:

```text
Necesito convertir AgroThes SGP en app movil y de escritorio conservando el proyecto actual.

Contexto:
- Frontend en agrothes-app: React 19 + Vite + Zustand + React Router + IndexedDB/idb + tesseract.js.
- Backend en server: Node.js + Express + Prisma + MySQL.
- Ya existe logica offline-first con PersistenceProxy, LocalDB y SyncSaga.
- La app web corre actualmente con backend local en puerto 3001 y frontend Vite en 5173.

Objetivo:
1. Preparar el frontend para web, Capacitor y Tauri.
2. Implementar app movil con Capacitor, Android primero.
3. Implementar app de escritorio con Tauri, Windows primero.
4. Mantener backend como API separada y documentar despliegue con HTTPS.
5. Dejar scripts, configuraciones y documentacion listas.

Instrucciones paso a paso:
1. Inspecciona el repo completo y confirma estructura.
2. En el frontend, crea una configuracion central para API, por ejemplo src/infra/config/api.js, exportando API_BASE_URL desde import.meta.env.VITE_API_URL con fallback http://localhost:3001/api.
3. Busca y reemplaza URLs hardcodeadas como http://localhost:3001 por API_BASE_URL.
4. Unifica backend y frontend bajo prefijo /api. En server/src/app.js monta rutas como /api/animales y /api/registros. Si hace falta, conserva aliases antiguos temporalmente.
5. Cambia BrowserRouter por HashRouter en agrothes-app/src/App.jsx para evitar fallos de rutas en apps empaquetadas.
6. Ajusta vite.config.js con base "./" y conserva proxy /api a http://localhost:3001 en desarrollo.
7. Ajusta CORS del backend para leer CORS_ORIGINS desde .env y permitir en desarrollo localhost, capacitor://localhost y tauri://localhost.
8. Actualiza .env.example de frontend y backend con variables correctas para web, movil, escritorio y produccion.
9. Revisa UI responsive: sidebar, topbar, formularios, tablas/listas, botones tactiles y textos largos. Haz los cambios minimos necesarios para que funcione bien en 360px, 390px, 768px y desktop.
10. Instala y configura Capacitor en agrothes-app:
    - @capacitor/core
    - @capacitor/cli
    - @capacitor/android
    - @capacitor/ios
    - appId com.agrothes.sgp
    - appName AgroThes
    - webDir dist
11. Agrega scripts:
    - cap:sync
    - cap:android
    - cap:ios
12. Instala plugins utiles de Capacitor si el codigo los necesita:
    - @capacitor/camera
    - @capacitor/filesystem
    - @capacitor/preferences
    - @capacitor/network
    - @capacitor/splash-screen
    - @capacitor/status-bar
13. Crea adaptadores para capacidades nativas solo si aportan valor inmediato:
    - NetworkService para web/Capacitor.
    - CameraService para captura movil.
    - Storage/FileService si se manejan imagenes pesadas.
14. Instala y configura Tauri en agrothes-app:
    - @tauri-apps/cli como devDependency.
    - @tauri-apps/api como dependency si se usa API Tauri.
    - npx tauri init.
    - dist como build output.
    - npm run dev como dev command.
    - http://localhost:5173 como devUrl.
    - npm run build como beforeBuildCommand.
15. Agrega scripts:
    - tauri:dev
    - tauri:build
16. Configura ventana de Tauri:
    - titulo AgroThes.
    - ancho 1200.
    - alto 800.
    - minimo 900x650.
    - identificador com.agrothes.sgp.
17. No intentes meter MySQL dentro de la app movil. Para produccion, la app debe usar una API remota HTTPS. Documenta esto claramente.
18. Fortalece SyncSaga si encuentras problemas:
    - guardar lastError.
    - guardar createdAt/updatedAt.
    - manejar conflictos.
    - no perder cola offline.
19. Ejecuta verificaciones:
    - npm run lint en agrothes-app si existe.
    - npm run build en agrothes-app.
    - iniciar backend y revisar /api/health o /health.
    - probar que fetch use VITE_API_URL.
20. Documenta todo en un archivo nuevo o actualizado:
    - comandos web.
    - comandos movil.
    - comandos escritorio.
    - variables por entorno.
    - limitaciones.
    - checklist de pruebas.

Restricciones:
- No reescribas la app desde cero.
- No elimines funcionalidad existente.
- No borres cambios del usuario.
- Mantén cambios pequeños y revisables.
- Si hay errores de encoding en comentarios existentes, no hagas refactor masivo salvo que sea necesario.
- Prioriza Android y Windows porque son los entornos mas probables del proyecto.

Resultado esperado:
- El frontend sigue funcionando en navegador.
- Hay configuracion Capacitor lista para Android/iOS.
- Hay configuracion Tauri lista para escritorio.
- Las URLs de API son configurables.
- El backend acepta clientes web/movil/escritorio en desarrollo.
- Queda documentado como compilar, probar y desplegar.
```

## Recomendacion final de arquitectura

Para la primera version real:

- Web: React/Vite actual.
- Movil: Capacitor + Android.
- Escritorio: Tauri + Windows.
- Backend: Express/Prisma/MySQL desplegado como API HTTPS.
- Offline: IndexedDB local + cola de sincronizacion.
- Futuro: autenticacion, roles, notificaciones push, exportacion PDF/CSV, backups y resolucion visual de conflictos.

