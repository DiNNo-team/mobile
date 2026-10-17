# Avisos de la app (mobile)

> Lo que el equipo debe saber de la app. Lo más nuevo arriba, con autor y fecha. Léelo antes de empezar cada día.

---

## 16 oct 2026 (noche) · Sebastián · Mapa, detalle, filtros y sin resultados

**Después del pull hay que recompilar** (el mapa es código nativo):

```bash
npm install
npx expo prebuild --clean
npx expo run:android
```

**Dependencia nueva:** `react-native-maps` (mapa de Google, nativa).

**Variable nueva: `GOOGLE_MAPS_ANDROID_API_KEY`** (en `.env`, **sin** `EXPO_PUBLIC_`).
- La lee `app.config.ts` al compilar y va a la configuración de Android. No entra al JavaScript ni al repo.
- **Sin la llave la app funciona igual, pero solo con la lista** (no se cae).
- **Con la llave, cada vez que la pongas o la cambies, vuelve a correr `prebuild --clean` y `run:android`.** Si solo reinicias Metro, la app cree que hay mapa, pero el build no tiene la llave y se cierra.

**Qué hay en *Explorar*:**
- Selector *Mapa · Lista* (solo cuando el build tiene la llave).
- **Mapa:**
  - Pines con la forma y el color de la disponibilidad, y tu posición con el punto naranja.
  - Abajo, tarjetas que se deslizan. Tocar un pin mueve las tarjetas a la suya; deslizar una tarjeta lleva el mapa a su pin. El seleccionado se marca con borde naranja, también en la lista.
  - Tocar la tarjeta abre el detalle.
  - Las tarjetas usan el **respaldo sólido** del vidrio (manual 7): en Android el desenfoque no puede leer la superficie del mapa de Google.
- **Filtros** (hoja inferior): categoría, distancia (1, 2, 5 o 10 km) y personas (1 a 20).
  - Los filtros activos se ven como chips con «x», junto a «Limpiar filtros».
  - Se conservan al ir al detalle y volver.
- **Sin resultados:** «Ampliar a X km», «Cambiar filtros» y «Cambiar zona».
- **Detalle:**
  - Abierto o Cerrado; si está abierto, también la disponibilidad.
  - Dirección, distancia (solo si se busca con tu ubicación) y categoría.
  - «Cómo llegar», que abre Google Maps con la URL universal, sin API.
  - Horarios de la semana en 12 horas, con «(día siguiente)» y el día de hoy (hora de Bogotá) resaltado.
  - Un restaurante que no existe muestra «Este restaurante ya no está disponible» y «Volver a explorar».

**Equipo de Google Cloud (Jacobo, Santiago y Sergio):** el mapa está listo y solo falta la llave. Antes de entregármela por privado, revisen:
- Que **Maps SDK for Android** esté activo y con la prueba gratuita.
- Que la llave esté restringida a `com.dinno.app` + el SHA-1 del README y solo a *Maps SDK for Android*.

**Probado contra Render:** la cuenta de comensal de prueba del equipo entra, crea su perfil y ve Casa 72 con su disponibilidad. También funcionan la distancia, el filtro de categoría y el detalle con el horario que cierra al día siguiente. Los pines del mapa todavía no se han visto con una llave real: con una llave inválida, Google no dibuja nada encima del mapa.

**Santiago y Elizabeth:** cuando los 15 restaurantes estén en Render, aviso si algo se ve mal en el mapa o el detalle.

---

## 16 oct 2026 (tarde) · Sebastián · Ubicación, zonas y lista de resultados

**Después del pull hay que recompilar** (la ubicación es código nativo):

```bash
npm install
npx expo prebuild --clean
npx expo run:android
```

**Dependencias nuevas:**
- `expo-location`: GPS del teléfono, solo en primer plano (sin ubicación en segundo plano).
- `zustand`: estado de la búsqueda.

