# Avisos de la app (mobile)

> Lo que el equipo debe saber de la app. Lo más nuevo arriba, con autor y fecha. Léelo antes de empezar cada día.

---

## 27 oct 2026 · Sebastián · `CLAUDE.md` apunta al manual v2.0 (sin PR todavía)

- **`CLAUDE.md` (secciones 2 y 8, iguales en los tres repos):** el manual que manda ahora es el **v2.0** (`frontend/docs/DiNNo_Manual_Identidad_v2_0.md`); el v1.1 queda como histórico. Lo que el v2.0 todavía no implementa está en su sección 19. La sección 8 suma la decisión del plano de mesas.
- **Sección 11 (este repo):** el vidrio va con `GlassSurface` (mapa y login), el movimiento con Reanimated (`usePressScale`, `useReducedMotion`) y la háptica solo con `src/lib/haptics.ts`.

---

## 26 oct 2026 (noche) · Sebastián · Manual de identidad v2.0 en la app (en curso, sin PR todavía)

**Después del pull:**
1. `npm install`.
2. **Recompilar:** `npx expo prebuild --clean` y luego `npx expo run:android`. Hay dos dependencias nativas nuevas, aprobadas por Sebastián: `expo-blur` (vidrio del login en Android) y `expo-haptics` (toque háptico del botón principal).

**Qué cambió**
- **Tokens v2.0** (`src/theme/tokens.ts`):
  - Títulos de 28.
  - Etiquetas de 12 con mayúscula inicial; las variantes nuevas de `Text` son `kicker` y `metric`.
  - Tintes y bordes de estado, vidrio de panel y curvas de motion.
  - No cambió el valor de ningún color.
- **Kit:**
  - Todo lo que se toca se hunde al presionar (`usePressScale`).
  - El botón `secondary` usa `inverse`, igual que la web (en oscuro es crema).
  - `Card` va sin sombra en reposo; su `elevation` ahora es `resting · floating`.
  - `GlassSurface` es nuevo, y `FloatingSurface` lo usa por dentro.
  - La hoja inferior cierra con resorte y tiene resistencia elástica.
- **Login y pantallas sin sesión:**
  - Mismo mundo que el login web: crema con las dos formas de marca y la tarjeta de vidrio que sube al abrir.
  - Pestañas Iniciar sesión / Crear cuenta con la barra naranja que se desliza.
  - El texto sobre la tarjeta va en tinta.
- **Explorar:** en la vista de mapa, el mapa ocupa toda la pantalla y el encabezado flota encima. La vista de lista no cambió.
- **Detalle:** mapa estático arriba y una sola fila de estado (disponibilidad + "Abierto ahora").

**Para quién**
- **Jacobo:** crear cuenta, verificar correo y recuperar contraseña heredan el marco nuevo de `AuthScreen`. En crear cuenta se sumaron las pestañas. Quité `tone="secondary"` de los textos que quedan sobre el vidrio. La lógica no cambió.
- **Sergio:** Perfil no cambió de estructura; solo hereda los tokens y el kit.
- **Todos:** el manual v2.0 está en el repo `frontend` (`docs/DiNNo_Manual_Identidad_v2_0.md`).

**Rama / PR**
- `refactor/sprint2-app-v2`. Todavía sin commit ni PR.

---

## 26 oct 2026 (tarde) · Sebastián · Búsqueda por dirección, logo de Google y cierre del Sprint 2

**Después del pull:** `npm install`. No hay dependencias nuevas ni hay que recompilar: solo cambia JavaScript y una imagen.

