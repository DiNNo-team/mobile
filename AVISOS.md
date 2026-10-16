# Avisos de la app (mobile)

> Lo que el equipo debe saber de la app. Lo más nuevo arriba, con autor y fecha. Léelo antes de empezar cada día.

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