**Qué hay en *Explorar*:**
- La primera vez, una explicación antes del permiso: «Usar mi ubicación» o «Elegir una zona».
- Si el permiso se rechaza, el GPS está apagado o pasan 10 s sin posición, la app abre las zonas (`GET /search/zones`) con un mensaje. Nunca se queda en blanco. «Cambiar zona» cambia entre ubicación y zona cuando quieras.
- Lista de resultados, del más cercano al más lejano: nombre, chip de disponibilidad, categoría, distancia («a 650 m», «a 1,4 km») y dirección. Tiene skeleton, error con «Intentar de nuevo», deslizar para actualizar y un estado sin resultados con «Ampliar a X km» y «Cambiar zona».
- La búsqueda se conserva al ir al detalle y volver, y se borra al cerrar sesión.

**Sergio:** el selector de tema (*Sistema · Claro · Oscuro*) pasó a la pantalla provisional de *Perfil*. Llévalo a tu pantalla con `useTheme()`; el código de ejemplo está en `src/app/(app)/(tabs)/perfil.tsx`.

**Santiago (QA de C3 a C6):** cómo simular la posición, repetir el permiso y apagar el GPS está en el README, sección 3.
- El emulador arranca en California: envía `adb emu geo fix -74.0567 4.6576` (Calle 72) antes de tocar «Usar mi ubicación».
- Si el emulador tiene internet pero la app dice «No pudimos conectarnos», ábrelo con `-dns-server 8.8.8.8,1.1.1.1`. Me pasó hoy y no era la app.

**Elizabeth:**
- La PBI 2.2 dice «dirección o zona», pero en el contrato el comensal solo puede buscar por zona: `/geocode` es solo para `restaurant_admin`. La app ofrece solo zonas, como dice el reparto (2.3, «no usa geocodificación»). Si quieren búsqueda por dirección, haría falta un endpoint para comensales.
- La búsqueda contra Render todavía no la pude probar con una cuenta de comensal real; `dinnoteam2026@gmail.com` es de restaurante y entra bien a `/cuenta-restaurante`. Cuando haya una cuenta de comensal de prueba, la verifico.

---

## 16 oct 2026 · Sebastián · Sesión, login con correo y rutas protegidas

**Después del pull:** `npm install` (dependencia nueva: `firebase`, solo JavaScript, así que **no hay que recompilar**). Tu `.env` necesita las tres `EXPO_PUBLIC_FIREBASE_*`, o `EXPO_PUBLIC_USE_MOCKS=true` para trabajar sin Firebase.

**Cómo funciona la sesión** (`src/features/session/`):
- Firebase Auth con el SDK de JavaScript (el mismo proyecto de la web). La sesión **se conserva al cerrar y abrir la app**.
- **Un solo flujo después de cualquier inicio de sesión:** `GET /me`. Si responde `PROFILE_REQUIRED`, la app hace `POST /diners/me` y continúa. El rol lo decide el backend.
- Con una cuenta de restaurante, `GET /me` responde **200 con `role: 'restaurant_admin'`** (no 403). La app la manda igual a `/cuenta-restaurante`; el 403 `RESTAURANT_ACCOUNT` solo llega de `POST /diners/me` y de los endpoints de comensal.
- **Las rutas se abren solas según el estado** (`useAuth().status`), con `Stack.Protected`. **No hagas `router.replace('/login')` ni redirecciones a mano**: cambia el estado y la app navega sola.

  | `status` | Pantalla |
  |---|---|
  | `signed-out` | `/login`, `/crear-cuenta`, `/recuperar-contrasena` |
  | `email-not-verified` | `/verificar-correo` |
  | `restaurant-account` | `/cuenta-restaurante` |
  | `unreachable` | `/sin-conexion` («Intentar de nuevo» o «Cerrar sesión») |
  | `restoring` / `resolving` | splash / `/conectando` («Conectando con DiNNo…») |
  | `ready` | pestañas Explorar y Perfil, detalle |

- **401 sin `errorCode`** en cualquier llamada: cierra la sesión y el login muestra «Tu sesión terminó. Inicia sesión de nuevo.».

**Jacobo, lo que tienes listo en `useAuth()`** (`@/features/session/SessionProvider`):
- **Google:**

  ```ts
  signInWithFirebase(() => signInWithCredential(getFirebaseAuth(), GoogleAuthProvider.credential(idToken)))
  ```

  `getFirebaseAuth` está en `@/features/session/firebase`. Devuelve `{ ok: true }` o `{ ok: false, message }` (el texto ya viene listo para un `Alert`). El nombre de Google se envía solo a `POST /diners/me`.
