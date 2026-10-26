# CLAUDE.md · DiNNo · mobile

> Instrucciones para Claude Code y para el equipo. Las secciones 1 a 10 son **iguales en los tres repositorios** (backend, frontend, mobile); la sección 11 es propia de este repositorio.
> Si una regla cambia, se cambia en los tres repos en el mismo PR o en PRs del mismo día, y se avisa al equipo.

## 1. Contexto del proyecto

**DiNNo**: plataforma de microreservas de mesas en restaurantes con disponibilidad inmediata. Promesa: *“Dile no a la espera.”*

| Repositorio (org `DiNNo-team`) | Qué es | Stack | Despliegue |
|---|---|---|---|
| `backend` | API (monolito modular) | NestJS 12 + TypeORM + PostgreSQL (Neon) + Redis (Upstash) | Render (desde `develop`) |
| `frontend` | Dashboard web del restaurante | React 19 + Vite 8 + Tailwind CSS v4 | Vercel (desde `main`) |
| `mobile` | App del comensal | Expo SDK 57 + Expo Router + NativeWind v4 (Tailwind v3) | Expo / EAS |

**Equipo y responsables:**

| Persona | Rol en el Sprint 1 |
|---|---|
| Elizabeth | Backend base, backend de mesas y de la edición del restaurante, integración y demo. Revisa los PR de backend |
| Sebastián | Kit visual (`components/ui`), pantallas de mesas. Revisa los PR de web y mobile |
| Santiago | Registro del restaurante (onboarding) |
| Jacobo | Autenticación (login y control de acceso); pantalla del restaurante |
| Sergio | Estado abierto/cerrado del restaurante y bitácora de cambios de mesas |

**Sprint 2 (actual, en cierre): Búsqueda y disponibilidad para el comensal. Planeado del 15 al 21 oct; sigue abierto mientras se cierran las pruebas con cuentas reales en el ambiente desplegado (26 oct). Sprint 1 cerrado: Restaurante operativo.** Un restaurante puede iniciar sesión, registrar y editar sus datos, crear y administrar mesas, cambiar su estado, marcarse como abierto o cerrado y ver la bitácora, todo en el ambiente desplegado.

---

## 2. Antes de empezar cualquier tarea

1. **Pregunta qué PBI o tarea de Azure DevOps se está trabajando**, si la persona no lo dijo. No trabajes sin saber el alcance.
2. **Si no tienes en el contexto el manual de identidad v1.1 ni el plan del Sprint 1, pídelos** antes de tocar algo visual o algo que dependa de otra persona. No inventes colores, componentes, textos ni flujos.
3. **Confirma qué está dentro y qué está fuera de la tarea.** Si algo parece necesario pero es de otra persona (ver la tabla de responsables), dilo en vez de hacerlo.
4. **Busca si ya existe algo parecido** en el repo (componente, servicio, validación, utilidad) antes de crear algo nuevo.
5. **Verifica que la rama esté actualizada con `develop`** antes de empezar (ver sección 3).

---

## 3. Git y flujo de trabajo

### Reglas que nunca se rompen
- **Nunca hagas commit, push, merge, rebase ni borres ramas sin que la persona lo pida explícitamente.** Propón el comando y espera confirmación.
- **Nunca trabajes ni hagas push directo a `develop` ni a `main`.** `develop` se despliega automáticamente: todo entra por Pull Request revisado.
- **Nunca uses `git push --force`** sobre ramas compartidas, `develop` ni `main`.
- **No hagas commit** de `.env`, `node_modules/`, `dist/`, `.expo/`, archivos del sistema operativo ni archivos generados.

### Ramas
- Siempre desde `develop` actualizado: `git checkout develop && git pull` y luego crear la rama.
- Formato: **`<tipo>/sprint<N>-<descripcion-corta>`**, en minúsculas, con guiones y sin tildes.
- Tipos: `feat` (funcionalidad), `fix` (corrección), `chore` (configuración o mantenimiento), `docs` (documentación), `refactor` (sin cambiar comportamiento), `test` (pruebas).
- Ejemplos: `feat/sprint1-crear-mesas`, `feat/sprint1-login-firebase`, `fix/sprint1-validacion-horarios`, `chore/sprint1-migraciones`.
- **Una rama por tarea.** No mezcles tareas distintas en la misma rama.

