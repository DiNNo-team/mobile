# Avisos de la app (mobile)

> Lo que el equipo debe saber de la app. Lo más nuevo arriba, con autor y fecha. Léelo antes de empezar cada día.

---

## 15 oct 2026 · Elizabeth · Contratos del Sprint 2 publicados

- Los contratos del Sprint 2 están en `CLAUDE.md`, sección "Sprint 2 · Contratos". Es la fuente de verdad para backend, web y app; si algo no está ahí, se pregunta antes de inventarlo. Las fechas de cada contrato están en la tabla "Cuándo está listo cada contrato en `develop`".
- **Cambio importante (llega a `develop` el 15 oct en la noche):** el backend deja de crear usuarios automáticamente. Por ahora el único correo real habilitado como restaurante es `dinnoteam2026@gmail.com`. Para probar la web como restaurante, usen esa cuenta o el usuario de desarrollo en local. Cualquier otra cuenta recibe 403 `ACCOUNT_NOT_ENABLED` en la web. Si necesitan habilitar otro correo, pídanselo a Elizabeth.

### Por persona (Sprint 2)

**Sebastián:**
- Todo el contrato de la app está en `CLAUDE.md`. Cliente HTTP: `BASE_URL + /v1`, `Authorization: Bearer <token>` y errores normalizados como en la web (`errorCode` del cuerpo; `message` nunca se muestra tal cual).
- Al iniciar sesión: llamar `GET /v1/me`. Si responde `PROFILE_REQUIRED` → `POST /v1/diners/me` y continuar. Si responde `RESTAURANT_ACCOUNT` → pantalla con el texto del contrato y *Cerrar sesión*. Si responde `EMAIL_NOT_VERIFIED` → ruta de verificación.
- `availability` en la búsqueda solo trae `available`, `few` o `none`; `closed` aparece solo en el detalle y en el WebSocket. Nunca se muestra un número de mesas.
- `distanceKm` llega como número: menos de 1 km se muestra en metros redondeados a 50 («a 650 m») y desde 1 km con un decimal y coma («a 1,4 km»).
- WebSocket: usa `isSearchable` para quitar o volver a consultar restaurantes en la lista y el mapa.
- Fechas en `develop`: roles y `/me` el jueves en la noche; búsqueda, zonas y detalle el viernes; WebSocket el sábado. Mientras tanto, datos de ejemplo con esa forma exacta.

**Jacobo:**
- Al crear la cuenta (correo y clave), después de verificar el correo se llama `POST /v1/diners/me` con `{ displayName }` (1–60 caracteres). Con Google, si no se envía `displayName`, el backend toma el nombre de la cuenta de Google.
- `POST /v1/diners/me` exige el correo verificado. Con correo sin verificar responde 401 `EMAIL_NOT_VERIFIED`.
- Con una cuenta de restaurante, la app recibe 403 `RESTAURANT_ACCOUNT`. Para probarlo, usa `dinnoteam2026@gmail.com`.

**Sergio:**
- Pantalla de perfil: `GET /v1/me` → `{ id, email, displayName, role, restaurantId }`. Si `displayName` viene en `null`, se muestra la parte del correo antes de `@`.
