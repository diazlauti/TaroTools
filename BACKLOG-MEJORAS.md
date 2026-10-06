# Backlog de mejoras — TaroTools

Tareas pendientes para el bucle de mejoras continuo del sitio. Cada pasada de la skill
`mejorar-proyecto` revisa primero esta lista: si hay algo sin marcar en **Pendientes**, lo toma
como la tarea de esa pasada — tiene prioridad sobre el análisis automático de bugs, seguridad y
pulido visual que hace el loop por su cuenta. Si está vacía, el loop vuelve a su criterio normal.

Objetivo de fondo de todo esto (como lo pidió el usuario): que TaroTools sea la página de
herramientas online más útil que exista — no la que tiene más herramientas, la que de verdad
resuelve lo que alguien necesita, sin fricción, sin humo.

Para agregar una tarea nueva, usá la skill `agregar-tarea` (o pedile directamente a Claude "agregá
X al bucle de mejoras" / "anotá esto para después"). Cada entrada tiene que ser autocontenida: una
sesión futura, sin el contexto de la conversación donde se pidió, tiene que poder leerla y
ejecutarla sin tener que volver a preguntar nada.

## Pendientes

Funciones de tinywow.com/tools que no usan IA y que TaroTools todavía no tiene, en orden de
prioridad (factibilidad 100% cliente primero, valor real para cualquiera que mencionó el usuario
contra esfuerzo). Investigado el 2026-10-06 vía búsquedas (tinywow.com bloqueado directo desde el
sandbox) — la lista de nombres exactos puede no ser 100% exhaustiva, pero cubre todas las
categorías no-IA de su catálogo (PDF, imagen, video, archivo). Deliberadamente afuera: cualquier
cosa que dependa de un modelo de IA (upscaler, generación de imagen, restauración de fotos,
remover objetos) y "quitar marca de agua" (en la práctica se usa casi siempre para romper
protección de copyright ajena — no sumar esto).

- [ ] **Agregar marca de agua propia a una imagen** — herramienta nueva `img-watermark`: superponer texto o logo propio (no quitar la de otro — eso lo dejamos afuera a propósito). Útil para quien comparte fotos/diseños y quiere proteger su propio trabajo. 100% cliente, canvas. _(agregado 2026-10-06)_
- [ ] **Convertir HEIC a JPG/PNG** — sumar HEIC como formato de entrada en `img-convert` (o herramienta standalone `img-heic`). Fricción real: fotos de iPhone no suben a casi ningún sitio. Necesita un decoder HEIC vía WASM cargado desde CDN (ej. `heic2any` o `libheif.js`, mismo patrón que `loadScript()` ya usa para pdf-lib/jszip/tesseract) — probar que el CDN y el tamaño del WASM sean razonables antes de comprometerse. _(agregado 2026-10-06)_
- [ ] **Combinar imágenes en un collage** — herramienta nueva `img-collage`: grilla simple (2x2, 3x3, etc.) armada con canvas a partir de varias imágenes subidas. 100% cliente. _(agregado 2026-10-06)_
- [ ] **Comparar dos PDFs** — herramienta nueva `pdf-compare`: extraé texto de ambos con pdf.js (ya cargado para `pdf-text`/`pdf-ocr`) y reusá el motor de diff que ya existe en `text-diff` en vez de reescribirlo. Sinergia directa con código ya probado. _(agregado 2026-10-06)_
- [ ] **Recortar márgenes de un PDF (crop box)** — herramienta nueva `pdf-crop`: ajustar el cropBox de cada página con `pdf-lib`, con preview de miniaturas igual que `pdf-rotate`/`pdf-delete-p`. _(agregado 2026-10-06)_
- [ ] **Redactar PDF** (tapar texto/zonas sensibles antes de compartir) — herramienta nueva `pdf-redact`: el usuario dibuja rectángulos negros sobre el preview de cada página (interacción similar a la selección de páginas que ya existe), se aplanan con `pdf-lib` para que no se pueda deshacer el tapado. Esfuerzo medio por la interacción de dibujo, pero utilidad real (DNI, datos personales, etc. antes de mandar un PDF). _(agregado 2026-10-06)_
- [ ] **"Reparar" un PDF dañado** — herramienta nueva `pdf-repair`: en la práctica, la mayoría de estas herramientas online simplemente cargan el PDF de forma permisiva (`pdf-lib` con `ignoreEncryption`/parseo tolerante) y lo re-guardan limpio — hacer lo mismo y dejar claro en el texto de ayuda que es "mejor esfuerzo", no magia. _(agregado 2026-10-06)_
- [ ] **Rellenar y firmar PDF** — herramienta nueva `pdf-fill-sign`: agregar campos de texto y una firma dibujada a mano (canvas) sobre el PDF, aplanar con `pdf-lib`. Esfuerzo más alto (UI de edición interactiva sobre el preview), pero es de las funciones más buscadas en cualquier suite de PDF. _(agregado 2026-10-06)_
- [ ] **Recortar/cortar un video (trim)** — herramienta nueva `vid-trim`: elegir inicio/fin con el `<video>` ya cargado y exportar solo ese tramo, reusando el mismo patrón de captura en tiempo real (`captureStream` + `MediaRecorder`) que ya usa `vid-compress`. _(agregado 2026-10-06)_
- [ ] **Extraer el audio de un video** — herramienta nueva `vid-extract-audio`: capturar solo la pista de audio del `<video>` vía `captureStream()` + `MediaRecorder`, exportar WAV/WEBM-audio. Mismo patrón que `vid-compress`/`vid-trim`, sin necesitar ffmpeg. _(agregado 2026-10-06)_
- [ ] **Convertir video a GIF** — herramienta nueva `vid-to-gif`: capturar frames del `<video>` a intervalos sobre un canvas y codificarlos con una librería GIF liviana cargada desde CDN (ej. `gif.js`). Verificar primero que el tamaño/calidad del GIF resultante sea razonable antes de prometerlo como reemplazo de un conversor real. _(agregado 2026-10-06)_
- [ ] **Dividir un CSV en archivos más chicos** — herramienta nueva `csv-split`: parsear el CSV (parser propio o uno liviano) y partirlo en N archivos de M filas cada uno, descarga en `.zip` si son varios (mismo patrón ya usado en `pdf-split`/el modo lote de `img-compress`). 100% cliente, sin librería pesada. _(agregado 2026-10-06)_
- [ ] **Convertir CSV ↔ JSON** — herramienta nueva `csv-json`: ida y vuelta entre CSV y JSON, reusando el formateador/validador que ya tiene `json-fmt`. Complementa esa herramienta en vez de duplicarla. _(agregado 2026-10-06)_
- [ ] **Convertir Excel (XLSX) a CSV / dividir un XLSX** — herramienta nueva `xlsx-convert`: usar `SheetJS` (cargado desde CDN con el mismo patrón `loadScript()`) para leer el XLSX y exportar CSV por hoja, o dividirlo igual que el CSV splitter. Esfuerzo algo mayor por la librería nueva, pero es un pedido muy común. _(agregado 2026-10-06)_
- [ ] **(Investigar, no implementar todavía) Proteger PDF con contraseña** — `pdf-lib` NO tiene soporte de encriptación/contraseña (confirmado revisando su build — no hay ninguna función de password/encrypt en todo el bundle). Antes de prometer esta función hay que encontrar una librería WASM que sí lo soporte (ej. algo basado en `qpdf` o `mupdf.js`) y validar que el tamaño de descarga sea razonable — si no aparece nada liviano, mejor no sumarla que sumarla a medias. _(agregado 2026-10-06)_
- [ ] **`loadScript()` muestra "undefined" cuando falla la carga de un CDN** — en `js/app.js`, `loadScript()` hace `s.onerror = rej` pasando el Event crudo del navegador, que no tiene `.message` — cualquier tool que haga `catch(e) { showResult(..., '❌ ' + e.message) }` termina mostrando literalmente "undefined" si el CDN no responde (encontrado al testear `pdf-pagenum` sin red). Afecta a TODAS las herramientas que usan `_loadPdfLib`/`_loadPdfJs`/jszip/tesseract/qrcode-generator, no es nuevo de una sola herramienta. Arreglo chico: en el `onerror`, rechazar con `new Error('No se pudo cargar una librería externa — revisá tu conexión')` en vez de pasar el Event tal cual. _(agregado 2026-10-06)_

## Hechas

- [x] **Recortar imagen (crop)** — `img-crop`, caja de recorte interactiva arrastrando sobre la imagen (con presets de proporción libre/1:1/16:9/4:3). Encontrado y corregido en el camino: las imágenes son arrastrables (drag-and-drop nativo del navegador) por defecto, lo que interceptaba los eventos de puntero después del primer movimiento — se arregló con `draggable="false"` + `ondragstart="return false"` en el `<img>`. _(hecho 2026-10-06)_
- [x] **Rotar/espejar imagen** — `img-rotate`, rotación en pasos de 90° y espejo horizontal/vertical con preview en vivo sobre canvas. _(hecho 2026-10-06)_
- [x] **Agregar números de página a un PDF** — `pdf-pagenum`, con posición (6 variantes), formato (simple/con total/"Página N") y número inicial configurables. _(hecho 2026-10-06)_