### Commits (Conventional Commits, en inglés)
- Formato: `<tipo>(<ámbito>): <descripción en imperativo>`. El ámbito es el módulo o la zona tocada.
- Ejemplos: `feat(restaurant-operations): add table status change`, `fix(auth): show generic error on invalid credentials`, `chore(ui): add button and text field components`, `docs: update database schema`.
- Opcional: agrega `AB#<id>` al final para enlazar el commit con el work item de Azure.
- Commits pequeños y con sentido. No uses mensajes como “cambios”, “fix” o “wip”.

### Mantenerse al día con `develop`
- Antes de abrir el PR y cada día de trabajo: trae los cambios de `develop` a tu rama (`git fetch` + `git merge origin/develop`) y vuelve a correr las verificaciones.
- **Conflictos:** nunca descartes cambios de otra persona para resolverlos. Si no es claro qué conservar, pregunta a la persona y al dueño de ese código.
- **Conflictos en `package-lock.json`:** conserva el `package.json` correcto y regenera el lock con `npm install`. No lo edites a mano.

### Pull Requests
- Siempre hacia `develop`. Pequeños: una tarea por PR.
- La descripción incluye: qué hace, el PBI o la tarea de Azure, cómo probarlo, capturas si hay pantallas y si cambia algo que afecta a otros (API, base de datos, componentes del kit, variables de entorno).
- **Revisión obligatoria:** Elizabeth revisa backend; Sebastián revisa web y mobile. Nadie aprueba su propio PR.
- Antes de pedir revisión, corre las verificaciones del repo (sección de comandos) y deja todo en verde.
- Después del merge se borra la rama.

---

## 4. Seguridad
- **Nunca leas, muestres, copies, edites ni subas archivos `.env`** ni su contenido. Si necesitas saber qué variables existen, usa `.env.example`.
- No escribas secretos, contraseñas, tokens, llaves de servicios ni cadenas de conexión en el código, los logs, los comentarios ni los mensajes de commit.
- **Toda variable nueva va en `.env.example`** con un valor de ejemplo y un comentario, y se avisa en el PR para que la agreguen en Render, Vercel o Expo.
- Las variables públicas (`VITE_*`, `EXPO_PUBLIC_*`) terminan dentro de la web o la app: **nunca pongas secretos en ellas**.
- **No corras migraciones, seeds ni comandos que escriban en bases remotas** (Neon, Upstash) sin confirmación explícita de la persona.

---

## 5. Dependencias y entorno
- **Node 24** (fijado en `.nvmrc` y `engines`). Usa `nvm use`.
- **Solo npm**: no uses yarn, pnpm ni bun, y no borres ni reemplaces `package-lock.json`.
- **No instales, actualices ni elimines dependencias sin preguntar.** Primero revisa si algo ya instalado lo resuelve. Si se agrega una, se explica por qué en el PR.
- Después de cada `git pull` o merge de `develop`, corre `npm install` (o `npm ci`) antes de cualquier otro comando: si alguien agregó una dependencia, los comandos fallan sin eso.
- No cambies versiones mayores de frameworks ni configuraciones globales (tsconfig, linter, formateador, build) sin acordarlo con el equipo.
- **Las versiones instaladas son más nuevas que lo que suele conocer un asistente:** revisa `package.json` y la documentación oficial de la versión instalada antes de usar una API de memoria.

---

## 6. Forma de trabajar
- **Cambios mínimos y dentro del alcance de la tarea.** No reformatees, renombres ni muevas archivos que no son parte de la tarea.
- **No modifiques código de otro módulo ni de otra persona** sin avisar. Si lo necesitas, propónlo y que lo revise su dueño.
- **Reutiliza antes de crear:** componentes del kit, validaciones, servicios, utilidades.
- **Nombres en inglés en el código** (variables, funciones, archivos, rutas de la API, tablas). **Textos de la interfaz en español**, tuteando y con el glosario del manual: mesa, comensal, restaurante, Disponible, Reservada, Ocupada, Inactiva, Abierto, Cerrado, bitácora, capacidad (“4 personas”), iniciar sesión / cerrar sesión.
- **Errores:** al usuario siempre se le muestra un mensaje claro que diga qué hacer, nunca un error técnico. En el código, no se ignoran errores (nada de `catch` vacíos).
- **Sin `console.log`, código comentado ni `TODO` sin dueño** en el PR.
- Funciones y componentes pequeños, con una sola responsabilidad. Tipado estricto: evita `any`.
- **Si algo de estas instrucciones contradice el código o una decisión nueva, avisa** en vez de suponer.

