# Taro's Tools — extensión de Chrome

Extensión liviana (Manifest V3) que hace tres cosas útiles **directamente en la página que estás
mirando**, sin tener que ir primero a TaroTools:

- **Click derecho sobre una imagen** → "Comprimir esta imagen" (la comprime y descarga al toque,
  100% en tu navegador) o "Ver paleta de colores" (te muestra los 5 colores dominantes en una
  notificación).
- **Click derecho sobre texto seleccionado** → "Generar QR con esto" (abre TaroTools con el QR ya
  generado para ese texto/link).
- **Click en el ícono de la extensión** → popup con accesos directos a las 8 herramientas más
  usadas, más un generador de contraseñas, un generador de UUID y (si tu Chrome lo soporta) un
  selector de color de pantalla — todo funciona ahí mismo, sin abrir ninguna pestaña.

Nada de esto manda imágenes ni texto a ningún servidor propio: la compresión y la paleta de
colores se procesan localmente con `OffscreenCanvas`; el QR se genera en TaroTools igual que si lo
hubieras escrito vos a mano en el sitio.

## Probarla ahora mismo (modo desarrollador, sin esperar al Chrome Web Store)

1. Abrí `chrome://extensions` en Chrome.
2. Activá "Modo de desarrollador" (switch arriba a la derecha).
3. Click en "Cargar extensión sin empaquetar" ("Load unpacked").
4. Elegí esta carpeta (`extension/`).

Listo — ya la tenés instalada y funcionando en tu Chrome. Cualquier cambio que le hagas a los
archivos se refleja con un click en el botón de recargar (↻) de la extensión en esa misma página.

## Publicarla en el Chrome Web Store (cuando quieras)

1. Creá una cuenta de desarrollador en el
   [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole) — pago
   único de **US$5**, no se renueva.
2. Comprimí esta carpeta (`extension/`) en un `.zip` — el `.zip` tiene que tener `manifest.json`
   en la raíz, no dentro de una subcarpeta.
3. Subilo al dashboard. Vas a necesitar:
   - 1-5 capturas de pantalla (1280×800 o 640×400) — mostrá el menú contextual sobre una imagen y
     el popup con el generador de contraseñas, por ejemplo.
   - Un ícono de 128×128 (ya está en `icons/icon128.png`).
   - Una descripción corta (lo que dice `description` en `manifest.json` ya sirve) y una más larga
     para la ficha de la tienda.
   - Una política de privacidad pública (una página simple alcanza: explicá que no se recolecta ni
     se manda nada a ningún servidor propio — todo el procesamiento es local, y la única conexión
     saliente es a tarotools.netlify.app cuando el usuario elige "Generar QR").
4. Mandalo a revisión. Google suele tardar entre un par de días y una semana.

## Si tu sitio queda en otro dominio

Por defecto apunta a `https://tarotools.netlify.app`. Si en algún momento TaroTools pasa a tener
un dominio propio, no hace falta tocar código: abrí el popup de la extensión → "configurar sitio"
→ pegá la URL nueva. Se guarda en `chrome.storage.local`, cada instalación puede tener la suya.
