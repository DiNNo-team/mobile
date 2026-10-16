# DiNNo — App móvil (comensal)

Aplicación móvil de DiNNo para el comensal: búsqueda de restaurantes, disponibilidad y microreservas.
Construida con **React Native + Expo (SDK 57)**, **Expo Router**, **TypeScript** y **NativeWind v4**
(Tailwind v3). Consume la API del backend (NestJS, repositorio aparte).

> **La app corre como _development build_ en el emulador de Android Studio, no en Expo Go.**
> Google Sign-In y Google Maps necesitan código nativo propio de la app (paquete `com.dinno.app`),
> que Expo Go no trae.

## 1. Requisitos (una sola vez por computador)

| Qué | Cómo |
|---|---|
| **Node.js 24** | Fijado en `.nvmrc` y `engines`. Con nvm: `nvm use` |
| **JDK 17** | macOS: `brew install --cask zulu@17`. Windows: `choco install -y microsoft-openjdk17` (o el instalador de Microsoft OpenJDK 17) |
| **Android Studio** | https://developer.android.com/studio · instalación **Standard** |
| **SDK de Android** | Android Studio → *Settings → Languages & Frameworks → Android SDK*. En *SDK Platforms*: **Android 16 (Baklava) → Android SDK Platform 36**. En *SDK Tools*: Build-Tools, Emulator y Platform-Tools |
| **Emulador** | *More Actions → Virtual Device Manager → Create virtual device* → un **Pixel** reciente con imagen **«Google Play»** (sin Google Play no funcionan Maps ni Google Sign-In) |

**Variables de entorno.** macOS (`~/.zshrc`):

```bash
export JAVA_HOME=/Library/Java/JavaVirtualMachines/zulu-17.jdk/Contents/Home
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools
```

Windows (Configuración → *Variables de entorno* del usuario):
`JAVA_HOME` = la carpeta del JDK 17 (por ejemplo `C:\Program Files\Microsoft\jdk-17…`), `ANDROID_HOME = %LOCALAPPDATA%\Android\Sdk`
y agrega `%ANDROID_HOME%\platform-tools` y `%ANDROID_HOME%\emulator` al `Path`.

Verifica en una terminal nueva: `java -version` (debe decir 17), `adb version` y `emulator -list-avds`.

> ⚠️ **Windows: el repo va fuera de OneDrive y en una ruta corta**, por ejemplo `C:\dev\dinno\mobile`.
> Las rutas largas de OneDrive rompen Gradle.

## 2. Instalación

```bash
git clone https://github.com/DiNNo-team/mobile.git dinno-mobile
cd dinno-mobile
nvm use          # opcional, usa Node 24
npm ci
cp .env.example .env   # y completa los valores (ver sección 4)
```

Para agregar librerías usa siempre `npx expo install <paquete>` (elige versiones compatibles con el SDK).

## 3. Correr la app (development build)

1. Enciende el emulador desde Android Studio (*Device Manager* → ▶) o con `emulator -avd <nombre>`.
2. **La primera vez, y cada vez que cambie algo nativo** (`app.config.ts`, una librería nativa nueva):
   ```bash
   npx expo run:android
   ```
   Genera la carpeta `android/` (no se versiona), compila con Gradle, instala **DiNNo** en el emulador y
   abre el servidor de desarrollo. La primera compilación tarda varios minutos.
3. **El resto del tiempo** (solo cambias código TypeScript): `npx expo start` y presiona `a`. La app ya
   instalada se conecta al servidor y los cambios se ven al guardar.

Si algo nativo se ve raro después de un `git pull`: `npx expo prebuild --clean` y `npx expo run:android`.

### SHA-1 del build (Google Cloud y Firebase)

La llave de Google Maps y el cliente OAuth de Google Sign-In están restringidos al paquete
**`com.dinno.app`** y al **SHA-1** del certificado con que se firma el build. El build de desarrollo
usa el `debug.keystore` que trae la plantilla de Expo, así que el SHA-1 es **el mismo en todos los
computadores**:

```
SHA1: 5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25
```

Para comprobarlo en tu equipo (después de `npx expo run:android` o `npx expo prebuild`):

```bash
keytool -list -v -keystore android/app/debug.keystore -storepass android -alias androiddebugkey | grep SHA1
# o: cd android && ./gradlew signingReport
```

### Simular la ubicación del emulador

Con el emulador encendido, **longitud primero y luego latitud**:

```bash
adb emu geo fix -74.0567 4.6576    # Calle 72
adb emu geo fix -74.0306 4.6949    # Usaquén
adb emu geo fix -75.5812 6.2442    # Medellín (fuera de Bogotá: sin resultados)
```

También se puede en el emulador: *⋯ (Extended controls) → Location*.

## 4. Variables de entorno

Se leen solo en [`src/config/env.ts`](src/config/env.ts); en el resto del código usa `env`, nunca `process.env`.

| Variable | Descripción |
|---|---|
| `EXPO_PUBLIC_API_URL` | Origen del backend, **sin `/v1` y sin `/` final**. Render: `https://dinno-backend.onrender.com`. Backend local desde el emulador: `http://10.0.2.2:3000` (`localhost` en el emulador es el propio emulador) |
| `EXPO_PUBLIC_USE_MOCKS` | `true` usa datos de ejemplo en memoria con la forma del contrato (10 restaurantes alrededor de la Calle 72, 20 zonas) |
| `EXPO_PUBLIC_DEV_USER_ID` | Solo backend local: UUID de un usuario para la cabecera `x-dev-user-id` cuando no hay sesión de Firebase |
| `EXPO_PUBLIC_FIREBASE_*` | Configuración pública de Firebase (la misma de la web) |

`.env` no se versiona. Después de cambiarlo: `npx expo start -c`.

## 5. Comandos

| Comando | Qué hace |
|---|---|
| `npx expo run:android` (o `npm run android`) | Compila e instala el development build en el emulador |
| `npx expo start` (o `npm start`) | Servidor de desarrollo para el build ya instalado. `-c` limpia la caché |
| `npm test` | Pruebas (Jest con `jest-expo`) |
| `npx expo lint` (o `npm run lint`) | ESLint |
| `npx tsc --noEmit` (o `npm run typecheck`) | Chequeo de tipos. Los tipos de las rutas se generan al correr `npx expo start` una vez |
| `npx expo-doctor` | Diagnóstico de dependencias y configuración |

## 6. Estructura

```
app.config.ts          # Configuración nativa (paquete, ícono, splash). Reemplaza a app.json
src/
├── app/               # Pantallas (Expo Router). Solo rutas aquí
│   ├── (auth)/        # login · crear-cuenta · verificar-correo · cuenta-restaurante
│   ├── (app)/(tabs)/  # index (Explorar) · perfil
│   └── (app)/restaurante/[id].tsx
├── components/ui/     # Kit móvil (solo tokens del manual)
├── config/env.ts      # Variables de entorno
├── features/          # Lógica por dominio: search, account…
├── lib/               # Cliente HTTP, formato, utilidades
└── theme/             # Tokens del manual (16.5), variables de color y tema claro/oscuro
```

## 7. Estilos

Tailwind **solo conoce los tokens del manual**: no existen `bg-slate-50`, `text-blue-600`,
`rounded-lg` ni `text-5xl`. Las clases tienen los mismos nombres que en la web:
`bg-surface text-fg border-line rounded-card`, `text-accent-text`, `bg-ok/15`. El texto siempre va con
el componente `Text` del kit (`variant` = `h1`, `body`, `sec`, `label`…), que aplica la tipografía
Plus Jakarta Sans con su peso. Los valores están en [`src/theme/tokens.ts`](src/theme/tokens.ts).