---

## 7. Lo que afecta a otros: avisar siempre
Estos cambios rompen el trabajo de otras personas si no se comunican. Cuando los hagas, **dilo en la descripción del PR y en el grupo del equipo**:
- Cambios en **rutas, DTOs o respuestas de la API** (afecta a web y mobile). No rompas endpoints existentes; si cambian, se actualiza Swagger.
- Cambios en **la base de datos** (nuevas tablas, columnas o migraciones). Se documentan en `docs/database.md` del backend.
- Cambios en **componentes del kit visual** o en los tokens de diseño (afecta todas las pantallas).
- **Variables de entorno nuevas** o cambios en `CORS_ORIGINS`.
- **Dependencias nuevas.**

---

## 8. Decisiones del equipo (no se cambian sin acordarlo)
Las decisiones y contratos del Sprint 2 están en la sección 10.
- **Autenticación:** Firebase Authentication (confirmado). Se usa en la web (restaurantes) y en la app móvil (comensales), con Google y con correo y clave. El backend valida el token de Firebase y decide el rol; ver sección 10.
- **Estados de mesa:** Disponible, Reservada y Ocupada. *Inactiva* es una mesa desactivada, no un estado del control. “Pocas mesas” es disponibilidad del restaurante para el comensal, no un estado de mesa.
- **Estado del restaurante:** Abierto o Cerrado.
- **Diseño:** el manual de identidad v1.1 manda sobre cualquier otra preferencia. Un solo kit de componentes; nadie crea estilos propios.
- **API:** prefijo `/v1`, contrato documentado en Swagger (`/docs`).
- **Base de datos:** cambios de esquema solo con migraciones; nunca `synchronize`.
- **Identificador de mesa:** corto ("04", "T1") y se muestra "Mesa 04"; "4", "04" y "Mesa 4" son la misma mesa; máximo 10 caracteres; en la interfaz se llama "Identificador" (manual 12.4).
- **Bitácora de mesas:** cambiar el estado, desactivar (`<estado>` → `inactive`) y reactivar (`inactive` → `available`) se registran; editar el identificador o la capacidad no.
- Nuevas decisiones: se agregan aquí, en una línea, en el mismo PR que las aplica.

---

## 9. Definición de terminado
Una tarea está lista solo si:
- [ ] Cumple los criterios de aceptación del PBI.
- [ ] Pasan el lint, el chequeo de tipos o build y las pruebas del repo.
- [ ] (Pantallas) Usa solo el kit, sigue el manual y tiene estados de carga, vacío y error, en modo claro y oscuro.
- [ ] Lo que afecta a otros está avisado (sección 7).
- [ ] Funciona en el ambiente desplegado, no solo en local.
- [ ] El PR está revisado y aprobado.

---

## 10. Sprint 2 · Contratos (fuente de verdad)

> Responsable: Elizabeth. Si algo no está aquí, se pregunta antes de inventarlo. Los cambios a esta sección se anuncian en `AVISOS.md`.

