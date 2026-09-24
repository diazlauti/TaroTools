---
name: Mejorar proyecto
description: Corre una pasada autónoma de análisis y mejora sobre todo el repo TaroTools (sitio estático de herramientas online) — busca bugs, huecos de seguridad, funcionalidad rota y pulido visual/animación, arregla lo que encuentre priorizado, y si no hay nada importante que arreglar suma una herramienta nueva en la categoría con menos herramientas. Pensado para correr en loop, una pasada por invocación. Usar cuando el usuario pida "mejorar el proyecto", "seguí mejorando TaroTools", "seguí en el camino que veníamos hablando", "hacé otra pasada de mejoras", "seguí el bucle de mejoras", o cualquier variante de retomar la revisión continua del sitio sin que el usuario tenga que repetir el contexto cada vez.
---

# Mejorar proyecto (TaroTools)

Una pasada = analizar todo el repo → priorizar lo encontrado → arreglar o sumar UNA cosa bien
verificada → commitear → parar. No hace falta resolver todo en una sola pasada: es mejor una
mejora chica y bien probada que un batch grande sin verificar. Si el usuario pide explícitamente
"en bucle" o "seguí sin parar", encadená varias pasadas una tras otra en la misma sesión, pero
cada una sigue siendo un ciclo completo de analizar→arreglar→verificar→commit antes de pasar a la
siguiente.

## Por qué esta prioridad

Un bug roto o un hueco de seguridad afecta a cualquiera que use la herramienta ahora mismo; un
detalle visual solo se nota si alguien llega a mirarlo. Por eso el orden es siempre:

1. **Seguridad** — XSS vía `innerHTML`/`insertAdjacentHTML` con datos no sanitizados, claves o
   tokens hardcodeados en el código (revisar `netlify/functions/*.js`, ahí SÍ deben leerse de
   `process.env`, nunca hardcodeadas), URLs externas cargadas sin validar, `eval`/`Function`
   sobre input de usuario.
2. **Bugs de funcionalidad** — algo que el usuario ve roto: una herramienta que tira error, un
   caso límite no manejado (archivo vacío, input gigante, formato inesperado), un mensaje de
   error que no ayuda a entender qué pasó.
3. **Huecos de funcionalidad real** — la herramienta "funciona" pero le falta algo que cualquiera
   esperaría (ej: un conversor sin la unidad más pedida, un generador sin opción obvia).
4. **Visual / animación** — pulido de diseño, consistencia con el sistema "underground" del sitio,
   micro-interacciones.
5. **Herramientas nuevas** — solo si no encontraste nada de lo anterior que valga la pena, o el
   usuario específicamente pidió sumar. Ver la sección de balanceo de categorías más abajo.

No inventes trabajo: si una pasada de análisis no encuentra nada real en los niveles 1-4, pasar
directo a nivel 5 es lo correcto, no un fallback de último recurso.

## Cómo analizar

El repo es un sitio estático sin build: HTML/CSS/JS vanilla, sin framework. Todo el código de
herramientas vive en un solo archivo:

- `js/app.js` — módulos IIFE: `Audio`, `I18n` (definiciones de herramientas en `TOOL_DEFS` +
  strings en `STRINGS.es`, único locale realmente usado), `UI`, `Tools`, `ToolUI.BUILDERS`
  (markup de cada herramienta, keyed por `type`), `ToolFn` (toda la lógica), `Admin`.
- `css/style.css` — tokens de diseño en `:root` (`--bg/--bg2/--bg3`, `--fg/--fg2/--fg3`,
  `--accent` lima, `--accent2` rosa, `--accent3` cian, `--border`, `--radius-sm/md/lg`,
  `--transition`), overrides en `body.light` para tema claro.
- `netlify/functions/*.js` — proxies serverless (ej. `gemini.js`, `cobalt.js`) que esconden API
  keys del lado del servidor.

Para encontrar problemas reales en vez de teorizar, leé el código en profundidad, no solo lo
mires por arriba: abrí `js/app.js` por secciones (es largo, ~4700+ líneas) y seguí la lógica de
2-3 herramientas completas de punta a punta — desde el builder hasta la función que procesa el
archivo/input — buscando específicamente:

- Casos límite sin manejar (¿qué pasa con un archivo de 0 bytes? ¿un input vacío? ¿un formato no
  soportado que el `accept` del input no bloquea?)
- `innerHTML`/`insertAdjacentHTML` armado con template strings que incluyen texto de usuario o de
  un archivo sin escapar (ya existe `_escHtml()` como helper — si falta usarlo en algún lugar
  nuevo, es un bug real).
- Mensajes de error genéricos donde se podría dar información específica y accionable.
- Recursos cargados desde CDN externo sin fallback si el `loadScript()` falla.

Para lo visual: abrí 3-4 herramientas en el navegador (ver sección de testing) y compará contra
las que ya están bien pulidas. Buscá específicamente cualquier cosa que se vea "HTML por
defecto" — bordes redondeados genéricos sin el corte de esquina (`clip-path: polygon(...)`) que
usa el resto del sitio, `<select>`/inputs sin estilizar, contenedores sin el acento de categoría
(`--cat-accent` vía `[data-cat]`), texto plano sin jerarquía tipográfica clara. El objetivo del
usuario es explícito: nada debe parecer "el esqueleto default de un sistema" — todo tiene que
sentirse diseñado a propósito, individual por herramienta, pero dentro de la paleta y animaciones
ya establecidas (no inventes colores nuevos fuera de `--accent/--accent2/--accent3` ni un sistema
de animación distinto).

