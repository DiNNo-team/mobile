# DiNNo — App móvil (comensal)

Aplicación móvil de DiNNo para el comensal: búsqueda de restaurantes, disponibilidad y microreservas.
Construida con **React Native + Expo (SDK 57)**, **Expo Router** y **TypeScript**, con estilos tipo
Tailwind mediante **NativeWind**. Consume la API del backend (NestJS, repositorio aparte).

## Requisitos

- **Node.js 24 LTS** (definido en `.nvmrc` y en `engines` de `package.json`). Con nvm: `nvm use`.
- **npm** (incluido con Node).
- **Expo Go** actualizado en el celular (App Store / Google Play). Debe ser la versión compatible
  con **Expo SDK 57**; si Expo Go dice que el proyecto usa un SDK no soportado, actualízalo.
- Una **cuenta de Expo** (gratuita) con la **sesión iniciada con la misma cuenta** en:
  - el computador: `npx expo login` (verifica con `npx expo whoami`);
  - la app Expo Go del celular (pestaña de perfil).

  Así el servidor de desarrollo aparece directamente en Expo Go, sin escanear el QR.

## Instalación

```bash
git clone https://github.com/DiNNo-team/mobile.git dinno-mobile
cd dinno-mobile
nvm use          # opcional, usa Node 24
npm ci
cp .env.example .env
```

Para agregar librerías usa siempre `npx expo install <paquete>` (elige versiones compatibles con el SDK).

## Variables de entorno

| Variable | Descripción | Ejemplo |
|---|---|---|
| `EXPO_PUBLIC_API_URL` | Origen del backend, **sin `/v1` y sin `/` final**. | `http://192.168.1.10:3000` |

- Se lee en [`src/config/env.ts`](src/config/env.ts). Si no está definida, la app se detiene con un
  error que explica cómo configurarla. Usa siempre `env.apiUrl` en lugar de `process.env`.
- Las rutas del backend llevan el prefijo `/v1`: `` `${env.apiUrl}/v1/health` ``.
- `.env` no se versiona (solo `.env.example`). Las variables `EXPO_PUBLIC_*` quedan dentro de la app:
  **no pongas secretos en ellas**.
- Después de cambiar `.env`, reinicia limpiando la caché: `npx expo start -c`.

> ⚠️ **`localhost` no funciona desde el celular.** En el teléfono, `localhost` es el propio teléfono,
> no tu computador. Usa la IP local de tu computador en la misma red Wi-Fi (en macOS:
> `ipconfig getifaddr en0`; en Windows: `ipconfig`), por ejemplo `http://192.168.1.10:3000`, o la URL
> pública del backend en Render (`https://<servicio>.onrender.com`).

## Ejecutar la app

```bash
npx expo start
```

1. Abre **Expo Go** en el celular. Si iniciaste sesión con la misma cuenta, el proyecto aparece en
   *Development servers*; si no, escanea el código QR de la terminal (en iOS, con la cámara).
2. El computador y el celular deben estar en la **misma red Wi-Fi**.

**Redes restringidas (universidad, redes corporativas, aislamiento de clientes):** si Expo Go no
logra conectarse, usa un túnel:

```bash
npx expo start --tunnel
```

La primera vez, Expo pedirá instalar `@expo/ngrok`; acepta. El túnel es más lento, pero funciona
aunque el celular y el computador no se vean en la red. Ten en cuenta que el túnel solo expone el
servidor de Metro: el backend debe seguir siendo accesible desde el celular (IP local alcanzable o
URL de Render).

## Comandos

| Comando | Qué hace |
|---|---|
| `npx expo start` | Servidor de desarrollo (Expo Go). `-c` limpia la caché, `--tunnel` usa túnel. |
| `npm run android` / `npm run ios` | Abre en emulador Android / simulador iOS. |
| `npm run web` | Abre la versión web en el navegador. |
| `npx expo lint` (o `npm run lint`) | Revisa el código con ESLint (`eslint-config-expo`). |
| `npx tsc --noEmit` | Chequeo de tipos. |
| `npx expo-doctor` | Diagnóstico de dependencias y configuración. |

## Cómo verificar que funciona

1. `npx expo start` y abre la app en Expo Go: debe verse **DiNNo** grande, en azul y centrado sobre
   fondo gris claro. Si el texto se ve negro y pequeño, NativeWind no se está aplicando
   (reinicia con `npx expo start -c`).
2. Debajo del título se muestra la URL de la API configurada.
3. Con el backend corriendo, abre en el **navegador del celular** `http://<IP-del-computador>:3000/v1/health`:
   debe responder `{"status":"ok"}`. Si no responde, el celular no alcanza al backend
   (revisa la IP, la red o el firewall del computador).
4. `npx tsc --noEmit` y `npx expo lint` deben terminar sin errores.

## Estilos con NativeWind

Se usa **NativeWind v4** (versión estable compatible con Expo SDK 57), que funciona con
**Tailwind CSS v3**. Las clases se escriben con `className`:

```tsx
<View className="flex-1 items-center justify-center bg-slate-50">
  <Text className="text-5xl font-bold text-blue-600">DiNNo</Text>
</View>
```

Archivos de configuración: `tailwind.config.js`, `babel.config.js`, `metro.config.js`,
`src/global.css` (importado en `src/app/_layout.tsx`) y `nativewind-env.d.ts` (tipos de `className`).

## Estructura

```
src/
├── app/            # Pantallas y layouts (Expo Router). Solo rutas aquí.
│   ├── _layout.tsx
│   └── index.tsx
├── config/
│   └── env.ts      # Lectura y validación de EXPO_PUBLIC_API_URL
└── global.css      # Directivas de Tailwind
```

El código que no sea una pantalla (componentes, hooks, servicios) va fuera de `src/app/`.