**Qué quedó listo**
- **Búsqueda por dirección (PBI 2.2):** en «Cambiar zona» (y cuando falla la ubicación) el panel «¿Dónde buscamos?» tiene arriba **Dirección**, con el campo «Buscar por dirección» y el botón «Buscar dirección».
  - Valida antes de enviar: «ab» dice «Escribe al menos 3 caracteres.» y no llama al backend.
  - `200` → busca con `lat`/`lng` y el encabezado dice **«Cerca de: `formattedAddress`»** (por ejemplo, «Cerca de: Cra. 11 #72-30, Bogotá, Colombia · 2 km»). Los filtros, el mapa, el detalle (distancia desde ese punto) y el tiempo real funcionan igual. El punto naranja de «tú» solo aparece con el GPS.
  - `404` → «No encontramos esa dirección en Bogotá. Revisa la dirección o elige una zona.»; `503` → «No pudimos ubicar la dirección en este momento. Intenta de nuevo o elige una zona.»; sin internet → el mensaje de conexión. Se decide por `errorCode`, nunca por el `message` del backend.
  - Se vuelve a **Mi ubicación** o a una **zona** desde el mismo panel, y el campo recuerda la última dirección.
- **Cupo de Geocoding (punto 6 del cierre):** se llama solo al confirmar, el botón queda en «Buscando…» y no se puede tocar dos veces, y la misma dirección (con otros espacios o mayúsculas) no se vuelve a pedir mientras la app esté abierta. Las pruebas simulan `/geocode`; con `EXPO_PUBLIC_USE_MOCKS=true` hay respuestas de ejemplo (Medellín o una calle mayor a 200 → 404; «sin servicio» → 503).
- **«Continuar con Google» con la «G» oficial** de las guías de marca de Google, sacada del paquete oficial sin redibujarla (`assets/images/google-g*.png`). El kit tiene `GoogleLogo` y `Button` acepta `leading` para logos que no son de Lucide.
- **`.gitattributes`** con `* text=auto eol=lf`, sin `--renormalize`. `git status` no cambia: no había archivos con finales de línea de Windows.

**Probado contra Render** con la cuenta de comensal de prueba:
- `Cra. 11 #72-30` → Calle 72 (Crepes & Waffles, Casa 72…).
- `Calle 118 #5-41` → Usaquén (Abasto Usaquén).
- `Calle 10 #43A-30, Medellín` → mensaje de 404.
- `ab` → validación local.
- El mapa real ya muestra los tres niveles de disponibilidad con el seed.

**Para quién**
- **Jacobo:** el botón de Google de `login.tsx` ahora lleva `leading={<GoogleLogo />}`; la lógica no cambió.
- **Sergio (matriz):** agrega a **C5** (buscar por zona) la variante «buscar por dirección», con los casos de la tabla de Elizabeth (`docs/qa/matriz-sprint2.md` de la web).
- **Todos:** borren de su `.env` la línea suelta con tres comillas invertidas si la tienen (aviso de Elizabeth); no afecta la app, pero no es una variable.

**Rama / PR**
- `feat/sprint2-busqueda-direccion` → `develop`.

---

## 26 oct 2026 · Elizabeth · Búsqueda por dirección: `GET /v1/geocode` para comensales

**Para Sebastián (PBI 2.2, «dirección o zona»).** El cambio del backend está en la rama `docs/sprint2-cierre-contrato`, todavía sin fusionar; cuando llegue a `develop` se avisa. Responde a tu nota del 16 oct: no hizo falta un endpoint nuevo, porque `/geocode` ahora acepta comensales. La búsqueda no recibe `address`.

**Flujo en la app**
1. `GET /v1/geocode?address=<texto>`, con el mismo token de Firebase. `address` va recortada, de 3 a 255 caracteres; si no cumple, `400` con `message` en lista. Valídalo antes de enviar.
2. `200 { latitude, longitude, formattedAddress }` → muestra «Resultados cerca de: `formattedAddress`». **Muéstralo siempre:** Google puede ubicar algo distinto a lo que el comensal pensó. Por ejemplo, una dirección que existe en Bogotá se acepta aunque fuera de otra ciudad, y un texto sin sentido puede caer en una dirección real.
3. `GET /v1/search/restaurants?lat=<latitude>&lng=<longitude>` con el `radiusKm`, `category` y `partySize` de siempre. Para el detalle, usa el mismo punto como `lat`/`lng`.

**Errores (decide por `errorCode`, con tu propio texto)**
- **`404 ADDRESS_NOT_FOUND`:** no hay un resultado dentro de Bogotá. Por ejemplo: «No encontramos esa dirección en Bogotá. Revisa la dirección o busca por zona.».
- **`503 GEOCODING_UNAVAILABLE`:** Google no respondió. Por ejemplo: «No pudimos ubicar la dirección en este momento. Busca por zona o con tu ubicación.».
- **`403 PROFILE_REQUIRED`:** igual que en el resto de rutas de comensal: llama a `POST /v1/diners/me` y reintenta. No lo muestres.
- **`401`:** la sesión terminó, como siempre.
- **El `message` del backend es neutro** y no está pensado para la app: no lo muestres tal cual.

**Contrato:** `CLAUDE.md` §10 (fila de `/geocode`, «Ambos roles» y «Búsqueda por dirección (app)»), idéntica en los tres repos.

---

## 26 oct 2026 · Elizabeth · Backend del Sprint 2 cerrado

- **El backend del Sprint 2 está cerrado:** todo está en `develop` y desplegado en Render. Se probó el 26 oct con tokens reales de Firebase: búsqueda, filtros, detalle y WebSocket responden igual en Render y en local. No cambió ninguna ruta, respuesta ni evento.
- **Seed en Render:** además de Casa 72 están los 15 restaurantes reales de Santiago, con horarios y mesas que cubren `available`, `few`, `none` y restaurantes cerrados. Por ejemplo, Pesquera Jaramillo está cerrado a mano y su detalle responde `closed`. Sus dueños (`restaurante-XX@dinno.test`) son solo datos, sin inicio de sesión.
- **Casa 72** tiene como dueño `dinnoteam2026+casa72@gmail.com`, y con esa cuenta se cambian sus mesas desde la web para ver el tiempo real en la app. Su cuenta de Firebase ya existe y está verificada, así que el paso 8 ya se puede hacer. El 26 oct se probó en Render: cada cambio de Casa 72 llegó como `availability.changed` al comensal en menos de 1 s, y repetir el mismo estado no envió nada.
- **La geocodificación ya funciona en el backend** (llave real en Render). ~~La app no la usa: el comensal busca por zona o por ubicación.~~ Ver la entrada de arriba: desde el 26 oct el comensal también puede usarla para buscar por dirección.
- **Credenciales:** en Discord (#usuarios-restaurante y #usuarios-comensal), nunca en el repo. Una cuenta nueva usa un alias `dinnoteam2026+algo@gmail.com`.
- **Contrato:** `CLAUDE.md`, sección 10, idéntica en los tres repos. Hoy cambió el apartado «Cuentas de prueba» y la tabla «Cuándo está listo cada contrato en `develop`».
- **Resueltos de la revisión del 17 oct:** #3 (en Render ya no aparece solo Casa 72) y #6 (la cuenta de la web de Casa 72 es `dinnoteam2026+casa72@gmail.com`).

---

## 25 oct 2026 (noche) · Sebastián · El mapa de la app ya funciona con la llave real

**Después del pull:** `npm install`. No hay dependencias nuevas. Para ver el mapa necesitas `GOOGLE_MAPS_ANDROID_API_KEY` en tu `.env` (pídesela a Santiago por privado) y después `npx expo prebuild --clean` y `npx expo run:android`.

**Probado en el emulador:**
- **Contra Render:** el mapa carga con los colores del manual, tu posición con el radar y los restaurantes del seed (por ejemplo, Andrés D.C.). A las 9:45 a. m. de un domingo solo hay uno abierto: los demás abren a mediodía, así que es lo correcto.
- **Con datos de ejemplo** (13 restaurantes):
  - Los pines tienen la forma y el color de cada estado.
  - Tocar un pin mueve las tarjetas a la suya, y deslizar una tarjeta lleva el mapa a su pin.
  - Funciona en claro y en oscuro.

**Corregido:** al cambiar de tema, el pin seleccionado se volvía el pin rojo genérico de Google (prohibido por el manual).
- Ahora cada pin se dibuja durante su primer medio segundo antes de congelarse.
- Los pines se vuelven a crear cuando cambia el tema.

**APK de QA nuevo, con mapa** (contra Render). Pídemelo por privado: Sergio, Santiago y Jacobo para la matriz.

**Sergio (matriz):** **T2.5** (disponibilidad en el mapa) y la parte de mapa de **C6** ya no están bloqueados.

**Web, para quien maneje Vercel:** el mapa del formulario necesita `VITE_GOOGLE_MAPS_API_KEY` **y** `VITE_GOOGLE_MAPS_MAP_ID`. Sin el Map ID no se muestra (`LocationMap.tsx` exige los dos).

---

## 25 oct 2026 · Sebastián · `npm run typecheck` ya no da errores falsos y el SHA-1 es uno solo

**Después del pull:** `npm install`. No hay dependencias nuevas ni hay que recompilar.

**Qué pasaba:** `tsc` usa dos archivos que genera Expo y que no están en git: `.expo/types/router.d.ts` (las rutas) y `expo-env.d.ts` (tipos de Expo, entre ellos los `*.css`).
- Si el primero era viejo, por ejemplo del 29 sep, salían los `TS2322`/`TS2345` de `/crear-cuenta`, `/recuperar-contrasena`, `/kit` y `/restaurante/[id]`.
- Si faltaba el segundo, salía el `TS2882` de `global.css` que estaba como «error conocido».

No era un error del código: dependía de cuándo había corrido cada uno `npx expo start`.

**Arreglo:** `npm run typecheck` ahora corre primero `expo customize tsconfig.json`, que regenera los dos archivos sin abrir Metro y sin cambiar `tsconfig.json`, y después `tsc --noEmit`.
- **Usen siempre `npm run typecheck`**, no `npx tsc --noEmit` suelto.
- Se quitó la fila de «error conocido» del README. `CLAUDE.md`, `AGENTS.md` y el README ya dicen el comando nuevo.

**SHA-1 (para Santiago y Jacobo):** el `debug.keystore` lo pone la plantilla de Expo al hacer `prebuild`, así que **es el mismo en todos los computadores**. El APK de QA (release) también va firmado con él (lo verifiqué con `apksigner`). No hay que agregar un SHA-1 por computador ni un cliente aparte para el APK. Es este:
- Paquete: `com.dinno.app`
- SHA-1: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`

**La llave de Maps en tu `.env`:**
- El nombre de la variable debe ser exactamente `GOOGLE_MAPS_ANDROID_API_KEY`, en una línea `GOOGLE_MAPS_ANDROID_API_KEY=<llave>`, sin comillas ni espacios.
- Un nombre como `dinno-android=` (el nombre que tiene la llave en la consola) no lo lee la app, y el mapa no aparece.
- Después de ponerla: `npx expo prebuild --clean` y `npx expo run:android`.

---

## 20 oct 2026 (noche) · Sergio · README y AGENTS.md al día

**Después del pull:** solo cambia documentación: no hay dependencias nuevas ni hay que recompilar.

**Qué quedó listo**
- **`README.md`** (sobre la versión de Sebastián, sin quitar nada):
  - «Inicio rápido» de 6 pasos.
  - JDK: el de Android Studio (`jbr`) como opción principal y un JDK 17 aparte como alternativa.
  - La tabla de variables, con si son obligatorias y un ejemplo.
  - Tres formas de correr la app (datos de ejemplo, Render y backend local con `10.0.2.2`).
  - Sección 8, «Problemas comunes», donde ahora está también lo del DNS del emulador.
- **Error conocido:** `npx tsc --noEmit` falla en `develop` por `import '../global.css'` (TS2882). Está en la sección 8 del README y esa fila se quita cuando se arregle.
- **`AGENTS.md`:** en español y alineado con el `CLAUDE.md`: development build con Android Studio (nunca Expo Go), `app.config.ts`, solo npm y nada de EAS sin pedirlo. Antes era la plantilla genérica de Expo.
- **Credenciales, siempre por privado y nunca en el repo:** Firebase y cuentas de prueba del backend → Elizabeth · llave de Maps → Sebastián.

**Para quién**
- **Sebastián:** revisa que el README siga diciendo lo mismo que tus notas, y el arreglo de `global.css` (cuando esté, se quita la fila de la sección 8).
- **Todos:** si alguien nuevo levanta la app, que siga solo el README.

**Rama / PR**
- `docs/sprint2-readme-agents` → `develop`.
## 20 oct 2026 · Jacobo · Iniciar sesión con Google

**Después del pull hay que recompilar** (Google Sign-In es código nativo):

```bash
npm install
npx expo prebuild --clean
npx expo run:android
```

**Dependencia nueva:** `@react-native-google-signin/google-signin` 16 (API gratuita, «Original»). Su plugin **no** está en `app.config.ts`: en Android solo configura `google-services.json` (no lo usamos) y con opciones exige `iosUrlScheme`, que es de iOS. El módulo entra por autolinking. Si algún día se compila iOS, hay que agregar el plugin con `iosUrlScheme`.

**Variable nueva: `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`** (pública). Es el ID de cliente **web** de OAuth del proyecto de Firebase. Cópiala a tu `.env` desde `.env.example`; los pasos están en el README.
- Sin ella, el botón dice «Por ahora no puedes continuar con Google…» y el resto funciona.
- Además, en Google Cloud tiene que existir un **cliente OAuth de Android** con `com.dinno.app` + el SHA-1 del README. Si falta, Google falla siempre. **Equipo de Google Cloud:** ¿ya está creado? El APK de QA (release) tiene otro SHA-1 y necesita su propio cliente.

**Qué hace:**
- «Continuar con Google» (borde) está debajo de «Iniciar sesión». El idToken de Google pasa a `signInWithFirebase` y el flujo único hace el resto. El nombre de Google llega solo a `POST /diners/me`.
- Si la persona cierra la ventana de Google, no se muestra nada. Los demás errores salen en un `Alert` con un texto claro.
- **Cerrar sesión** también cierra la sesión de Google (`onSignOut`, en `src/features/session/google.ts`), así que el selector vuelve a preguntar la cuenta. Si eso falla, se reintenta antes del siguiente inicio con Google.
- Con `EXPO_PUBLIC_USE_MOCKS=true` no se llama a Google: entra como `google@dinno.test`.

**Recorrido de la demo, paso 1 (entrar con Google):** listo para probar cuando estén la variable y el cliente de Android.

---

## 20 oct 2026 · Jacobo · Crear cuenta, verificar correo y recuperar contraseña

**No hay que recompilar** ni hay dependencias nuevas: después del pull basta con `npm install`.

Estas tres pantallas **ya no son provisionales**:
- **`/crear-cuenta`:** nombre, correo y contraseña (mínimo 8). Al crearla se envía el correo de verificación y la app pasa sola a `/verificar-correo`. El nombre se envía a `POST /diners/me`.
- **`/verificar-correo`:** «Ya lo verifiqué», «Reenviar correo» y «Cerrar sesión», igual que en la web.
- **`/recuperar-contrasena`:** envía el enlace de Firebase. La confirmación no dice si la cuenta existe.

La lógica de Firebase está en `src/features/session/account-actions.ts`. Con `EXPO_PUBLIC_USE_MOCKS=true`:
- Crear cuenta pasa a la verificación con `sinverificar@dinno.test`.
- Reenviar y recuperar responden como si hubieran funcionado.

**Pruebas:** `auth-screens.test.tsx` renderiza pantallas con `react-test-renderer` (ya viene con jest-expo). Mockea reanimated, worklets y lucide en el mismo archivo, sin tocar la configuración de jest.

**Recorrido de la demo, paso 11 (crear cuenta → verificación):** listo para probar. «Continuar con Google» sigue pendiente (Jacobo).

---

## 20 oct 2026 · Sergio · Pestaña Perfil del comensal

**Después del pull:** no hay dependencias nuevas ni cambios nativos: no hay que recompilar.

**Qué quedó listo** (`src/app/(app)/(tabs)/perfil.tsx`):
- Nombre y correo de `GET /me` en una `Card` (sin nombre, la parte del correo antes de `@`), el selector de tema, «Cerrar sesión» con el `Dialog` «¿Cerrar sesión?» del kit y «Versión 1.0.0» (de `expo-constants`).
- **Carga, error y modo oscuro:** skeleton después de 300 ms; si no hay datos, `ErrorState` «No pudimos cargar tu perfil» con «Intentar de nuevo»; si falla una recarga, se quedan los datos con un `Alert`. Con un 401, el proveedor cierra la sesión y el login muestra «Tu sesión terminó. Inicia sesión de nuevo.».
- **Cerrar sesión** usa `useAuth().signOut()` (Firebase, caché, filtros y socket) y la app vuelve sola al login con `Stack.Protected`: el botón atrás no regresa a Perfil. Si falla, se cierra el diálogo y aparece el toast «No pudimos cerrar sesión. Intenta de nuevo.».
- Resuelve el hallazgo 5 de la revisión del 17 oct (Perfil provisional).
- **Para leer el perfil en otra pantalla:** `useMeQuery()` de `@/features/account/queries` (query key `['me']`). Se borra con la caché al cerrar sesión. `getDisplayName(profile)` de `@/features/account/profile-display` da el nombre que se muestra.

**Sebastián:**
- **Falta `Avatar` en el kit** (ya te lo pedí). Propuesta: `<Avatar name="Laura" imageUrl? size="lg" />`, con la inicial en mayúscula, fondo y texto de tokens, en claro y oscuro, y `accessible={false}` (el nombre ya se lee al lado). Cuando lo publiques, se agrega en `ProfileCard` (`perfil.tsx`) antes del nombre: `<Avatar name={getDisplayName(profile)} />`, y el `View` del nombre y el correo pasa a fila.
- **`npx tsc --noEmit` falla en `develop` (ya existía, no lo causa este cambio):** `src/app/_layout.tsx(1,8): error TS2882: Cannot find module or type declarations for side-effect import of '../global.css'`. TypeScript 6 revisa los imports de efecto secundario y `nativewind/types.d.ts` no declara los `*.css`. Te lo reporté aparte; el arreglo va en `nativewind-env.d.ts` o en `tsconfig.json`.

**Jacobo:** cuando agregues Google Sign-In nativo, registra `onSignOut(() => GoogleSignin.signOut())` (de `@/features/session/SessionProvider`). Si no, después de «Cerrar sesión» el selector de Google vuelve a entrar solo con la cuenta anterior.

**Rama / PR**
- `feat/sprint2-diner-profile` → `develop`.

---

## 17 oct 2026 (noche) · Sebastián · Revisión del recorrido de la demo, hallazgos y APK para QA

**APK para QA:** ya se puede probar la app sin montar el proyecto ni tener Metro corriendo.
- Con `npm run android:release` sale un APK que apunta a Render. Las instrucciones están en el README, sección 3, «APK para QA».
- Quien lo necesite (Santiago y Sergio para la matriz), pídamelo y se lo paso por privado.
- Todavía no tiene mapa: cuando llegue la llave se genera otro.

**Recorrido de la demo (§10 del reparto), probado en el emulador contra Render** con la cuenta de comensal de prueba:

| Paso | Resultado |
|---|---|
| 1. Credenciales incorrectas → error claro · correo y clave → *Explorar* | ✅ |
| 1. Entrar con Google | ⏳ Jacobo |
| 2. Cuenta de restaurante → «Esta es una cuenta de restaurante…» | ✅ |
| 3. Conceder ubicación → resultados en lista | ✅ |
| 3. Resultados en mapa, con los tres niveles | ⏳ Llave de Maps · solo Casa 72 en Render |
| 4. Detalle con horarios, distancia y «Cómo llegar» | ✅ |
| 4. Tocar un pin resalta su tarjeta | ⏳ Llave de Maps (probado con datos de ejemplo) |
| 5. Categoría + personas → cambian los resultados · «Limpiar filtros» | ✅ |
| 6. Sin resultados → «Ampliar a X km» | ✅ |
| 7. Rechazar ubicación → zona Chapinero | ✅ |
| 8. Tiempo real desde la web | ⏳ El socket conecta y se recupera solo; falta cambiar mesas desde la web como Casa 72 |
| 9 y 10. Web: Google, mensajes de cuenta equivocada, pin de ubicación | ⏳ Jacobo y Santiago |
| 11. Crear cuenta en la app → verificación | ⏳ Jacobo |
| 12. Perfil → cerrar sesión con confirmación | ⏳ Sergio (la pantalla provisional cierra sesión sin confirmación) |
| 12. Modo oscuro | ✅ |

**Revisión visual de la app (§11):**
- Revisé el código con el checklist del manual (§17): ningún color, radio, sombra ni tamaño suelto, solo íconos de Lucide sin pines genéricos, sin `console.log` ni `TODO`.
- Las 4 disponibilidades usan los mismos valores y textos en lista, mapa y detalle, nunca con número de mesas.
- La web no la revisé: no tiene cambios del Sprint 2 en `develop`.

**Hallazgos y dueño:**

| # | Hallazgo | Dueño | Estado |
|---|---|---|---|
| 1 | Al entrar, el skeleton se quitaba un instante entre «Buscando tu ubicación…» y los resultados | Sebastián | Corregido en este PR |
| 2 | Sin llave de Maps no hay mapa (la app muestra solo la lista); cuando llegue, verificar pines y sincronía | Equipo de Google Cloud → Sebastián | Pendiente |
| 3 | En Render solo aparece Casa 72: no se pueden mostrar los tres niveles de disponibilidad ni varios pines | Santiago (JSON) + Elizabeth (seed) | Resuelto (26 oct): el seed ya está en Neon |
| 4 | Google Sign-In, crear cuenta, verificar correo y recuperar contraseña siguen como pantallas provisionales | Jacobo | Pendiente |
| 5 | Perfil provisional: faltan los datos de `GET /me`, la confirmación al cerrar sesión y la versión de la app (el selector de tema ya está) | Sergio | Pendiente |
| 6 | ¿Qué cuenta entra a la web como Casa 72 para el paso 8? | Elizabeth | Resuelto (26 oct): `dinnoteam2026+casa72@gmail.com` (credenciales en Discord) |
| 7 | En modo oscuro el botón secundario (petróleo, «Cómo llegar») casi se confunde con el fondo, porque en el manual `brand` y `surface` son el mismo color en oscuro | Sebastián (revisar con el manual) | Menor, abierto |
| 8 | La ubicación del restaurante en la web pasa a «todo Google» (mapa de Google + Geocoding, el dueño confirma el pin) | Santiago + Elizabeth | En curso |

---

## 17 oct 2026 · Sebastián · Tiempo real, errores de red y Render

**Después del pull hay que recompilar** (NetInfo es nativo):

```bash
npm install
npx expo prebuild --clean
npx expo run:android
```

**Dependencias nuevas:**
- `socket.io-client`: la misma versión 4.8 del backend.
- `@react-native-community/netinfo`: avisa cuando vuelve internet.

**Qué hace la app ahora:**
- **Tiempo real:** al entrar como comensal se conecta al WebSocket de Render con el token de Firebase. Cada reconexión pide un token nuevo.
  - Cada `availability.changed` cambia al instante el chip en la lista, el pin y el detalle.
  - Si `isSearchable` es falso, el restaurante sale de la lista y del mapa, y el detalle abierto muestra *Cerrado*.
  - Uno o dos segundos después, la app vuelve a consultar lo que está en pantalla. Así un restaurante que abre reaparece y el filtro de personas sigue siendo correcto.
- **Reintentos:** con `SERVER_ERROR` la app reintenta a los 5 s, 15 s y luego cada 30 s. Con los otros códigos no reintenta. Si el socket se cae, no se muestra ningún error.
- **Respaldo:** búsqueda y detalle se vuelven a consultar cada 60 s mientras la app está abierta, al volver a la app y al recuperar internet. En segundo plano el socket se cierra y no se consulta nada.
- **Red:**
  - Si una petición tarda más de 5 s (Render despertando), aparece «Conectando con DiNNo…» arriba.
  - Sin internet, se conserva lo que había y sale «No pudimos conectarnos…» con «Intentar de nuevo». Al volver la conexión se actualiza sola.
- Con `EXPO_PUBLIC_USE_MOCKS=true` no hay socket: no hay backend.

**Probado contra Render** con la cuenta de comensal de prueba:
- El socket se conecta, se cierra en segundo plano y se reconecta al volver.
- Con modo avión aparece el error y la recuperación es automática.

Falta ver un evento real: hay que cambiar mesas de Casa 72 desde la web mientras se mira la app. Los pasos están en el README («Probar el tiempo real»).

**Sergio (QA de C10 y C11):** los casos de disponibilidad en vivo, sin conexión y backend lento se pueden repetir con los comandos del README.

**Elizabeth:** para el recorrido del Día 6 confirmen qué cuenta entra a la web como Casa 72. El seed asegura `dinnoteam2026@gmail.com` como restaurante; ¿es la dueña de Casa 72? **Respuesta (Elizabeth, 26 oct):** no, `dinnoteam2026@gmail.com` es la dueña de Casa16. Casa 72 es de `dinnoteam2026+casa72@gmail.com` (ver la entrada del 26 oct).

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
