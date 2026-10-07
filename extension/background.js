// Taro's Tools — service worker de la extensión.
// Nada de esto manda tus imágenes ni tu texto a ningún servidor propio: la compresión y la
// paleta de colores se procesan acá mismo, en tu navegador, con OffscreenCanvas. "Generar QR" y
// "Abrir Taro's Tools" abren una pestaña en el sitio real (con el deep-link #<id> para ir directo
// a la herramienta) — el QR también se genera ahí en el navegador, no hay servidor intermedio.

const DEFAULT_SITE = 'https://tarotools.netlify.app';

async function getSiteUrl() {
  const { siteUrl } = await chrome.storage.local.get('siteUrl');
  return (siteUrl || DEFAULT_SITE).replace(/\/$/, '');
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'tt-compress-image',
    title: "Taro's Tools: comprimir esta imagen",
    contexts: ['image'],
  });
  chrome.contextMenus.create({
    id: 'tt-palette-image',
    title: "Taro's Tools: ver paleta de colores",
    contexts: ['image'],
  });
  chrome.contextMenus.create({
    id: 'tt-qr-selection',
    title: "Taro's Tools: generar QR con esto",
    contexts: ['selection'],
  });
  chrome.contextMenus.create({
    id: 'tt-open-tools',
    title: "Abrir Taro's Tools",
    contexts: ['action'],
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  try {
    if (info.menuItemId === 'tt-compress-image') await compressImage(info.srcUrl);
    else if (info.menuItemId === 'tt-palette-image') await paletteFromImage(info.srcUrl);
    else if (info.menuItemId === 'tt-qr-selection') await openQrWithText(info.selectionText || '');
    else if (info.menuItemId === 'tt-open-tools') await chrome.tabs.create({ url: await getSiteUrl() });
  } catch (e) {
    notify('Taro\'s Tools', 'Algo falló: ' + (e.message || 'error desconocido'));
  }
});

function notify(title, message) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon128.png',
    title,
    message,
  });
}

async function loadBitmap(srcUrl) {
  const res = await fetch(srcUrl);
  if (!res.ok) throw new Error('no se pudo descargar la imagen (' + res.status + ')');
  const blob = await res.blob();
  return { bitmap: await createImageBitmap(blob), blob };
}

// Dibuja sobre fondo blanco antes de exportar a JPEG: igual que en el sitio, si no se hace esto
// los píxeles transparentes de un PNG salen negros en vez de blancos.
function drawOpaque(bitmap) {
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0);
  return canvas;
}

// chrome.downloads.download() necesita una URL, pero URL.createObjectURL() no existe en el
// contexto del service worker de extensiones (a diferencia de una página normal) — se arma a
// mano una data: URL en base64 en su lugar.
async function blobToDataUrl(blob) {
  const buf = await blob.arrayBuffer();
  const bytes = new Uint8Array(buf);
  let binary = '';
  const chunkSize = 0x8000; // de a tandas, para no pasarle un array gigante a String.fromCharCode
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
  }
  return `data:${blob.type};base64,${btoa(binary)}`;
}

async function compressImage(srcUrl) {
  if (!srcUrl) throw new Error('no se pudo leer la imagen');
  const { bitmap, blob: origBlob } = await loadBitmap(srcUrl);
  const canvas = drawOpaque(bitmap);
  const outBlob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.75 });
  const url = await blobToDataUrl(outBlob);
  const pct = Math.round((1 - outBlob.size / origBlob.size) * 100);
  await chrome.downloads.download({ url, filename: 'taro-comprimida.jpg', saveAs: false });
  notify(
    "Taro's Tools",
    pct > 0
      ? `Comprimida: ${fmtSize(origBlob.size)} → ${fmtSize(outBlob.size)} (-${pct}%)`
      : `Descargada (${fmtSize(outBlob.size)}) — ya estaba bien comprimida`
  );
}

async function paletteFromImage(srcUrl) {
  if (!srcUrl) throw new Error('no se pudo leer la imagen');
  const { bitmap } = await loadBitmap(srcUrl);
  const SIZE = 80;
  const canvas = new OffscreenCanvas(SIZE, SIZE);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(bitmap, 0, 0, SIZE, SIZE);
  const data = ctx.getImageData(0, 0, SIZE, SIZE).data;

  const bucketSize = 24;
  const buckets = new Map();
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 128) continue;
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const key = [r / bucketSize | 0, g / bucketSize | 0, b / bucketSize | 0].join(',');
    const entry = buckets.get(key) || { count: 0, r: 0, g: 0, b: 0 };
    entry.count++; entry.r += r; entry.g += g; entry.b += b;
    buckets.set(key, entry);
  }

  const swatches = [...buckets.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    .map(e => '#' + [e.r, e.g, e.b].map(sum => Math.round(sum / e.count).toString(16).padStart(2, '0')).join(''));

  notify("Taro's Tools — paleta", swatches.join('  ·  '));
}

async function openQrWithText(text) {
  const clean = text.trim();
  if (!clean) throw new Error('no hay texto seleccionado');
  const site = await getSiteUrl();
  await chrome.tabs.create({ url: `${site}/#b12?text=${encodeURIComponent(clean)}` });
}

function fmtSize(bytes) {
  if (bytes < 1024) return bytes + 'B';
  if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + 'KB';
  return (bytes / (1024 * 1024)).toFixed(1) + 'MB';
}
