const DEFAULT_SITE = 'https://tarotools.netlify.app';

const QUICK_TOOLS = [
  { id: 'b1',  icon: '🖼️', name: 'Comprimir imagen' },
  { id: 'b2',  icon: '🔄', name: 'Convertir imagen' },
  { id: 'b6',  icon: '📄', name: 'PDF a texto' },
  { id: 'b12', icon: '◼️', name: 'Generador QR' },
  { id: 'b13', icon: '🎨', name: 'Colores' },
  { id: 'b16', icon: '💾', name: 'Base64' },
  { id: 'd2',  icon: '{ }', name: 'JSON' },
  { id: 'd4',  icon: '🧮', name: 'Unidades' },
];

function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  setTimeout(() => { if (el.textContent === msg) el.textContent = ''; }, 1800);
}

async function getSiteUrl() {
  const { siteUrl } = await chrome.storage.local.get('siteUrl');
  return (siteUrl || DEFAULT_SITE).replace(/\/$/, '');
}

async function openTool(toolId) {
  const site = await getSiteUrl();
  chrome.tabs.create({ url: `${site}/#${toolId}` });
}

async function renderQuickGrid() {
  const grid = document.getElementById('quick-grid');
  grid.innerHTML = '';
  QUICK_TOOLS.forEach(t => {
    const btn = document.createElement('button');
    btn.innerHTML = `<span class="ic">${t.icon}</span>${t.name}`;
    btn.onclick = () => openTool(t.id);
    grid.appendChild(btn);
  });
}

function copyText(text, label) {
  navigator.clipboard.writeText(text).then(() => toast((label || 'Copiado') + ' ✓'));
}

// ── generador de contraseñas ──
function genPassword() {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+';
  const len = 16;
  const bytes = new Uint32Array(len);
  crypto.getRandomValues(bytes);
  let out = '';
  for (let i = 0; i < len; i++) out += chars[bytes[i] % chars.length];
  document.getElementById('pwd-out').textContent = out;
  return out;
}

// ── generador de UUID ──
function genUUID() {
  const uuid = crypto.randomUUID();
  document.getElementById('uuid-out').textContent = uuid;
  return uuid;
}

// ── EyeDropper (solo si el navegador lo soporta) ──
function initEyeDropper() {
  if (!('EyeDropper' in window)) return;
  document.getElementById('eyedropper-mini').style.display = 'block';
  document.getElementById('pick-color').onclick = async () => {
    try {
      const ed = new EyeDropper();
      const result = await ed.open();
      document.getElementById('color-swatch').style.background = result.sRGBHex;
      document.getElementById('color-out').textContent = result.sRGBHex;
      document.getElementById('color-copy').onclick = () => copyText(result.sRGBHex, 'Color');
    } catch (e) { /* el usuario canceló la selección */ }
  };
}

// ── settings (URL del sitio, por si el usuario tiene un dominio propio) ──
function initSettings() {
  const panel = document.getElementById('settings-panel');
  document.getElementById('settings-link').onclick = async (e) => {
    e.preventDefault();
    document.getElementById('site-input').value = await getSiteUrl();
    panel.style.display = 'flex';
  };
  document.getElementById('settings-close').onclick = () => { panel.style.display = 'none'; };
  document.getElementById('site-save').onclick = async () => {
    let val = document.getElementById('site-input').value.trim();
    if (val && !/^https?:\/\//.test(val)) val = 'https://' + val;
    await chrome.storage.local.set({ siteUrl: val || DEFAULT_SITE });
    panel.style.display = 'none';
    toast('Guardado ✓');
  };
}

document.addEventListener('DOMContentLoaded', () => {
  renderQuickGrid();
  initSettings();
  initEyeDropper();

  genPassword();
  genUUID();

  document.getElementById('open-site').onclick = async () => chrome.tabs.create({ url: await getSiteUrl() });
  document.getElementById('pwd-copy').onclick = () => copyText(document.getElementById('pwd-out').textContent, 'Contraseña');
  document.getElementById('pwd-regen').onclick = genPassword;
  document.getElementById('uuid-copy').onclick = () => copyText(document.getElementById('uuid-out').textContent, 'UUID');
  document.getElementById('uuid-regen').onclick = genUUID;
});