## Sumar herramientas nuevas (nivel 5)

Cuando toca sumar en vez de arreglar, la categoría a elegir no es antojo: contá cuántas
herramientas tiene cada categoría en `TOOL_DEFS` y sumá a la que tenga menos, para que el sitio
se sienta parejo en vez de con una categoría gigante y otras vacías. Comando rápido para chequear
el estado actual antes de decidir:

```bash
grep -oP "cat:\s*'\K[a-z]+" js/app.js | sort | uniq -c | sort -n
```

(al momento de escribir esto, `archivo` y `conversion`/`media` eran las más chicas — pero
recontá siempre, no asumas que sigue igual). Dentro de esa categoría, priorizá algo que:

- Corra 100% local (sin API paga) o sea un link curado a una página externa gratuita y conocida
  (el usuario mencionó explícitamente `everynoise.com/engenremap.html` como el tipo de link que
  le gusta — algo útil o curioso, no genérico).
- Reutilice patrones/helpers que ya existen en `ToolFn` en vez de reinventar (por ej. si ya hay
  un parser de CSV o un motor de diff, aprovechalo).
- Tenga su propia identidad visual dentro del sistema existente, igual que las herramientas ya
  pulidas — no una copia genérica de otra.

Agregala en `TOOL_DEFS`, con nombre/descripción en `STRINGS.es.toolNames`/`toolDescs`, su builder
en `ToolUI.BUILDERS` y su lógica en `ToolFn`, siguiendo la forma en que están armadas las
herramientas vecinas de esa categoría.

## Verificar antes de commitear

Nunca des una pasada por terminada sin probarla de verdad:

```bash
python3 -m http.server 8811 --directory /home/user/TaroTools
```

y manejá un browser real con Playwright
(`/opt/pw-browsers/chromium-1194/chrome-linux/chrome`, lanzado con `args:['--no-sandbox']` vía
`/opt/node22/lib/node_modules/playwright`) contra `http://localhost:8811`. Generá assets de
prueba sintéticos reales cuando la herramienta los necesite (imágenes con `PIL`, PDFs dummy,
etc.) en vez de asumir que anda. Para cualquier cambio, como mínimo:

1. Abrí la herramienta tocada y ejercitá el flujo real que arreglaste/agregaste (no solo que
   abra el modal).
2. Sacá una captura de pantalla y mirala vos mismo — no confíes en que "no tiró error" signifique
   que se ve bien.
3. Corré una regresión rápida abriendo todas las cards (hay históricamente un script tipo
   `test.js` en el scratchpad de sesiones anteriores que abre las 48 herramientas y chequea que
   ninguna quede con el body vacío ni tire error de consola — si no existe en esta sesión,
   recrealo, es corto).

Recordá que este sandbox bloquea salida HTTPS a dominios no permitidos (CDNs externos, APIs
reales) — si algo depende de un CDN externo, usá `page.route()` para interceptar y servir una
copia real de la librería (bajada vía `npm pack`, que sí está permitido) en vez de reportar que
"no se pudo probar por la red".

## Commit y push

Este repo se trabaja históricamente con dos clones locales: uno de solo lectura y otro con
credenciales de push (revisá `git remote -v` en cada uno si no estás seguro de cuál es cuál).
El patrón, si esa estructura sigue existiendo:

1. Editá y probá en el clone principal.
2. Sincronizá el clone con push (`git pull`) y copiá ahí los archivos tocados.
3. Commiteá y pusheá desde ese clone a la branch de trabajo actual (revisá `git branch` /
   `git log` para confirmar cuál es).
4. Actualizá el clone principal al mismo commit (`git fetch` + `git reset --hard
   origin/<branch>`) en vez de crear un commit local aparte — evita el falso "hay commits sin
   pushear" que generaba el patrón anterior de commitear en los dos lados por separado.

Si en la sesión actual solo existe un clone con push directo, simplemente commiteá y pusheá ahí,
sin el paso de sincronización.

Mensajes de commit: cortos, en español (el resto del historial del repo está en español), que
digan qué cambió y por qué en una línea — no hace falta el detalle de cada archivo tocado, eso
ya lo muestra el diff. Usá el formato de atribución que esté vigente en las instrucciones del
sistema de la sesión actual (varía; no lo hardcodees acá).

## Cuándo parar

Una pasada termina cuando el cambio está commiteado (y pusheado si hay forma) y verificado. No
hace falta preguntar "¿querés que siga?" — si te pidieron el loop, seguí a la siguiente pasada
directamente. Si en una pasada no encontrás nada real en ningún nivel (ni bugs, ni huecos, ni
pulido pendiente, ni categoría desbalanceada que valga la pena), decilo así de simple en vez de
forzar un cambio cosmético sin sentido — mejor una pasada que dice "está bien como está" que un
commit que no aporta nada.