### Cuentas y roles
- Roles posibles: `restaurant_admin` (solo web) y `diner` (solo app). Cada cuenta tiene **un solo rol**.
- **Lista de restaurantes habilitados** = filas de `users` con rol `restaurant_admin`. Para habilitar un correo se inserta una fila (ver `docs/database.md` del backend). No hay registro público de restaurantes.
- **Cuentas de prueba (Firebase, correo verificable):** `dinnoteam2026@gmail.com` (restaurante Casa16), `dinnoteam2026+casa72@gmail.com` (restaurante Casa 72) y `dinnoteam2026+comensal@gmail.com` (comensal). Las credenciales están en Discord (#usuarios-restaurante y #usuarios-comensal), **nunca** en el repo. Una cuenta nueva usa un alias `dinnoteam2026+algo@gmail.com` (llega a la misma bandeja). Los dueños de los 15 restaurantes reales del seed (`restaurante-XX@dinno.test`) son solo datos: no tienen cuenta de Firebase ni inician sesión.
- **El backend ya no crea usuarios automáticamente.** El único endpoint que crea un usuario es `POST /v1/diners/me`, y siempre lo crea con el rol `diner`.
- Resolución del usuario en cada petición: token válido → se busca por `firebase_uid` → si no aparece y el correo está verificado, se busca por correo y se vincula el UID (igual que en el Sprint 1) → si no existe, la cuenta queda **sin perfil**.

**Códigos de cuenta.** Precedencia: 401 de sesión → `EMAIL_NOT_VERIFIED` → códigos de rol → `RESTAURANT_REQUIRED`.

| Situación | HTTP | `errorCode` | Mensaje (`message`) |
|---|---|---|---|
| Token ausente, inválido o vencido | 401 | — | Tu sesión terminó. Inicia sesión de nuevo. |
| Correo sin verificar (cuenta todavía sin vincular) | 401 | `EMAIL_NOT_VERIFIED` | Verifica tu correo para continuar. |
| Sin perfil + endpoint de restaurante | 403 | `ACCOUNT_NOT_ENABLED` | Esta cuenta no está habilitada como restaurante. Si eres comensal, encuentra mesa desde la app DiNNo. |
| Sin perfil + endpoint de comensal | 403 | `PROFILE_REQUIRED` | Completa tu perfil para continuar. *(la app no lo muestra: llama a `POST /v1/diners/me` y reintenta)* |
| Comensal en endpoint de restaurante | 403 | `DINER_ACCOUNT` | Esta es una cuenta de comensal. Para buscar mesa, usa la app DiNNo. |
| Restaurante en endpoint de comensal | 403 | `RESTAURANT_ACCOUNT` | Esta es una cuenta de restaurante. Administra tu restaurante desde la web. |
| Restaurante habilitado sin restaurante registrado | 403 | `RESTAURANT_REQUIRED` | Primero registra tu restaurante. *(sin cambios)* |

- **Endpoints de restaurante:** todos los del Sprint 1 (`/v1/restaurants`, `/v1/restaurants/me*`, `/v1/tables*`, `/v1/table-logs`).
- **Endpoints de comensal:** `/v1/search/*` y `/v1/restaurants/:id/public`.
- **Ambos roles:** `GET /v1/me` y `GET /v1/geocode` (una cuenta sin perfil recibe `PROFILE_REQUIRED` en los dos).
- La forma del error no cambia: `{ statusCode, message, error, errorCode? }`. Los clientes deciden por `errorCode`, nunca por el texto.

### Endpoints nuevos o modificados
Todos bajo `/v1`, con `Authorization: Bearer <token de Firebase>`.

| Método | Ruta | Rol | Entrada | Respuesta |
|---|---|---|---|---|
| GET | `/me` | ambos | — | 200 `{ id, email, displayName: string \| null, role, restaurantId: string \| null }` · sin perfil → 403 `PROFILE_REQUIRED` |
| POST | `/diners/me` | token válido con correo verificado | `{ displayName?: string }` (1–60 caracteres, con trim) | 201 si lo crea · 200 si ya existía como comensal. Misma forma que `GET /me`. Si no llega `displayName`: el nombre de la cuenta de Google y, si no hay, la parte del correo antes de `@`. Correo o UID de restaurante → 403 `RESTAURANT_ACCOUNT` |
| GET | `/search/zones` | diner | — | 200 `[{ id, name, latitude, longitude }]` |
| GET | `/search/restaurants` | diner | `lat` + `lng` **o** `zone` · `radiusKm` ∈ {1, 2, 5, 10} (por defecto 2) · `category?` · `partySize?` (1–20) | 200 `[{ id, name, category, address, latitude, longitude, distanceKm, availability }]`, ordenado por distancia, máximo 50 |
| GET | `/restaurants/:id/public` | diner | `lat?` + `lng?` (juntos o ninguno) | 200 `{ id, name, category, address, latitude, longitude, schedules[], isOpenNow, availability, distanceKm? }` · 404 `RESTAURANT_NOT_FOUND` |
| GET | `/geocode` | ambos (el restaurante no necesita tener restaurante registrado) | `address` (3–255 caracteres) | 200 `{ latitude, longitude, formattedAddress }` · 404 `ADDRESS_NOT_FOUND` «No encontramos esa dirección en Bogotá.» · 503 `GEOCODING_UNAVAILABLE` «No pudimos ubicar la dirección en este momento.» · sin perfil → 403 `PROFILE_REQUIRED`. Los mensajes son neutros: cada cliente muestra su propio texto según el `errorCode` |
| POST | `/restaurants` | restaurant_admin | agrega `latitude?`, `longitude?` | la respuesta agrega `latitude`, `longitude` (number \| null) |
| PATCH | `/restaurants/me` | restaurant_admin | agrega `latitude?`, `longitude?` | igual que arriba |
| GET | `/restaurants/me` | restaurant_admin | — | agrega `latitude`, `longitude` (number \| null) |

**Reglas de los campos:**
- `latitude` y `longitude` son `number` en JSON, con hasta 6 decimales. Se aceptan con más de 6: el backend las **redondea** a 6 antes de guardar (no es un error), y las respuestas traen el valor redondeado. Se envían **los dos o ninguno** (si llega solo uno → 400). Deben estar dentro de Bogotá: latitud entre 4.45 y 4.85, longitud entre -74.25 y -73.95 (fuera → 400). En el backend las coordenadas son opcionales para no romper la web actual; la obligatoriedad al registrar la impone el formulario web.
- Búsqueda: `lat`/`lng` y `zone` son excluyentes (los dos o ninguno → 400). `lat`/`lng` pueden estar fuera de Bogotá (simplemente no habrá resultados). Una `zone` desconocida, una `category` inválida, un `radiusKm` fuera de la lista o un `partySize` fuera de rango → 400 con un mensaje en español.
- **Búsqueda por dirección (app):** la búsqueda no recibe `address`. La app llama a `GET /geocode?address=…`, muestra «Resultados cerca de: `formattedAddress`» y busca con `GET /search/restaurants?lat=…&lng=…` usando `latitude` y `longitude`. Con `404` o `503` la app muestra su propio texto y ofrece buscar por zona o por ubicación. Una dirección que existe en Bogotá se acepta aunque el comensal pensara en otra ciudad (las direcciones colombianas se repiten entre ciudades): por eso se muestra `formattedAddress`.
- `distanceKm`: número en km con 2 decimales. El formato para mostrar («a 650 m», «a 1,4 km») lo hace la app.
- `category`: `colombian`, `italian`, `mexican`, `asian`, `grill`, `fast_food`, `healthy`, `seafood`, `cafe`, `other` (los mismos del Sprint 1).
- `schedules[]` del detalle: el mismo formato que `GET /restaurants/me`: `{ dayOfWeek (1 = lunes … 7 = domingo), isOpen24h, opensAt: "HH:MM" | null, closesAt: "HH:MM" | null }`. Si `closesAt < opensAt`, el horario cierra al día siguiente. Los días cerrados no aparecen.
- `/restaurants/:id/public` → 404 `RESTAURANT_NOT_FOUND` si el id no es un UUID válido, si no existe o si no tiene coordenadas.
- Zonas (`id` → nombre): `chapinero` Chapinero · `calle-72` Calle 72 · `zona-g` Zona G · `zona-t` Zona T · `usaquen` Usaquén · `teusaquillo` Teusaquillo · `parque-93` Parque 93 · `cedritos` Cedritos · `salitre` Salitre · `centro` Centro · `la-candelaria` La Candelaria · `galerias` Galerías · `modelia` Modelia · `suba` Suba · `kennedy` Kennedy · `colina` Colina · `niza` Niza · `chico` Chicó · `quinta-camacho` Quinta Camacho · `normandia` Normandía.

### Disponibilidad
- **Abierto ahora** = `is_open = true` **y** la hora actual en **America/Bogota** está dentro del horario: el rango de hoy, o la parte después de medianoche de un horario de ayer que cierra al día siguiente, o un día de 24 horas. El cierre es exclusivo (a las 22:00 en punto, un horario que cierra a las 22:00 ya está cerrado).
- **Mesas libres** = `is_active = true` y `status = 'available'`.
- **Aparece en la búsqueda** solo si tiene coordenadas, está abierto ahora y tiene al menos 1 mesa activa (más el filtro de `partySize`: al menos 1 mesa libre y activa con `capacity ≥ partySize`).

| `availability` | Regla | Texto en pantalla |
|---|---|---|
| `available` | libres / activas > 30 % | Disponible |
| `few` | al menos 1 libre y ≤ 30 % | Pocas mesas |
| `none` | 0 libres | Sin mesas |
| `closed` | no está abierto ahora (solo en el detalle y en tiempo real; nunca en la búsqueda) | Cerrado |

- **Nunca** se expone el número de mesas libres ni de mesas totales.

### Tiempo real
- Socket.IO en el mismo host del backend (ruta por defecto `/socket.io`). Conexión: `io(BASE_URL, { auth: async (cb) => cb({ token: await user.getIdToken() }) })`. El `auth` va **como función** para que cada reconexión envíe un token vigente (con un objeto fijo, la reconexión usaría el token viejo). Solo se aceptan comensales; si no, la conexión se rechaza con `connect_error`, cuyo `message` es un código: `UNAUTHORIZED` (token ausente, inválido o vencido; solo existe en el WebSocket, en HTTP es el 401 sin `errorCode`), `EMAIL_NOT_VERIFIED` (correo sin verificar), `PROFILE_REQUIRED`, `RESTAURANT_ACCOUNT` o `SERVER_ERROR` (el handshake falló por algo distinto a la sesión, por ejemplo la base caída).
- Socket.IO **no reintenta solo** cuando el servidor rechaza la conexión. Con `SERVER_ERROR` la app reintenta ella misma con espera creciente (por ejemplo 5 s, 15 s, 30 s) y, mientras tanto, sigue la consulta cada 60 s. Con los demás códigos no reintenta.
- Un token que vence **no desconecta** un socket ya abierto: el token solo se revisa al conectar, y la siguiente reconexión pide uno nuevo con la función de `auth`.
- Evento del servidor `availability.changed`: `{ restaurantId, availability, isOpenNow, isSearchable }`. Se envía a todos los comensales conectados.
  - `isSearchable` = cumple las reglas para aparecer en la búsqueda (sin filtros). Si es `false` → la app lo quita de la lista y del mapa (el detalle muestra `closed` si `isOpenNow` es `false`). Si es `true` y el restaurante no estaba en la lista → la app vuelve a consultar la búsqueda.
- Se emite cuando: cambia el estado de una mesa, se crea, desactiva o reactiva una mesa, se abre o cierra el restaurante, o se edita su horario o ubicación. Solo después de que la operación queda guardada.
- Respaldo en la app: vuelve a consultar al regresar al primer plano, al reconectarse y cada 60 s en resultados y detalle.

### Cuándo está listo cada contrato en `develop`
**Todo el backend del Sprint 2 ya está en `develop`** (fusionado el 15 oct). Ya no hace falta usar datos de ejemplo: se consume la API real.

| Qué | En `develop` desde |
|---|---|
| Roles, `GET /me`, `POST /diners/me`, coordenadas en la base | 15 oct (PR #35) |
| Regla de disponibilidad (`AvailabilityService`, sin endpoints) | 15 oct (PR #36) |
| Búsqueda, zonas, disponibilidad, filtros y detalle público | 15 oct (PR #37) |
| `GET /geocode` y coordenadas en POST/PATCH | 15 oct (PR #38) |
| WebSocket `availability.changed` | 15 oct (PR #40) |
| Seed con los 15 restaurantes reales en Neon y Casa 72 con dueño `dinnoteam2026+casa72@gmail.com` | 24 oct (PR #44) |
| Llave real de Google Geocoding en local y en Render: `GET /geocode` ya no responde siempre `503` | 26 oct |
| `GET /geocode` para comensales (búsqueda por dirección) y mensajes neutros en 404 y 503 | pendiente: rama `docs/sprint2-cierre-contrato`, 26 oct |

---

## 11. Este repositorio: mobile (app del comensal)

> **Sprint 2:** Sebastián es dueño de la app (revisa todos los PR de mobile). Jacobo hace Google Sign-In, crear cuenta y verificación de correo; Sergio, la pestaña Perfil. No agregues funcionalidades sin un PBI asignado.

### Cómo corre la app
- **Development build en el emulador de Android Studio** (`npx expo run:android`), **nunca Expo Go**: Google Sign-In y Google Maps necesitan código nativo y el paquete propio `com.dinno.app`. Requisitos e instalación en el README.
- La configuración nativa está en **`app.config.ts`** (no hay `app.json`). La carpeta `android/` la genera `prebuild` y no se versiona.
- El SHA-1 del build de desarrollo es el del `debug.keystore` de la plantilla y es igual en todos los computadores (README, sección 3).

### Versiones: Expo cambia en cada SDK, no confíes en la memoria
Expo SDK **57**, React Native **0.86**, React **19**, Expo Router, NativeWind **v4** con **Tailwind CSS v3**, TypeScript **6**, Node **24**.
1. Lee la versión de `expo` en `package.json`.
2. Consulta la documentación de esa versión: `https://docs.expo.dev/versions/v57.0.0/`.
3. Para lo demás, usa el índice https://docs.expo.dev/llms.txt y sigue el enlace de la página específica.

### Comandos
```bash
npm ci                       # instalar (o npm install después de cada pull)
npx expo prebuild --clean    # regenera android/ tras un cambio nativo (app.config.ts, librería nativa)
npx expo run:android         # compila e instala el development build
npx expo start               # servidor de desarrollo para el build instalado (-c limpia caché)
npx expo install <paquete>   # SIEMPRE para agregar librerías (elige versiones compatibles con el SDK)
npx expo lint                # lint
npm run typecheck            # chequeo de tipos (regenera los tipos de Expo y corre tsc)
npm test                     # pruebas (jest-expo)
npx expo-doctor              # diagnóstico de dependencias
```
**Antes de dar una tarea por terminada:** `npx expo lint`, `npm run typecheck` y `npm test` sin errores. Usa `npm run typecheck` y no `npx tsc --noEmit` suelto: `.expo/types/router.d.ts` y `expo-env.d.ts` se generan y no están en git, y si están viejos o faltan, `tsc` da errores falsos de rutas o de `global.css`.
Nunca agregues paquetes con `npm install <paquete>`; siempre con `npx expo install`, y solo después de preguntar.

### Estructura
- **Rutas solo en `src/app/`** (Expo Router): cada archivo es una pantalla y `_layout.tsx` define la navegación.
- Lo que no es pantalla va fuera de `src/app/`: componentes base en `src/components/ui/`, otros componentes en `src/components/`, lógica por funcionalidad en `src/features/<dominio>/`.
- Usa el alias `@/` para importar desde `src/`.
- Las carpetas `ios/` y `android/` se generan solas: **nunca las crees ni las edites a mano**; la configuración nativa va en `app.config.ts` y en plugins.
- Una librería con código nativo o un cambio en `app.config.ts` obliga a todos a recompilar (`npx expo prebuild --clean` + `npx expo run:android`): avísalo en `AVISOS.md`.
- Las fuentes (Plus Jakarta Sans 500/700/800) van incrustadas en el build con el plugin de `expo-font`; no se cargan con `useFonts`.
- Pantallas: solo con el kit de `@/components/ui` (catálogo en la ruta `/kit`, solo en desarrollo).
- Contratos de la API en `src/features/<dominio>/types.ts`; cada dominio tiene `api.ts` (elige real o mock con `EXPO_PUBLIC_USE_MOCKS`).

### Diseño: el manual de identidad v1.1 manda
- Si no tienes el manual en el contexto, **pídelo antes de hacer cualquier pantalla.**
- Los colores, radios, espacios y tipografía del manual (valores de `tokens.ts`, sección 16.5) se cargan en `tailwind.config.js` (NativeWind usa Tailwind **v3**, a diferencia de la web). **No uses colores sueltos** ni las clases genéricas de Tailwind para colores: la paleta, los radios y los tamaños de texto por defecto de Tailwind están desactivados.
- Clases con los mismos nombres de la web (`bg-surface text-fg border-line rounded-card`). Texto siempre con `Text` del kit (`variant`, `tone`). Para props que no aceptan `className` (íconos, navegación, mapa) usa `useTheme().colors`.
- Tema: el comensal elige *Sistema*, *Claro* u *Oscuro* (`useTheme().setPreference`); se guarda en el teléfono.
- Los mismos nombres de estados, textos y glosario que en la web.
- **Liquid Glass solo en lo que flota sobre el mapa** (manual, sección 7), con alternativa sólida.
- Objetivos táctiles de al menos 44 px; funciona en modo claro y oscuro.

### Conexión con el backend
- La URL del backend sale **solo de `src/config/env.ts`** (`env.apiUrl`) más el prefijo `/v1`. Nunca uses `process.env` en otra parte.
- `EXPO_PUBLIC_API_URL` es el origen **sin `/v1` y sin `/` final**. Las variables `EXPO_PUBLIC_*` quedan dentro de la app: **nunca pongas secretos en ellas.**
- Sesión: `useAuth()` de `src/features/session/SessionProvider.tsx` (Firebase JS SDK con persistencia). Un solo flujo tras cualquier inicio de sesión (`GET /me` → `PROFILE_REQUIRED` → `POST /diners/me`). Las rutas se abren por `status` con `Stack.Protected`: no redirijas a mano.
- Perfil: para mostrar los datos de la cuenta con carga y error propios, usa `useMeQuery()` (`src/features/account/queries.ts`, query key `['me']`; se borra con la caché al cerrar sesión) y `getDisplayName(profile)` (`src/features/account/profile-display.ts`: `displayName` o la parte del correo antes de `@`). No llames a `GET /me` por tu cuenta.
- Toda llamada pasa por `src/lib/api/client.ts` (`apiRequest`): token de Firebase, timeout de 60 s y errores normalizados (`ApiError` con `status`, `errorCode`, `kind`). Los textos para el usuario salen de `getErrorMessage`, nunca del `message` del backend.
- Búsqueda: lo que eligió el comensal (origen: ubicación, dirección **o** zona, radio, categoría, personas) vive en `useSearchStore` (`src/features/search/store.ts`, zustand) y se borra al cerrar sesión; los datos del servidor, en TanStack Query (`src/features/search/queries.ts`). La ubicación sale solo del GPS con `expo-location` (`src/features/location/`): permiso en primer plano, máximo 10 s y, si falla, la app pasa a zona.
- Tiempo real: `useAvailabilityRealtime` (`src/features/realtime/`) abre Socket.IO solo con sesión de comensal (montado en `(app)/_layout.tsx`; con datos de ejemplo no hay socket). Cada `availability.changed` actualiza la caché de búsquedas y detalles al instante y luego vuelve a consultar lo que está en pantalla. Respaldo: `refetchInterval` de 60 s en búsqueda y detalle, y nueva consulta al volver a la app y al recuperar internet (`connectQueryLifecycle` en `src/lib/query-client.ts`, con `AppState` y NetInfo). Si una petición tarda más de 5 s aparece «Conectando con DiNNo…» (`SlowConnectionNotice`).
- Búsqueda por dirección: `src/features/search/address.ts` llama a `GET /geocode` **solo al confirmar** (botón o tecla de búsqueda), valida 3–255 caracteres antes y recuerda las respuestas mientras la app esté abierta (incluido el 404). El cupo de Geocoding se comparte con la web: nunca la llames mientras el usuario escribe ni en pruebas contra el backend real (simula `geocode` en los tests). Con la dirección, la búsqueda usa `lat`/`lng` y el encabezado muestra «Cerca de: `formattedAddress`».
- Mapa: `react-native-maps` con `PROVIDER_GOOGLE`. La llave (`GOOGLE_MAPS_ANDROID_API_KEY`, sin `EXPO_PUBLIC_`) se lee en `app.config.ts` al compilar; `env.mapsEnabled` dice si el build la tiene (sin llave, solo lista). Pines con `tracksViewChanges={false}` y una `key` que cambia con la selección y la disponibilidad. No uses `mapPadding` (react-native-maps 1.27 se cae en Android). Lo que flota sobre el mapa usa el respaldo sólido del vidrio (manual 7): en Android el desenfoque no puede leer la superficie del mapa.
- `localhost` no funciona desde el emulador: el backend local es `http://10.0.2.2:3000`. Después de cambiar `.env`, reinicia con `npx expo start -c`.

### Despliegue
En el Sprint 2 la app se prueba y se presenta como development build en el emulador, contra el backend de Render. No hagas builds en EAS ni publiques actualizaciones sin que la persona lo pida.