- **Crear cuenta:**

  ```ts
  signInWithFirebase(async () => { const c = await createUserWithEmailAndPassword(...); await sendEmailVerification(c.user); }, { errorMessage: getFirebaseSignUpErrorMessage, displayName: nombre })
  ```

  Como el correo todavía no está verificado, la app pasa sola a `/verificar-correo`. Los textos de error (iguales a la web) están en `@/features/session/auth-errors`, y la validación de la contraseña (mínimo 8) en `validateNewPassword` de `@/features/session/validation`.
- **«Ya lo verifiqué»:** `reloadEmailVerification()`. Recarga la cuenta, pide un token nuevo y, si ya está verificada, crea el perfil y entra. Devuelve `true` o `false`, para que puedas decir «Todavía no vemos tu correo verificado».
- **«Reenviar»:** `sendEmailVerification(getFirebaseAuth().currentUser!)`. **Cerrar sesión:** `signOut()`. El correo de la cuenta está en `user.email`.
- **Tus pantallas ya existen como ruta, con una versión provisional:** `/crear-cuenta`, `/verificar-correo` y `/recuperar-contrasena`. El login ya tiene «¿Olvidaste tu contraseña?» y «Crea tu cuenta» apuntando a ellas.
- **El botón «Continuar con Google»** va en `src/app/(auth)/login.tsx`, justo debajo de «Iniciar sesión». Hay un comentario marcando el lugar.

**Sergio, para Perfil:**
- `useAuth().profile` trae `{ id, email, displayName, role, restaurantId }`; si `displayName` es `null`, usa la parte del correo antes de `@`.
- `signOut()` limpia la caché, los filtros y el socket. Va dentro del `Dialog` «¿Cerrar sesión?».
- La pantalla provisional de Perfil tiene un botón temporal de cerrar sesión; reemplázalo.

**Para probar sin Firebase** (`EXPO_PUBLIC_USE_MOCKS=true`):
- Cualquier correo entra como comensal.
- `restaurante@dinno.test` → cuenta de restaurante.
- `sinverificar@dinno.test` → verificación.
- `sinconexion@dinno.test` → error de conexión.
- La contraseña `incorrecta` siempre falla.

**Elizabeth:** ya ajusté `category` y `address` a `| null` en los tipos de búsqueda y detalle, como pediste. Sin categoría no se muestra nada; sin dirección se muestra «Dirección por confirmar». Además, dos cosas del backend:
1. **Cuenta de Firebase recreada.** Cuando el correo ya está vinculado a otro UID (alguien borró y volvió a crear su cuenta de Firebase), el resolver responde **401 sin `errorCode`**. La app lo trata como «Tu sesión terminó…», y la persona vuelve a entrar y recibe lo mismo, en bucle. ¿Se puede responder con un código propio (por ejemplo `403 ACCOUNT_CONFLICT`)? Así la app diría «Hay un problema con tu cuenta. Escríbele al equipo de DiNNo.». Si lo agregas, me avisas y lo conecto.
2. **Cuentas de prueba para QA.** Para probar contra Render necesitamos un comensal real (correo y clave de Firebase, con el correo verificado) y saber si `dinnoteam2026@gmail.com` tiene clave o solo Google. ¿Las puedes compartir por privado con Jacobo, Santiago, Sergio y conmigo?

---

## 15 oct 2026 (noche) · Elizabeth · Backend del Sprint 2 disponible en `develop`

