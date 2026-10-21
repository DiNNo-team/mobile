# AGENTS.md · DiNNo · mobile (app del comensal)

Guía corta para asistentes de código. **Las reglas completas están en [`CLAUDE.md`](CLAUDE.md)**: léelo primero. Este archivo no las repite; resume cómo está el repo hoy y enlaza al resto. Para levantar el proyecto, ver el [`README.md`](README.md). Los cambios recientes del equipo están en [`AVISOS.md`](AVISOS.md).

## Expo cambia en cada SDK: no confíes en la memoria

Expo SDK 57, React Native 0.86, React 19, Expo Router, NativeWind v4 con **Tailwind CSS v3**, TypeScript 6 y Node 24. Antes de usar una API de Expo o React Native:

1. Lee la versión de `expo` en `package.json`.
2. Consulta la documentación de esa versión: `https://docs.expo.dev/versions/v57.0.0/`.
3. Para lo demás, usa el índice https://docs.expo.dev/llms.txt y sigue el enlace de la página específica.

## Cómo corre la app

- **Development build en el emulador de Android Studio** (`npx expo run:android`), **nunca Expo Go**: Google Sign-In y Google Maps necesitan código nativo y el paquete propio `com.dinno.app`.
- La configuración nativa está en **`app.config.ts`** (no hay `app.json`). Las carpetas `android/` e `ios/` las genera `prebuild`: no se versionan, no se crean ni se editan a mano.
- Un cambio nativo (`app.config.ts`, una librería con código nativo) obliga a todos a recompilar: `npx expo prebuild --clean` + `npx expo run:android`. Se avisa en `AVISOS.md`.
- **No hagas builds en EAS ni publiques actualizaciones** sin que la persona lo pida (`CLAUDE.md`, sección 11, «Despliegue»).

## Comandos

Solo **npm** (nada de yarn, pnpm ni bun).

```bash
npm ci                       # instalar (también después de cada pull)
npx expo run:android         # compila e instala el development build
npx expo prebuild --clean    # regenera android/ tras un cambio nativo
npx expo start               # servidor de desarrollo para el build instalado (-c limpia caché)
npx expo install <paquete>   # SIEMPRE para agregar librerías, y solo después de preguntar
npx expo lint                # lint
npx tsc --noEmit             # chequeo de tipos
npm test                     # pruebas (jest-expo)
npx expo-doctor              # diagnóstico de dependencias
```

Antes de dar una tarea por terminada: `npx expo lint`, `npx tsc --noEmit` y `npm test` sin errores. Hoy `tsc` tiene un error conocido de `global.css` (README, sección 8).

## Estructura actual

```
app.config.ts            configuración nativa (paquete com.dinno.app, plugins, llave de Maps al compilar)
src/
├── app/                 rutas de Expo Router; solo pantallas y _layout.tsx
│   ├── (auth)/          login, crear cuenta, verificar correo, recuperar contraseña, cuenta de restaurante, sin conexión
│   ├── (app)/(tabs)/    Explorar (index) y Perfil
│   └── (app)/restaurante/[id].tsx
├── components/ui/       kit móvil (Sebastián); catálogo en /kit, solo en desarrollo
├── config/env.ts        único lugar que lee process.env
├── features/            session, account, search, location, realtime
├── lib/                 cliente HTTP (api/), query-client, formato
└── theme/               tokens del manual y tema claro/oscuro
```

## Convenciones del código

- **Rutas solo en `src/app/`.** Lo que no es pantalla va en `src/components/` o en `src/features/<dominio>/`. Importa con el alias `@/`.
- **Sesión:** `useAuth()` de `src/features/session/SessionProvider.tsx`. Las rutas se abren por `status` con `Stack.Protected`: no redirijas a mano. Lo que se debe olvidar al cerrar sesión se registra con `onSignOut(...)`.
- **Backend:** toda llamada pasa por `apiRequest` (`src/lib/api/client.ts`); la URL sale solo de `src/config/env.ts`. Los textos de error salen de `getErrorMessage`, nunca del `message` del backend.
- **Cada dominio** tiene `types.ts` (contrato), `api.ts` (real o mock según `EXPO_PUBLIC_USE_MOCKS`) y consultas de TanStack Query. Los filtros de búsqueda viven en `useSearchStore` (zustand).
- **Pantallas solo con el kit** (`@/components/ui`) y los tokens del manual: sin colores sueltos ni clases genéricas de Tailwind. El texto siempre con `Text` del kit. Para props sin `className` (íconos, navegación, mapa) usa `useTheme().colors`. Detalle en `CLAUDE.md`, sección 11, «Diseño».
- **Pruebas:** jest-expo. Las de lógica pura van junto al archivo (`*.test.ts`); las de pantallas usan `react-test-renderer` (ver `src/features/session/auth-screens.test.tsx`).
- **Nombres en inglés** en el código; **textos de la interfaz en español**, con el glosario del manual.

## Lo que no se hace

Las reglas completas están en el `CLAUDE.md` (secciones 3 a 7). En corto:
- No hagas commit, push, merge ni rebase sin que la persona lo pida; nunca directo a `develop` ni a `main`.
- No leas ni edites `.env`; usa `.env.example`. Las `EXPO_PUBLIC_*` quedan dentro de la app: nunca secretos.
- No instales dependencias sin preguntar, y siempre con `npx expo install`.
- No modifiques `components/ui` (es de Sebastián) ni el código de otra persona sin avisar.
- Sin `console.log`, código comentado ni `TODO` sin dueño.