- **Todo el backend del Sprint 2 está en `develop` desde el 15 oct** (PR #35 a #40 del backend): cuentas y roles, búsqueda con zonas y filtros, detalle público, geocodificación y tiempo real. Ya no hace falta esperar a ninguna fecha: con `EXPO_PUBLIC_USE_MOCKS=false` la app usa la API real.
- **El contrato sigue en `CLAUDE.md`, sección 10**, ahora idéntica en los tres repos. Hoy cambió solo la parte de **Tiempo real** (`auth` como función, `EMAIL_NOT_VERIFIED`, `SERVER_ERROR` y cuándo reintentar) y la tabla "Cuándo está listo cada contrato en `develop`". El detalle de cada endpoint, con ejemplos, está en Swagger: `https://dinno-backend.onrender.com/docs`.
- Las fechas de la entrada "Contratos del Sprint 2 publicados" (más abajo) quedan superadas.

### Por persona

**Sebastián (búsqueda, detalle y tiempo real):**
- **URL:** `EXPO_PUBLIC_API_URL` sin `/v1`. Las rutas HTTP van con `/v1`; el WebSocket va al mismo origen **sin** `/v1` (ruta por defecto `/socket.io`).
- **Rutas que usa la app** (todas con `Authorization: Bearer <token de Firebase>`): `GET /v1/me`, `POST /v1/diners/me`, `GET /v1/search/zones`, `GET /v1/search/restaurants` (`lat` + `lng` **o** `zone`, `radiusKm` 1, 2, 5 o 10, `category` y `partySize` opcionales) y `GET /v1/restaurants/:id/public` (`lat` y `lng` opcionales, juntas).
- **Qué hacer con cada error** (siempre por `errorCode`, nunca por el texto):
  - `400`: `message` es una lista. Con la interfaz no debería pasar (los valores salen de listas cerradas); si pasa, muestra un error genérico.
  - `401` sin `errorCode`: la sesión terminó → login. `401` `EMAIL_NOT_VERIFIED` → `/verificar-correo`.
  - `403` `PROFILE_REQUIRED` → `POST /v1/diners/me` y reintenta. `403` `RESTAURANT_ACCOUNT` → `/cuenta-restaurante`.
  - `404` `RESTAURANT_NOT_FOUND` (solo el detalle): «Este restaurante ya no está disponible.» con la opción de volver. Pasa también si el id no es un UUID válido.
  - `500`: error genérico con «Intentar de nuevo».
- **`availability`:** `available`, `few` o `none` en la búsqueda; además `closed` en el detalle y en el WebSocket. Nunca llega un número de mesas.
- **`distanceKm`:** número en km con 2 decimales; el formato («a 650 m», «a 1,4 km») lo hace la app. En el detalle solo viene si envías `lat` y `lng`.
- **En el contrato, `category` y `address` pueden llegar en `null`**, tanto en la búsqueda como en el detalle (restaurantes creados antes del registro completo). Hoy `RestaurantSummary` en `src/features/search/types.ts` los tiene como no nulos; revisa también el tipo del detalle. **Hay que ajustarlos a `| null`** y mostrar un texto por defecto cuando falten.
- **WebSocket:** `io(BASE_URL, { auth: async (cb) => cb({ token: await user.getIdToken() }) })`, con `auth` como función para que cada reconexión lleve un token vigente. Evento `availability.changed` → `{ restaurantId, availability, isOpenNow, isSearchable }`; usa `isSearchable` para quitar el restaurante o volver a consultar la búsqueda. `connect_error` trae el código en `error.message`: `UNAUTHORIZED`, `EMAIL_NOT_VERIFIED`, `PROFILE_REQUIRED`, `RESTAURANT_ACCOUNT` o `SERVER_ERROR`. **Socket.IO no reintenta solo una conexión rechazada:** con `SERVER_ERROR`, reintenta tú con espera creciente (por ejemplo 5 s, 15 s, 30 s) y mientras tanto sigue la consulta cada 60 s; con los demás códigos no reintentes. Respaldo: consultar al volver al primer plano, al reconectar y cada 60 s.
- **Para ver los eventos sin la app:** en el repo del backend, `node scripts/listen-availability.mjs` (README del backend, sección 6).

**Jacobo (crear cuenta y verificación):**
- **El backend ya no crea usuarios al iniciar sesión.** Una cuenta de Firebase nueva queda *sin perfil*: `GET /v1/me` responde `403 PROFILE_REQUIRED` y la app crea el perfil con `POST /v1/diners/me`.
- **`POST /v1/diners/me`:** body `{ displayName?: string }` (se recortan los espacios; de 1 a 60 caracteres). Sin `displayName`, el backend usa el nombre de la cuenta de Google y, si no hay, la parte del correo antes de `@`. Responde `201` si lo crea y `200` si ya era comensal (no cambia nada), con la misma forma que `GET /v1/me`. Exige el correo verificado: si no, `401 EMAIL_NOT_VERIFIED`. Con una cuenta o un correo de restaurante: `403 RESTAURANT_ACCOUNT`.
- **Códigos que ve la app:** `EMAIL_NOT_VERIFIED` (401), `PROFILE_REQUIRED` y `RESTAURANT_ACCOUNT` (403). `ACCOUNT_NOT_ENABLED` y `DINER_ACCOUNT` son de la web: la app nunca los recibe.
- **Para probar:** `dinnoteam2026@gmail.com` es una cuenta de restaurante, así que en la app debe llevar a `/cuenta-restaurante`. Con cualquier otro correo verificado se crea un comensal nuevo.

**Sergio (perfil y matriz de pruebas):**
- **Perfil:** `GET /v1/me` → `{ id, email, displayName, role, restaurantId }`. En un comensal, `displayName` siempre trae valor; si llega `null`, muestra la parte del correo antes de `@`.
- **Nombres exactos para la matriz:**
  - `errorCode` de HTTP: `EMAIL_NOT_VERIFIED`, `ACCOUNT_NOT_ENABLED`, `PROFILE_REQUIRED`, `DINER_ACCOUNT`, `RESTAURANT_ACCOUNT`, `RESTAURANT_REQUIRED`, `RESTAURANT_NOT_FOUND`, `ADDRESS_NOT_FOUND` y `GEOCODING_UNAVAILABLE`.
  - Códigos del `connect_error` del WebSocket: `UNAUTHORIZED`, `EMAIL_NOT_VERIFIED`, `PROFILE_REQUIRED`, `RESTAURANT_ACCOUNT` y `SERVER_ERROR`.
  - `availability`: `available`, `few`, `none` y `closed`.
- **QA de tiempo real:** el script `scripts/listen-availability.mjs` vive en el repo del backend. Uso y ejemplos en el `AVISOS.md` del backend (sección de Sergio) y en su README, sección 6.

---

## 15 oct 2026 (noche) · Sebastián · Kit móvil publicado (`src/components/ui`)

**Después del pull hay que recompilar**, porque las fuentes ahora van incrustadas en el build:

```bash
npm install
npx expo prebuild --clean
npx expo run:android
```

> **Corrección del aviso anterior:** tras un cambio nativo (`app.config.ts`, fuentes o una librería nativa) no basta con `npx expo run:android`, porque no regenera `android/` si ya existe. Siempre va primero `npx expo prebuild --clean`.

**Catálogo:** con la app en desarrollo, abre Explorar → «Ver el kit móvil» (ruta `/kit`). Ahí está cada componente con todos sus estados, en claro y oscuro (el selector de tema está arriba). Ábrelo antes de armar una pantalla.

**Jacobo y Sergio, cómo armar una pantalla:**
- **Todo sale de `@/components/ui`:**

  ```tsx
  import { Button, ScreenHeader, Text, TextField } from '@/components/ui';
  ```

  No uses `Text`, `TextInput` ni `Pressable` de React Native para cosas visibles, ni `style` con colores, ni `className` con colores o tamaños. Si te falta algo, pídemelo y lo agrego al kit.
- **`className` en los componentes del kit es solo para posición:** márgenes (`mt-4`), ancho (`self-stretch`).
- **Un solo `Button` primario por pantalla.** Los botones dicen verbo + objeto («Crear cuenta», «Cerrar sesión»). Mientras guarda: `loading` + `loadingLabel="Creando cuenta…"`.
- **Formularios:** `TextField` con `label` siempre visible y `optional` para «(opcional)». `errorText` dice qué hacer («Escribe tu correo»), no «Campo requerido». `password` agrega el ojo. Se valida al salir del campo y al enviar, nunca en cada tecla.
- **Estados de carga, vacío y error en cada pantalla:**
  - Carga: `Skeleton` con la forma real, más `useDelayedLoading(isPending)` para no mostrarlo si tarda menos de 300 ms.
  - Vacío: `EmptyState`.
  - Error: `ErrorState`, con el botón «Intentar de nuevo» y `getErrorMessage(error)` como descripción.
- **Confirmaciones:** `Dialog`. Sergio, para «¿Cerrar sesión?» tienes el ejemplo en `/kit` (acciones apiladas y a lo ancho, la principal arriba).
- **Avisos:** `Alert` dentro de la pantalla (los errores no desaparecen solos) y `useToast().showToast({ type, message })` para confirmaciones cortas.
- **Encabezado:** `ScreenHeader` con `title`, `subtitle`, `showBack` (flecha atrás) y `actions`.
- **Tema (Sergio, Perfil):** `SegmentedControl` con *Sistema / Claro / Oscuro* y `useTheme()`. Hay un ejemplo arriba en `/kit`.
- **Marca:** `<Logo />` (cambia solo a la versión oscura) y `<BrandSymbol />`.

**Lista del kit:**

| Componente | Para qué |
|---|---|
| `Text` | Todo texto. `variant`: `display`, `h1`, `h2`, `h3`, `body`, `sec`, `label`, `figure`, `button`, `fieldLabel`, `chip`. `tone`: `default`, `secondary`, `accent`, `error`… |
| `Button` | `primary`, `secondary`, `outline`, `ghost` y `danger`. Tamaños `md` 48, `float` 44 y `sm` 40. Admite `icon`, `loading` y `fullWidth` |
| `IconButton` | Solo ícono, 44 × 44. `accessibilityLabel` obligatorio |
| `Icon` | Ícono Lucide con trazo 1.75 y color de token |
| `TextField` | Campo con label, ayuda, error, `optional`, `password` e `icon` |
| `Card` | Tarjeta. Con `onPress` se puede tocar; `selected` pone el borde naranja |
| `AvailabilityChip`, `OpenStatusChip`, `StatusChip` | Disponible · Pocas mesas · Sin mesas · Cerrado, y Abierto (con pulso) / Cerrado |
| `AvailabilityMarker`, `UserLocationMarker` | Pines del mapa con la forma del estado, y el punto naranja con radar del usuario |
| `FilterChip` | Opciones de filtro y filtros activos con `x` |
| `SegmentedControl` | Elegir una opción (distancia, tema) |
| `NumberStepper` | Número con − / + (personas, de 1 a 20) |
| `Alert` | Aviso en línea: `success`, `info`, `warning` o `error` |
| `ToastProvider` / `useToast` | Aviso temporal; ya está montado en la raíz |
| `Dialog` | Confirmación modal |
| `BottomSheet` | Hoja inferior con título, contenido desplazable y pie fijo |
| `EmptyState`, `ErrorState` | Sin datos / error de carga con «Intentar de nuevo» |
| `Skeleton`, `useDelayedLoading`, `Spinner` | Carga |
| `ScreenHeader` | Encabezado de pantalla |
| `FloatingSurface` | Controles sobre el mapa (sólido por ahora; el vidrio llega con el mapa) |
| `Logo`, `BrandSymbol` | Marca |

**Textos:**
- El botón de reintentar dice **«Intentar de nuevo»** (manual 11.4), igual que en la web. El reparto dice «Reintentar», pero así web y app hablan igual.
- Disponibilidad: Disponible · Pocas mesas · Sin mesas · Cerrado (reparto 2.2), nunca con número de mesas.

**Para el equipo de Google Cloud y Jacobo, sobre el SHA-1** (el mismo del aviso anterior, explicado):
- Las llaves de Google se restringen para que solo nuestra app pueda usarlas. Google la reconoce por dos datos: el paquete **`com.dinno.app`** y la huella **SHA-1** `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`.
- **Equipo de Google Cloud:** son los dos datos que pide la llave de Android (checklist 7, punto 4: *Restricciones de aplicación → Apps de Android → Agregar*).
- **Jacobo:** son los mismos para el cliente OAuth de Android de Google Sign-In en Firebase (*Configuración del proyecto → Agregar huella digital*).
- Es igual en todos los computadores, así que no hay que agregar una por persona.

**Pendiente para un sprint futuro:** adaptar la app a iPhone. Mientras tanto, todo se escribe sin nada exclusivo de Android.

---

## 15 oct 2026 · Sebastián · Development build, tokens, rutas y cliente HTTP

**La app ya no se abre con Expo Go.** Corre como *development build* en el emulador de Android Studio, porque Google Sign-In y Google Maps necesitan código nativo y el paquete propio `com.dinno.app`.
- **Una vez por computador:** instala Android Studio, el JDK 17 y un emulador con imagen «Google Play». Los pasos están en el README (sección 1). En Windows, el repo va fuera de OneDrive y en una ruta corta.
- **Cada vez que cambie algo nativo** (`app.config.ts` o una librería nativa nueva, siempre anunciado aquí): `npx expo run:android`. **El resto del tiempo:** `npx expo start` y presiona `a`.
- `app.json` ya no existe: la configuración nativa está en `app.config.ts`. Ícono, splash y colores son los del manual.
- **SHA-1 del build de desarrollo** (igual en todos los computadores): `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`, paquete `com.dinno.app`. Equipo de Google Cloud: es el que va en la llave de Android. Jacobo: es el del cliente OAuth de Android en Firebase.
- **Ubicación simulada:** `adb emu geo fix -74.0567 4.6576` (Calle 72; **longitud primero**).

**Variables nuevas en `.env.example`** (copia las que te falten a tu `.env` y reinicia con `npx expo start -c`):
- `EXPO_PUBLIC_USE_MOCKS`: con `true`, la app usa datos de ejemplo con la forma exacta del contrato (10 restaurantes alrededor de la Calle 72 con los tres niveles de disponibilidad, 2 cerrados que solo se ven en el detalle, horarios que cierran al día siguiente y de 24 horas, y las 20 zonas).
- `EXPO_PUBLIC_DEV_USER_ID`: solo para el backend local, envía `x-dev-user-id` cuando no hay sesión.
- `EXPO_PUBLIC_FIREBASE_API_KEY`, `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN` y `EXPO_PUBLIC_FIREBASE_PROJECT_ID`: los mismos valores de la web.
- Backend local desde el emulador: `EXPO_PUBLIC_API_URL=http://10.0.2.2:3000`.

**Dependencias nuevas:** `expo-dev-client`, `@expo-google-fonts/plus-jakarta-sans`, `react-native-svg`, `lucide-react-native`, `@tanstack/react-query` y `@react-native-async-storage/async-storage`. Para desarrollo: `jest-expo`, `jest` y `@types/jest`. Además se alinearon los parches del SDK con `npx expo install --fix`. Después del pull: `npm install` y `npx expo run:android`.

**Diseño (para Jacobo y Sergio):**
- Tailwind **solo conoce los tokens del manual**. `bg-slate-*`, `text-blue-*`, `rounded-lg` y `text-5xl` ya no existen. Las clases se llaman igual que en la web: `bg-surface`, `text-fg`, `text-fg-2`, `border-line`, `rounded-card`, `bg-ok/15`…
- El texto va siempre con `Text` de `@/components/ui/Text`, con `variant` (`h1`, `h2`, `h3`, `body`, `sec`, `label`, `button`…) y `tone` (`secondary`, `accent`, `error`…). No uses el `Text` de React Native.
- Para íconos, navegación o mapa (props sin `className`): `const { colors } = useTheme()` y `colors.accentText`, `colors.text2`, etc.
- Íconos: solo `lucide-react-native`, con `strokeWidth={1.75}`.
- El kit completo llega mañana (fase 2), con su aviso aquí.

**Rutas** (las pantallas pendientes muestran quién las hace):
- `(auth)`: `/login` (Sebastián), `/crear-cuenta` (Jacobo), `/verificar-correo` (Jacobo) y `/cuenta-restaurante` (mensaje de `RESTAURANT_ACCOUNT`).
- `(app)/(tabs)`: `/` (Explorar) y `/perfil` (Sergio).
- `(app)/restaurante/[id]`: detalle.
- La protección de rutas por sesión llega con el login (fase 3).

**Sergio, sobre el tema:** el comensal elige *Sistema*, *Claro* u *Oscuro* y la elección se guarda en el teléfono. Va en tu pestaña Perfil: `const { preference, setPreference } = useTheme()` (`'system' | 'light' | 'dark'`). Mientras llega el kit, hay un selector de prueba en Explorar.

**Para todos:**
- Cliente HTTP: `apiRequest` en `src/lib/api/client.ts`. Los errores llegan como `ApiError` (`status`, `errorCode`, `kind`) y el texto para el usuario sale de `getErrorMessage`.
- Contratos: `src/features/search/types.ts` y `src/features/account/types.ts`.
- **Categorías:** uso las etiquetas de la web («Mariscos», «Cafetería»). La §2.3 del reparto dice «Pescados y mariscos» y «Café», pero también dice «igual a la web». Si se cambian, hay que cambiarlas en los dos repos.
- Comandos antes de un PR: `npx expo lint`, `npx tsc --noEmit` y `npm test`.

---

## 15 oct 2026 · Elizabeth · Contratos del Sprint 2 publicados

- Los contratos del Sprint 2 están en `CLAUDE.md`, sección "Sprint 2 · Contratos". Es la fuente de verdad para backend, web y app; si algo no está ahí, se pregunta antes de inventarlo. Las fechas de cada contrato están en la tabla "Cuándo está listo cada contrato en `develop`".
- **Cambio importante (ya en `develop` desde el 15 oct):** el backend deja de crear usuarios automáticamente. Por ahora el único correo real habilitado como restaurante es `dinnoteam2026@gmail.com`. Para probar la web como restaurante, usen esa cuenta o el usuario de desarrollo en local. Cualquier otra cuenta recibe 403 `ACCOUNT_NOT_ENABLED` en la web. Si necesitan habilitar otro correo, pídanselo a Elizabeth.

### Por persona (Sprint 2)

**Sebastián:**
- Todo el contrato de la app está en `CLAUDE.md`. Cliente HTTP: `BASE_URL + /v1`, `Authorization: Bearer <token>` y errores normalizados como en la web (`errorCode` del cuerpo; `message` nunca se muestra tal cual).
- Al iniciar sesión: llamar `GET /v1/me`. Si responde `PROFILE_REQUIRED` → `POST /v1/diners/me` y continuar. Si responde `RESTAURANT_ACCOUNT` → pantalla con el texto del contrato y *Cerrar sesión*. Si responde `EMAIL_NOT_VERIFIED` → ruta de verificación.
- `availability` en la búsqueda solo trae `available`, `few` o `none`; `closed` aparece solo en el detalle y en el WebSocket. Nunca se muestra un número de mesas.
- `distanceKm` llega como número: menos de 1 km se muestra en metros redondeados a 50 («a 650 m») y desde 1 km con un decimal y coma («a 1,4 km»).
- WebSocket: usa `isSearchable` para quitar o volver a consultar restaurantes en la lista y el mapa. (Conexión, códigos y reintentos actualizados en la entrada "Backend del Sprint 2 disponible en `develop`".)
- ~~Fechas en `develop`: roles y `/me` el jueves en la noche; búsqueda, zonas y detalle el viernes; WebSocket el sábado. Mientras tanto, datos de ejemplo con esa forma exacta.~~ **Superado:** todo está en `develop` desde el 15 oct (ver la entrada "Backend del Sprint 2 disponible en `develop`").

**Jacobo:**
- Al crear la cuenta (correo y clave), después de verificar el correo se llama `POST /v1/diners/me` con `{ displayName }` (1–60 caracteres). Con Google, si no se envía `displayName`, el backend toma el nombre de la cuenta de Google.
- `POST /v1/diners/me` exige el correo verificado. Con correo sin verificar responde 401 `EMAIL_NOT_VERIFIED`.
- Con una cuenta de restaurante, la app recibe 403 `RESTAURANT_ACCOUNT`. Para probarlo, usa `dinnoteam2026@gmail.com`.

**Sergio:**
- Pantalla de perfil: `GET /v1/me` → `{ id, email, displayName, role, restaurantId }`. Si `displayName` viene en `null`, se muestra la parte del correo antes de `@`.
