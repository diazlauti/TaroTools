'use strict';

/* ═══════════════════════════════════════════════
   CONFIG
═══════════════════════════════════════════════ */
const CONFIG = {
  GEMINI_PROXY: '/.netlify/functions/gemini',
  GEMINI_MODEL: 'gemini-2.0-flash-lite',
  COBALT_API: 'https://api.cobalt.tools/api/json',
  QR_API: 'https://api.qrserver.com/v1/create-qr-code/',
  IP_API: 'https://api.ipify.org?format=json',
  ADMIN_PASS_HASH: 'a0f50e4075fa8fc1c8acce4c6ab92f7713913eb7906850bb25cc3a72f88e4550',
};

/* ═══════════════════════════════════════════════
   AUDIO MODULE
═══════════════════════════════════════════════ */
const Audio = (() => {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  document.addEventListener('click', () => { if (ctx.state === 'suspended') ctx.resume(); }, { once: true });

  function beep(freq = 440, dur = .08, type = 'square', vol = .1) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.type = type;
    o.frequency.setValueAtTime(freq, ctx.currentTime);
    g.gain.setValueAtTime(vol, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + dur);
    o.start(); o.stop(ctx.currentTime + dur);
  }

  return {
    click()   { beep(800,.05,'square',.08); setTimeout(()=>beep(1100,.04,'square',.05),40); },
    success() { beep(600,.07,'sine',.1); setTimeout(()=>beep(900,.1,'sine',.09),80); },
    error()   { beep(200,.12,'sawtooth',.1); },
    unlock()  { [500,700,900,1200].forEach((f,i)=>setTimeout(()=>beep(f,.1,'sine',.12),i*70)); },
    delete()  { beep(300,.1,'sawtooth',.1); setTimeout(()=>beep(180,.12,'sawtooth',.08),90); },
  };
})();

/* ═══════════════════════════════════════════════
   I18N MODULE
═══════════════════════════════════════════════ */
const I18n = (() => {
  let current = 'es';

  const TOOL_DEFS = [
    { id:'b1',  icon:'🖼️', cat:'archivo',    type:'img-compress'  },
    { id:'b2',  icon:'🔄', cat:'conversion', type:'img-convert'   },
    { id:'b3',  icon:'📋', cat:'conversion', type:'img-pdf'       },
    { id:'b4',  icon:'🎬', cat:'media',      type:'vid-compress'  },
    { id:'b5',  icon:'🎵', cat:'media',      type:'aud-compress'  },
    { id:'b6',  icon:'📄', cat:'archivo',    type:'pdf-text'      },
    { id:'b7',  icon:'✂️', cat:'texto',      type:'ai-summarize'  },
    { id:'b8',  icon:'✏️', cat:'texto',      type:'ai-correct'    },
    { id:'b9',  icon:'🌐', cat:'texto',      type:'ai-soon',      soon:true },
    { id:'b10', icon:'📝', cat:'texto',      type:'ai-soon',      soon:true },
    { id:'b11', icon:'⬇️', cat:'media',      type:'cobalt-dl'     },
    { id:'b12', icon:'◼️', cat:'util',       type:'qr-gen'        },
    { id:'b13', icon:'🎨', cat:'util',       type:'color-conv'    },
    { id:'b14', icon:'🔡', cat:'texto',      type:'case-conv'     },
    { id:'b15', icon:'🔢', cat:'texto',      type:'word-count'    },
    { id:'b16', icon:'💾', cat:'util',       type:'base64'        },
    { id:'b17', icon:'🔐', cat:'util',       type:'hash-gen'      },
    { id:'b18', icon:'⏱️', cat:'util',       type:'timer'         },
    { id:'b19', icon:'🆔', cat:'util',       type:'uuid-gen'      },
    { id:'b20', icon:'🌍', cat:'util',       type:'my-ip'         },
  ];

  const STRINGS = {
    es: {
      tagline:'herramientas útiles · sin virus · sin drama',
      search:'Buscar herramienta...',
      mq:'✦ TARO\'S TOOLS ✦ COMPRESOR ✦ PDF ✦ TRADUCTOR ✦ RESUMIDOR ✦ DESCARGADOR ✦ CONVERTIDOR ✦ CORRECTOR ✦ VIDEO ✦ AUDIO ✦ QR ✦ COLORES ✦',
      tabs:['Todas','Archivos','Texto','Conversión','Media','Utilidades'],
      catKeys:['all','archivo','texto','conversion','media','util'],
      catNames:{ archivo:'📁 Archivos', texto:'📝 Texto', conversion:'🔄 Conversión', media:'🎬 Media', util:'⚡ Utilidades' },
      donBtn:'donar', donTitle:'💜 Apoyá a Taro',
      donDesc:'Si esta página te fue útil, invitame un café o hacé una donación.',
      adminTitle:'// panel admin', atTools:'herramientas', atAdd:'agregar', atCats:'categorías',
      addBtn:'Agregar', saveBtn:'Guardar', deleteBtn:'Borrar', editBtn:'Editar',
      hideBtn:'Ocultar', showBtn:'Mostrar', upBtn:'↑', downBtn:'↓',
      listEmpty:'No hay herramientas extra aún.',
      adminPassLabel:'Contraseña admin', adminPassPlaceholder:'••••••••', adminPassBtn:'Entrar',
      adminPassError:'Contraseña incorrecta',
      fields:{ name:'Nombre', desc:'Descripción', icon:'Ícono', cat:'Categoría', url:'URL externa' },
      ph:{ name:'Ej: Generador de QR', desc:'Una línea corta', icon:'🔧', url:'https://...' },
      cats:{ archivo:'Archivos', texto:'Texto', conversion:'Conversión', media:'Media', util:'Utilidades' },
      toast:{ added:'✦ agregada', deleted:'✦ eliminada', saved:'✦ guardada', unlocked:'🔓 admin desbloqueado', copied:'✦ copiado', hidden:'✦ oculta', shown:'✦ visible' },
      soon:'Próximamente',
      soonDesc:'Esta función estará disponible pronto.',
      toolNames:{
        b1:'Compresor de imágenes', b2:'Convertidor de imágenes', b3:'Imágenes a PDF',
        b4:'Compresor de video', b5:'Compresor de audio', b6:'PDF a texto',
        b7:'Resumidor IA', b8:'Corrector IA', b9:'Traductor IA', b10:'Expandidor IA',
        b11:'Descargador video/audio', b12:'Generador de QR', b13:'Conversor de colores',
        b14:'Conversor de mayúsculas', b15:'Contador de palabras', b16:'Base64',
        b17:'Generador de hash', b18:'Cronómetro', b19:'Generador de UUID', b20:'¿Cuál es mi IP?',
      },
      toolDescs:{
        b1:'Reducí el tamaño de JPG/PNG con preview y comparación antes/después.',
        b2:'Convertí entre JPG, PNG y WEBP con preview de cada archivo.',
        b3:'Juntá una o varias imágenes en un solo PDF.',
        b4:'Comprimí videos MP4 reduciendo resolución y bitrate.',
        b5:'Comprimí MP3, WAV u OGG con control de canales y sample rate.',
        b6:'Extraé el texto de cualquier PDF en segundos.',
        b7:'Resumidor con IA — próximamente.',
        b8:'Corrector con IA — próximamente.',
        b9:'Traductor con IA — próximamente.',
        b10:'Expandidor con IA — próximamente.',
        b11:'Descargá de YouTube, TikTok, Instagram y más.',
        b12:'Generá códigos QR con preview en vivo y colores personalizables.',
        b13:'Convertí entre HEX, RGB y HSL al instante.',
        b14:'Cambiá el case: mayúsculas, minúsculas, título, alternado.',
        b15:'Contá palabras, caracteres y líneas en tiempo real.',
        b16:'Codificá o decodificá cualquier texto en Base64.',
        b17:'Generá SHA-256, SHA-1 o SHA-512 de cualquier texto.',
        b18:'Cronómetro con laps y historial de vueltas.',
        b19:'Generá IDs únicos universales al instante.',
        b20:'Consultá tu dirección IP pública.',
      },
      langs:['Inglés','Español','Portugués','Francés','Alemán','Italiano','Japonés','Chino (simplificado)','Árabe','Ruso','Coreano','Hindi'],
    },
    en: {
      tagline:'useful tools · no viruses · no drama',
      search:'Search tool...',
      mq:'✦ TARO\'S TOOLS ✦ COMPRESSOR ✦ PDF ✦ TRANSLATOR ✦ SUMMARIZER ✦ DOWNLOADER ✦ CONVERTER ✦ CORRECTOR ✦ VIDEO ✦ AUDIO ✦ QR ✦ COLORS ✦',
      tabs:['All','Files','Text','Conversion','Media','Utilities'],
      catKeys:['all','archivo','texto','conversion','media','util'],
      catNames:{ archivo:'📁 Files', texto:'📝 Text', conversion:'🔄 Conversion', media:'🎬 Media', util:'⚡ Utilities' },
      donBtn:'donate', donTitle:'💜 Support Taro',
      donDesc:'If this page was useful, buy me a coffee or make a donation.',
      adminTitle:'// admin panel', atTools:'tools', atAdd:'add', atCats:'categories',
      addBtn:'Add', saveBtn:'Save', deleteBtn:'Delete', editBtn:'Edit',
      hideBtn:'Hide', showBtn:'Show', upBtn:'↑', downBtn:'↓',
      listEmpty:'No extra tools yet.',
      adminPassLabel:'Admin password', adminPassPlaceholder:'••••••••', adminPassBtn:'Enter',
      adminPassError:'Wrong password',
      fields:{ name:'Name', desc:'Description', icon:'Icon', cat:'Category', url:'External URL' },
      ph:{ name:'E.g. QR Generator', desc:'One short line', icon:'🔧', url:'https://...' },
      cats:{ archivo:'Files', texto:'Text', conversion:'Conversion', media:'Media', util:'Utilities' },
      toast:{ added:'✦ added', deleted:'✦ deleted', saved:'✦ saved', unlocked:'🔓 admin unlocked', copied:'✦ copied', hidden:'✦ hidden', shown:'✦ visible' },
      soon:'Coming Soon',
      soonDesc:'This feature will be available soon.',
      toolNames:{
        b1:'Image Compressor', b2:'Image Converter', b3:'Images to PDF',
        b4:'Video Compressor', b5:'Audio Compressor', b6:'PDF to Text',
        b7:'AI Summarizer', b8:'AI Corrector', b9:'AI Translator', b10:'AI Text Expander',
        b11:'Video/Audio Downloader', b12:'QR Generator', b13:'Color Converter',
        b14:'Case Converter', b15:'Word Counter', b16:'Base64',
        b17:'Hash Generator', b18:'Stopwatch', b19:'UUID Generator', b20:"What's my IP?",
      },
      toolDescs:{
        b1:'Reduce JPG/PNG size with before/after visual comparison.',
        b2:'Convert between JPG, PNG and WEBP with file previews.',
        b3:'Combine one or more images into a single PDF.',
        b4:'Compress MP4 videos by reducing resolution and bitrate.',
        b5:'Compress MP3, WAV or OGG with channel and sample rate control.',
        b6:'Extract text from any PDF in seconds.',
        b7:'AI Summarizer — coming soon.',
        b8:'AI Corrector — coming soon.',
        b9:'AI Translator — coming soon.',
        b10:'AI Expander — coming soon.',
        b11:'Download from YouTube, TikTok, Instagram and more.',
        b12:'Generate QR codes with live preview and custom colors.',
        b13:'Convert between HEX, RGB and HSL instantly.',
        b14:'Change case: uppercase, lowercase, title, alternate.',
        b15:'Count words, characters and lines in real time.',
        b16:'Encode or decode any text in Base64.',
        b17:'Generate SHA-256, SHA-1 or SHA-512 from any text.',
        b18:'Stopwatch with laps and lap history.',
        b19:'Generate universal unique IDs instantly.',
        b20:'Check your public IP address.',
      },
      langs:['English','Spanish','Portuguese','French','German','Italian','Japanese','Chinese (Simplified)','Arabic','Russian','Korean','Hindi'],
    },
    pt: {
      tagline:'ferramentas úteis · sem vírus · sem drama',
      search:'Buscar ferramenta...',
      mq:'✦ TARO\'S TOOLS ✦ COMPRESSOR ✦ PDF ✦ TRADUTOR ✦ RESUMIDOR ✦ BAIXADOR ✦ CONVERSOR ✦ CORRETOR ✦ VÍDEO ✦ ÁUDIO ✦ QR ✦ CORES ✦',
      tabs:['Todas','Arquivos','Texto','Conversão','Mídia','Utilidades'],
      catKeys:['all','archivo','texto','conversion','media','util'],
      catNames:{ archivo:'📁 Arquivos', texto:'📝 Texto', conversion:'🔄 Conversão', media:'🎬 Mídia', util:'⚡ Utilidades' },
      donBtn:'doar', donTitle:'💜 Apoie o Taro',
      donDesc:'Se esta página foi útil, me pague um café ou faça uma doação.',
      adminTitle:'// painel admin', atTools:'ferramentas', atAdd:'adicionar', atCats:'categorias',
      addBtn:'Adicionar', saveBtn:'Salvar', deleteBtn:'Excluir', editBtn:'Editar',
      hideBtn:'Ocultar', showBtn:'Mostrar', upBtn:'↑', downBtn:'↓',
      listEmpty:'Nenhuma ferramenta extra ainda.',
      adminPassLabel:'Senha admin', adminPassPlaceholder:'••••••••', adminPassBtn:'Entrar',
      adminPassError:'Senha incorreta',
      fields:{ name:'Nome', desc:'Descrição', icon:'Ícone', cat:'Categoria', url:'URL externa' },
      ph:{ name:'Ex: Gerador de QR', desc:'Uma linha curta', icon:'🔧', url:'https://...' },
      cats:{ archivo:'Arquivos', texto:'Texto', conversion:'Conversão', media:'Mídia', util:'Utilidades' },
      toast:{ added:'✦ adicionada', deleted:'✦ excluída', saved:'✦ salva', unlocked:'🔓 admin desbloqueado', copied:'✦ copiado', hidden:'✦ oculta', shown:'✦ visível' },
      soon:'Em Breve',
      soonDesc:'Esta função estará disponível em breve.',
      toolNames:{
        b1:'Compressor de imagens', b2:'Conversor de imagens', b3:'Imagens para PDF',
        b4:'Compressor de vídeo', b5:'Compressor de áudio', b6:'PDF para texto',
        b7:'Resumidor IA', b8:'Corretor IA', b9:'Tradutor IA', b10:'Expansor IA',
        b11:'Baixador de vídeo/áudio', b12:'Gerador de QR', b13:'Conversor de cores',
        b14:'Conversor de maiúsculas', b15:'Contador de palavras', b16:'Base64',
        b17:'Gerador de hash', b18:'Cronômetro', b19:'Gerador de UUID', b20:'Qual é meu IP?',
      },
      toolDescs:{
        b1:'Reduza JPG/PNG com comparação visual antes/depois.',
        b2:'Converta entre JPG, PNG e WEBP com preview de cada arquivo.',
        b3:'Junte uma ou várias imagens em um único PDF.',
        b4:'Comprima vídeos MP4 reduzindo resolução e bitrate.',
        b5:'Comprima MP3, WAV ou OGG com controle de canais e sample rate.',
        b6:'Extraia o texto de qualquer PDF em segundos.',
        b7:'Resumidor com IA — em breve.',
        b8:'Corretor com IA — em breve.',
        b9:'Tradutor com IA — em breve.',
        b10:'Expansor com IA — em breve.',
        b11:'Baixe do YouTube, TikTok, Instagram e mais.',
        b12:'Gere códigos QR com preview ao vivo e cores personalizáveis.',
        b13:'Converta entre HEX, RGB e HSL instantaneamente.',
        b14:'Mude o case: maiúsculas, minúsculas, título, alternado.',
        b15:'Conte palavras, caracteres e linhas em tempo real.',
        b16:'Codifique ou decodifique qualquer texto em Base64.',
        b17:'Gere SHA-256, SHA-1 ou SHA-512 de qualquer texto.',
        b18:'Cronômetro com voltas e histórico.',
        b19:'Gere IDs únicos universais instantaneamente.',
        b20:'Consulte seu endereço IP público.',
      },
      langs:['Inglês','Espanhol','Português','Francês','Alemão','Italiano','Japonês','Chinês (Simplificado)','Árabe','Russo','Coreano','Hindi'],
    },
  };

  function get() { return STRINGS[current]; }
  function getLang() { return current; }

  function getTools() {
    const s = get();
    return TOOL_DEFS.map(def => ({
      ...def,
      name: s.toolNames[def.id],
      desc: s.toolDescs[def.id],
    }));
  }

  function set(lang) {
    Audio.click();
    current = lang;
    document.documentElement.lang = lang;
    ['es','en','pt'].forEach(l => document.getElementById('lb-'+l).classList.toggle('active', l === lang));
    const s = get();
    document.getElementById('tagline').textContent = s.tagline;
    document.getElementById('search').placeholder = s.search;
    document.getElementById('don-lbl').textContent = s.donBtn;
    const m = s.mq + '     ';
    document.getElementById('mq').textContent = m + m;
    Tools.renderTabs();
    Tools.renderGrid();
    if (Admin.isUnlocked() && document.getElementById('admin-modal').classList.contains('open')) {
      Admin.renderPanel();
    }
  }

  return { get, getLang, getTools, set };
})();

/* ═══════════════════════════════════════════════
   UI MODULE
═══════════════════════════════════════════════ */
const UI = (() => {
  let theme = 'dark';

  function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg; t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2200);
  }

  function copyText(txt, btn) {
    navigator.clipboard.writeText(txt).then(() => {
      if (btn) { const o = btn.textContent; btn.textContent = '✓'; setTimeout(() => btn.textContent = o, 1200); }
      showToast(I18n.get().toast.copied);
      Audio.success();
    });
  }

  function toggleTheme() {
    Audio.click();
    theme = theme === 'dark' ? 'light' : 'dark';
    document.body.classList.toggle('light', theme === 'light');
    document.getElementById('theme-btn').textContent = theme === 'dark' ? '☀' : '☾';
  }

  function openModal(id) {
    document.getElementById(id).classList.add('open');
    if (id === 'don-modal') {
      const s = I18n.get();
      document.getElementById('don-title').textContent = s.donTitle;
      document.getElementById('don-desc').textContent = s.donDesc;
    }
  }

  function closeModal(id) {
    document.getElementById(id).classList.remove('open');
  }

  document.querySelectorAll('.modal-bg').forEach(bg => {
    bg.addEventListener('click', e => { if (e.target === bg) closeModal(bg.id); });
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-bg.open').forEach(m => closeModal(m.id));
    }
  });

  return { showToast, copyText, toggleTheme, openModal, closeModal };
})();

/* ═══════════════════════════════════════════════
   TOOLS MODULE
═══════════════════════════════════════════════ */
const Tools = (() => {
  let currentCat = 'all';
  let currentSearch = '';

  function filter() {
    currentSearch = document.getElementById('search').value;
    renderGrid();
  }

  function filterCat(cat, el) {
    Audio.click();
    currentCat = cat;
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    el.classList.add('active');
    renderGrid();
  }

  function allTools() {
    const hidden = Admin.getHidden();
    return [...I18n.getTools(), ...Admin.getExtra()]
      .filter(t => !hidden.includes(t.id));
  }

  function renderTabs() {
    const s = I18n.get();
    document.getElementById('tabs-container').innerHTML = s.catKeys.map((c, i) =>
      `<button class="tab${currentCat === c ? ' active' : ''}" onclick="Tools.filterCat('${c}',this)" role="tab" aria-selected="${currentCat === c}">${s.tabs[i]}</button>`
    ).join('');
  }

  function renderGrid() {
    const q = currentSearch.toLowerCase();
    const container = document.getElementById('tools-container');
    const s = I18n.get();
    const fragment = document.createDocumentFragment();
    const cats = [...new Set(allTools().map(t => t.cat))];

    cats.forEach(cat => {
      const filtered = allTools().filter(t =>
        (currentCat === 'all' || t.cat === currentCat) &&
        t.cat === cat &&
        (!q || (t.name + t.desc).toLowerCase().includes(q))
      );
      if (!filtered.length) return;

      const section = document.createElement('div');
      const title = document.createElement('p');
      title.className = 'section-title';
      title.textContent = s.catNames[cat] || cat;
      section.appendChild(title);

      const grid = document.createElement('div');
      grid.className = 'grid';

      filtered.forEach(tool => {
        const card = document.createElement('article');
        card.className = 'card' + (tool.soon ? ' card--soon' : '');
        card.setAttribute('role', 'listitem');
        card.setAttribute('tabindex', '0');
        card.setAttribute('aria-label', tool.name);
        card.innerHTML =
          `<span class="card__cat" aria-hidden="true">${tool.cat}</span>` +
          (tool.soon ? `<span class="card__soon-badge">${s.soon}</span>` : '') +
          `<div class="card__icon" aria-hidden="true">${tool.icon}</div>` +
          `<div class="card__name">${tool.name}</div>` +
          `<div class="card__desc">${tool.desc}</div>`;
        card.onclick = () => openTool(tool);
        card.addEventListener('keydown', e => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openTool(tool); }
        });
        grid.appendChild(card);
      });

      section.appendChild(grid);
      fragment.appendChild(section);
    });

    container.innerHTML = '';
    container.appendChild(fragment);
  }

  function openTool(tool) {
    Audio.click();
    document.getElementById('modal-title').textContent = tool.icon + ' ' + tool.name;
    document.getElementById('modal-body').innerHTML = ToolUI.build(tool);
    UI.openModal('tool-modal');
    if (tool.type === 'word-count') {
      const ta = document.getElementById('wc-input');
      if (ta) ta.addEventListener('input', ToolFn.updateWC);
    }
    if (tool.type === 'color-conv') {
      const inp = document.getElementById('col-input');
      if (inp) inp.addEventListener('input', ToolFn.liveColor);
    }
    if (tool.type === 'qr-gen') {
      const inp = document.getElementById('qr-input');
      if (inp) inp.addEventListener('input', ToolFn.liveQR);
    }
  }

  return { filter, filterCat, renderTabs, renderGrid, allTools, openTool };
})();

/* ═══════════════════════════════════════════════
   TOOL UI BUILDER
═══════════════════════════════════════════════ */
const ToolUI = (() => {
  const infoBox = html => `<div class="info-box">${html}</div>`;
  const label   = txt  => `<label>${txt}</label>`;
  const sel     = (id, opts) => `<select id="${id}">${opts.map(([v,l])=>`<option value="${v}">${l}</option>`).join('')}</select>`;
  const ta      = (id, ph, h='') => `<textarea id="${id}" placeholder="${ph}" ${h}></textarea>`;
  const loader  = (id, txt) => `<div class="loader" id="${id}">${txt}</div>`;
  const result  = id => `<div class="result-area" id="${id}" style="display:none"></div>`;
  const copyRow = id => `<div id="${id}-copy" style="display:none;margin-top:.5rem"></div>`;

  // ── "coming soon" badge style injected once ──
  const SOON_CSS = `
    .card--soon { opacity:.7; }
    .card__soon-badge {
      position:absolute; top:.5rem; left:.6rem;
      font-size:.58rem; font-family:var(--mono); padding:2px 7px;
      border-radius:4px; background:var(--accent2); color:#000; font-weight:700; letter-spacing:.5px;
    }
    body.light .card__soon-badge { color:#fff; }
    .soon-screen {
      text-align:center; padding:2rem 1rem;
    }
    .soon-screen .soon-icon { font-size:3rem; margin-bottom:.8rem; }
    .soon-screen h3 { font-family:var(--mono); font-size:1.1rem; color:var(--accent2); margin-bottom:.5rem; }
    .soon-screen p { font-size:.82rem; color:var(--fg3); line-height:1.6; }
  `;
  if (!document.getElementById('tt-extra-css')) {
    const st = document.createElement('style');
    st.id = 'tt-extra-css';
    st.textContent = SOON_CSS;
    document.head.appendChild(st);
  }

  const BUILDERS = {

    /* ── IMG COMPRESS ── */
    'img-compress': () =>
      infoBox('Soporta <b>JPG, PNG, WEBP</b>. Todo se procesa en tu navegador, nada se sube.') +
      label('Imagen') +
      `<input type="file" id="ic-file" accept="image/jpeg,image/png,image/webp" onchange="ToolFn.previewImg()">` +
      // preview + comparación
      `<div id="ic-previews" style="display:none;margin:.8rem 0">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:.5rem;margin-bottom:.5rem">
          <div>
            <p style="font-size:.68rem;color:var(--fg3);font-family:var(--mono);margin-bottom:.3rem">ANTES</p>
            <img id="ic-before" style="width:100%;border-radius:8px;border:1.5px solid var(--border)" alt="original">
            <p id="ic-before-size" style="font-size:.7rem;color:var(--fg3);font-family:var(--mono);margin-top:.2rem"></p>
          </div>
          <div>
            <p style="font-size:.68rem;color:var(--fg3);font-family:var(--mono);margin-bottom:.3rem">DESPUÉS</p>
            <img id="ic-after" style="width:100%;border-radius:8px;border:1.5px solid var(--border);opacity:.4" alt="comprimida">
            <p id="ic-after-size" style="font-size:.7rem;color:var(--fg3);font-family:var(--mono);margin-top:.2rem">— ajustá la calidad</p>
          </div>
        </div>
      </div>` +
      label('Calidad: <span id="ic-ql">75</span>%') +
      `<input type="range" min="5" max="99" value="75" id="ic-q" oninput="ToolFn.onQualityChange()" style="width:100%;margin:.25rem 0 .1rem">` +
      `<div id="ic-reduction" style="font-size:.75rem;color:var(--fg3);font-family:var(--mono);min-height:1.2rem;margin:.3rem 0"></div>` +
      `<div class="btn-row"><button class="btn" onclick="ToolFn.compressImg()">⬇️ Comprimir y descargar</button></div>` +
      result('ic-result'),

    /* ── IMG CONVERT ── */
    'img-convert': () =>
      infoBox('Convertí entre <b>JPG, PNG y WEBP</b>. Podés subir varias imágenes a la vez.') +
      label('Imágenes (múltiples)') +
      `<input type="file" id="cv-file" accept="image/jpeg,image/png,image/webp" multiple onchange="ToolFn.previewConvertFiles()">` +
      `<div id="cv-previews" style="display:flex;flex-wrap:wrap;gap:.4rem;margin:.6rem 0"></div>` +
      label('Convertir a') +
      sel('cv-fmt', [['image/jpeg','JPG'],['image/png','PNG'],['image/webp','WEBP']]) +
      `<div class="btn-row"><button class="btn" onclick="ToolFn.convertImg()">Convertir todo</button></div>` +
      `<div id="cv-result" style="margin-top:.7rem"></div>`,

    /* ── IMG PDF ── */
    'img-pdf': () =>
      infoBox('Subí <b>una o más imágenes</b>. Cada una ocupa una página en el PDF. El orden es el que subiste.') +
      label('Imágenes') +
      `<input type="file" id="ipdf-file" accept="image/*" multiple onchange="ToolFn.previewPdfFiles()">` +
      `<div id="ipdf-previews" style="display:flex;flex-wrap:wrap;gap:.4rem;margin:.6rem 0"></div>` +
      `<div class="btn-row"><button class="btn" onclick="ToolFn.imgToPdf()">📄 Generar PDF</button></div>` +
      loader('ipdf-loader','⏳ generando PDF...') +
      `<div id="ipdf-result" style="margin-top:.7rem"></div>`,

    /* ── VID COMPRESS ── */
    'vid-compress': () =>
      infoBox('⚠️ El resultado es <b>WEBM</b> (limitación del navegador). Para MP4 profesional usá <a href="https://handbrake.fr" target="_blank">HandBrake</a> (gratis).') +
      label('Video') +
      `<input type="file" id="vc-file" accept="video/*" onchange="ToolFn.previewVideo()">` +
      `<div id="vc-video-preview" style="margin:.5rem 0;display:none">
        <video id="vc-orig-video" controls muted style="width:100%;border-radius:8px;border:1.5px solid var(--border);max-height:160px"></video>
        <p id="vc-orig-info" style="font-size:.72rem;color:var(--fg3);font-family:var(--mono);margin-top:.3rem"></p>
      </div>` +
      label('Escala de resolución') +
      sel('vc-scale',[['1','100% (original)'],['0.75','75%'],['0.5','50%'],['0.25','25%']]) +
      label('Bitrate de video') +
      sel('vc-bps',[['3000000','3 Mbps (alta calidad)'],['1500000','1.5 Mbps (media)'],['800000','800 kbps (baja)'],['400000','400 kbps (muy baja)']]) +
      `<div class="btn-row"><button class="btn" id="vc-btn" onclick="ToolFn.compressVid()">🎬 Comprimir</button></div>` +
      `<div id="vc-progress-wrap" style="display:none;margin-top:.7rem">
        <div style="display:flex;justify-content:space-between;font-size:.72rem;color:var(--fg3);font-family:var(--mono);margin-bottom:.3rem">
          <span id="vc-progress-label">Procesando...</span>
          <span id="vc-progress-pct">0%</span>
        </div>
        <div style="background:var(--bg3);border-radius:30px;height:6px;overflow:hidden">
          <div id="vc-progress-bar" style="height:100%;background:linear-gradient(90deg,var(--accent),var(--accent2));border-radius:30px;transition:width .3s;width:0%"></div>
        </div>
      </div>` +
      loader('vc-loader','⏳ procesando video...') +
      `<div id="vc-result" style="margin-top:.7rem"></div>`,

    /* ── AUD COMPRESS ── */
    'aud-compress': () =>
      infoBox('Soporta <b>MP3, WAV, OGG, M4A</b>. Se exporta como WAV (sin pérdida adicional). Bajá el sample rate o pasá a Mono para reducir más el tamaño.') +
      label('Archivo de audio') +
      `<input type="file" id="ac-file" accept="audio/*" onchange="ToolFn.previewAudio()">` +
      `<div id="ac-audio-preview" style="margin:.5rem 0;display:none">
        <audio id="ac-orig-audio" controls style="width:100%;margin-bottom:.3rem"></audio>
        <p id="ac-orig-info" style="font-size:.72rem;color:var(--fg3);font-family:var(--mono)"></p>
      </div>` +
      label('Canales de salida') +
      sel('ac-ch',[['2','Estéreo (2 canales)'],['1','Mono (más liviano, ideal para voz)']]) +
      label('Sample rate de salida') +
      sel('ac-sr',[['44100','44100 Hz (calidad CD, estándar)'],['22050','22050 Hz (más liviano)'],['16000','16000 Hz (voz, muy liviano)'],['8000','8000 Hz (mínimo, solo voz)']]) +
      `<div id="ac-estimate" style="font-size:.75rem;color:var(--fg3);font-family:var(--mono);margin:.5rem 0;min-height:1.2rem"></div>` +
      `<div class="btn-row"><button class="btn" onclick="ToolFn.compressAudio()">🎵 Procesar audio</button></div>` +
      loader('ac-loader','⏳ procesando audio...') +
      `<div id="ac-result" style="margin-top:.7rem"></div>`,

    /* ── PDF TEXT ── */
    'pdf-text': () =>
      infoBox('Funciona con PDFs que tienen <b>texto seleccionable</b>. Los PDFs escaneados (imágenes) no son compatibles.') +
      label('Archivo PDF') +
      `<input type="file" id="pdf-file" accept="application/pdf">` +
      `<div class="btn-row"><button class="btn" onclick="ToolFn.pdfToText()">📄 Extraer texto</button></div>` +
      loader('pdf-loader','⏳ procesando PDF...') +
      `<div class="result-area" id="pdf-result" style="display:none;max-height:260px;overflow-y:auto"></div>` +
      copyRow('pdf-result'),

    /* ── AI SOON ── */
    'ai-soon': () => {
      const s = I18n.get();
      return `<div class="soon-screen">
        <div class="soon-icon">🤖</div>
        <h3>${s.soon}</h3>
        <p>${s.soonDesc}<br><br>Las herramientas de IA con <b>Gemini</b> van a estar disponibles pronto. ¡Volvé a revisar!</p>
      </div>`;
    },

    /* ── AI SUMMARIZE ── */
    'ai-summarize': () =>
      infoBox('Resumí cualquier texto con <b>IA (Gemini)</b>. Pegá el texto o subí un archivo <b>TXT o PDF</b>.') +
      label('Texto') +
      `<textarea id="sum-input" placeholder="Pegá el texto acá..." style="min-height:140px"></textarea>` +
      label('O subí un archivo') +
      `<input type="file" id="sum-file" accept=".txt,.pdf" onchange="ToolFn.sumLoadFile()">` +
      `<div style="display:grid;grid-template-columns:1fr 1fr;gap:.6rem;margin-top:.5rem">` +
        `<div><label style="margin-top:0">Longitud</label>` +
        sel('sum-len', [['corto','Corto (1-2 párrafos)'], ['medio','Medio (3-4 párrafos)'], ['largo','Largo (detallado)']]) +
        `</div>` +
        `<div><label style="margin-top:0">Estilo</label>` +
        sel('sum-style', [['neutro','Neutro'], ['formal','Formal'], ['casual','Casual'], ['bullets','Bullets / viñetas']]) +
        `</div>` +
      `</div>` +
      `<div class="btn-row"><button class="btn" onclick="ToolFn.summarize()">✂️ Resumir</button></div>` +
      loader('sum-loader', '⏳ resumiendo con Gemini...') +
      result('sum-result') + copyRow('sum-result'),

    /* ── AI CORRECT ── */
    'ai-correct': () =>
      infoBox('Corregí ortografía y gramática con <b>IA (Gemini)</b>. El texto corregido aparece abajo con las diferencias marcadas.') +
      label('Texto a corregir') +
      `<textarea id="cor-input" placeholder="Pegá el texto acá..." style="min-height:140px"></textarea>` +
      label('Idioma') +
      sel('cor-lang', [
        ['español','Español'],
        ['inglés','Inglés'],
        ['portugués','Portugués'],
        ['francés','Francés'],
        ['italiano','Italiano'],
        ['alemán','Alemán'],
      ]) +
      `<div class="btn-row"><button class="btn" onclick="ToolFn.correct()">✏️ Corregir</button></div>` +
      loader('cor-loader', '⏳ corrigiendo con Gemini...') +
      result('cor-result') + copyRow('cor-result'),

    /* ── COBALT DL ── */
    'cobalt-dl': () =>
      infoBox('Descargá de <b>YouTube, TikTok, Instagram, Twitter/X, Reddit</b> y más. Motor: <a href="https://cobalt.tools" target="_blank">cobalt.tools</a>. Si falla una URL, probá con otra plataforma.') +
      label('URL del video o post') +
      `<input type="text" id="dl-url" placeholder="https://youtube.com/watch?v=... o link de TikTok, IG, etc">` +
      label('Formato de descarga') +
      sel('dl-fmt',[['mp4','🎬 MP4 — video + audio'],['mp3','🎵 MP3 — solo audio']]) +
      label('Calidad de video (solo MP4)') +
      sel('dl-quality',[['max','Máxima disponible'],['1080','1080p Full HD'],['720','720p HD'],['480','480p'],['360','360p']]) +
      `<div class="btn-row"><button class="btn" id="dl-btn" onclick="ToolFn.cobaltDl()">⬇️ Obtener enlace</button></div>` +
      loader('dl-loader','⏳ contactando cobalt...') +
      `<div id="dl-result" style="margin-top:.7rem"></div>` +
      `<p style="font-size:.7rem;color:var(--fg3);font-family:var(--mono);margin-top:.8rem;line-height:1.5">
        ℹ️ cobalt.tools es un servicio externo. Si el enlace no funciona para una plataforma, puede ser una limitación de su servicio.
      </p>`,

    /* ── QR GEN ── */
    'qr-gen': () =>
      infoBox('Preview en vivo mientras escribís. Personalizá colores y tamaño.') +
      label('Contenido del QR') +
      `<input type="text" id="qr-input" placeholder="https://... o cualquier texto" oninput="ToolFn.liveQR()">` +
      `<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:.6rem;margin-top:.5rem">` +
      `<div><label style="margin-top:0">Tamaño</label>${sel('qr-size',[['150','150px'],['250','250px'],['400','400px']])}</div>` +
      `<div><label style="margin-top:0">Fondo</label><input type="color" id="qr-bg" value="#ffffff" oninput="ToolFn.liveQR()" style="width:100%;height:36px;padding:2px;border-radius:var(--radius-sm);cursor:pointer;border:1.5px solid var(--border)"></div>` +
      `<div><label style="margin-top:0">Color QR</label><input type="color" id="qr-fg" value="#000000" oninput="ToolFn.liveQR()" style="width:100%;height:36px;padding:2px;border-radius:var(--radius-sm);cursor:pointer;border:1.5px solid var(--border)"></div>` +
      `</div>` +
      `<div id="qr-preview-wrap" style="margin:.9rem 0;text-align:center;display:none">
        <img id="qr-live" style="border-radius:10px;border:2px solid var(--border);max-width:180px" alt="QR preview">
      </div>` +
      `<div class="btn-row">
        <button class="btn" onclick="ToolFn.downloadQR()">⬇️ Descargar QR</button>
        <button class="btn btn--sec" onclick="UI.copyText(document.getElementById('qr-input').value,this)">Copiar URL</button>
      </div>`,

    /* ── COLOR CONV ── */
    'color-conv': () =>
      infoBox('Ingresá HEX, RGB o HSL. El selector sincroniza automáticamente.') +
      label('Color') +
      `<div style="display:flex;gap:.5rem;align-items:center">
        <input type="text" id="col-input" placeholder="#ff6ef7  /  rgb(255,110,247)  /  hsl(303,100%,71%)" style="flex:1">
        <input type="color" id="col-picker" value="#ff6ef7" oninput="document.getElementById('col-input').value=this.value;ToolFn.liveColor()" style="width:44px;height:38px;padding:2px;border-radius:8px;cursor:pointer;border:1.5px solid var(--border)">
      </div>` +
      `<div class="color-preview" id="col-preview" style="background:#ff6ef7"></div>` +
      `<div class="btn-row"><button class="btn" onclick="ToolFn.convertColor()">Convertir</button></div>` +
      result('col-result'),

    /* ── CASE CONV ── */
    'case-conv': () =>
      infoBox('Cambiá el case de cualquier texto con un click.') +
      label('Texto') + ta('cc-input','Pegá el texto...') +
      `<div class="btn-row">
        <button class="btn btn--sec" onclick="ToolFn.convertCase(0)">MAYÚSCULAS</button>
        <button class="btn btn--sec" onclick="ToolFn.convertCase(1)">minúsculas</button>
        <button class="btn btn--sec" onclick="ToolFn.convertCase(2)">Título</button>
        <button class="btn btn--sec" onclick="ToolFn.convertCase(3)">aLtErNaDo</button>
        <button class="btn btn--sec" onclick="ToolFn.convertCase(4)">Invertido</button>
      </div>` +
      result('cc-result') + copyRow('cc-result'),

    /* ── WORD COUNT ── */
    'word-count': () =>
      infoBox('Estadísticas en tiempo real.') +
      label('Texto') +
      `<textarea id="wc-input" placeholder="Pegá o escribí el texto..." style="min-height:120px"></textarea>` +
      `<div class="stats-row">
        <div class="stat-chip">Palabras: <b id="wc-w">0</b></div>
        <div class="stat-chip">Chars: <b id="wc-c">0</b></div>
        <div class="stat-chip">Sin espacios: <b id="wc-cs">0</b></div>
        <div class="stat-chip">Líneas: <b id="wc-l">0</b></div>
        <div class="stat-chip">Párrafos: <b id="wc-p">0</b></div>
        <div class="stat-chip">Lectura: <b id="wc-r">0s</b></div>
      </div>`,

    /* ── BASE64 ── */
    'base64': () =>
      infoBox('Codificá texto a Base64 o decodificá Base64 a texto. Útil para desarrollo.') +
      label('Texto') + ta('b64-input','Texto normal o Base64...') +
      `<div class="btn-row">
        <button class="btn" onclick="ToolFn.b64Action('enc')">Codificar → Base64</button>
        <button class="btn btn--sec" onclick="ToolFn.b64Action('dec')">Decodificar ← Base64</button>
      </div>` +
      result('b64-result') + copyRow('b64-result'),

    /* ── HASH GEN ── */
    'hash-gen': () =>
      infoBox('Generá un hash criptográfico de cualquier texto. Útil para verificar integridad.') +
      label('Texto') + ta('hash-input','Texto a hashear...') +
      label('Algoritmo') +
      sel('hash-algo',[['SHA-256','SHA-256 (recomendado)'],['SHA-1','SHA-1'],['SHA-512','SHA-512']]) +
      `<div class="btn-row"><button class="btn" onclick="ToolFn.genHash()">Generar hash</button></div>` +
      `<div class="result-area" id="hash-result" style="display:none;word-break:break-all;font-family:var(--mono);font-size:.78rem"></div>` +
      copyRow('hash-result'),

    /* ── TIMER ── */
    'timer': () =>
      infoBox('Cronómetro con laps. Presioná <b>Lap</b> para registrar una vuelta sin detener el tiempo.') +
      `<div style="font-family:var(--mono);font-size:2.8rem;font-weight:700;text-align:center;margin:1.2rem 0;color:var(--accent);letter-spacing:3px;text-shadow:0 0 20px var(--accent)" id="timer-display">00:00:00.000</div>` +
      `<div class="btn-row" style="justify-content:center">
        <button class="btn" id="timer-start" onclick="ToolFn.timerToggle()">Iniciar</button>
        <button class="btn btn--sec" id="timer-lap" onclick="ToolFn.timerLap()" disabled>Lap</button>
        <button class="btn btn--sec" onclick="ToolFn.timerReset()">Resetear</button>
      </div>` +
      `<div id="timer-laps" style="margin-top:.9rem;max-height:180px;overflow-y:auto"></div>`,

    /* ── UUID GEN ── */
    'uuid-gen': () =>
      infoBox('Un <b>UUID v4</b> es un identificador único universal. Se genera localmente, no se envía a ningún servidor.') +
      `<div class="result-area" id="uuid-out" style="font-family:var(--mono);font-size:.9rem;text-align:center;letter-spacing:1px;word-break:break-all">—</div>` +
      `<div class="btn-row">
        <button class="btn" onclick="ToolFn.genUUID()">Generar UUID</button>
        <button class="btn btn--sec" onclick="ToolFn.genUUIDs()">Generar 5</button>
        <button class="btn btn--sec" onclick="UI.copyText(document.getElementById('uuid-out').textContent,this)">Copiar</button>
      </div>`,

    /* ── MY IP ── */
    'my-ip': () =>
      infoBox('Consultá tu <b>IP pública</b> actual. Esta es la IP que ven los sitios que visitás.') +
      `<div class="btn-row"><button class="btn" onclick="ToolFn.fetchIP()">🌍 Ver mi IP</button></div>` +
      loader('ip-loader','⏳ consultando...') +
      `<div class="result-area" id="ip-result" style="display:none;font-family:var(--mono);font-size:1.4rem;text-align:center;letter-spacing:2px"></div>` +
      copyRow('ip-result'),

    /* ── EXTERNAL LINK ── */
    'external-link': tool =>
      infoBox(tool.desc) +
      `<div class="btn-row"><a href="${tool.url}" target="_blank" rel="noopener" class="btn" style="text-decoration:none">Abrir ↗</a></div>`,
  };

  function build(tool) {
    const builder = BUILDERS[tool.type];
    if (!builder) return `<p style="color:var(--fg3)">${tool.desc}</p>`;
    return builder(tool);
  }

  return { build };
})();

/* ═══════════════════════════════════════════════
   TOOL FUNCTIONS
═══════════════════════════════════════════════ */
const ToolFn = (() => {

  // ── internal helpers ──
  function loadScript(src) {
    return new Promise((res, rej) => {
      if (document.querySelector(`script[src="${src}"]`)) { res(); return; }
      const s = document.createElement('script');
      s.src = src; s.onload = res; s.onerror = rej;
      document.head.appendChild(s);
    });
  }

  function showResult(id, html, isError = false) {
    const el = document.getElementById(id); if (!el) return;
    el.style.display = 'block';
    el.className = 'result-area' + (isError ? ' is-error' : '');
    el.innerHTML = html;
  }

  function showCopyBtn(resultId, getText) {
    const row = document.getElementById(resultId + '-copy'); if (!row) return;
    row.style.display = 'block';
    row.innerHTML = `<button class="btn btn--sec" onclick="UI.copyText((${getText})(),this)">Copiar</button>`;
  }

  function toggleLoader(id, show) {
    document.getElementById(id)?.classList.toggle('show', show);
  }

  function fmtSize(bytes) {
    if (bytes < 1024) return bytes + 'B';
    if (bytes < 1024 * 1024) return (bytes/1024).toFixed(0) + 'KB';
    return (bytes/1024/1024).toFixed(1) + 'MB';
  }

  function fmtDur(sec) {
    const m = Math.floor(sec / 60), s = Math.floor(sec % 60);
    return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  }

  function bufferToWav(buffer) {
    const nCh = buffer.numberOfChannels, sr = buffer.sampleRate, len = buffer.length;
    const out = new Int16Array(len * nCh);
    for (let ch = 0; ch < nCh; ch++) {
      const d = buffer.getChannelData(ch);
      for (let i = 0; i < len; i++) out[i * nCh + ch] = Math.max(-1, Math.min(1, d[i])) * 0x7FFF;
    }
    const buf = new ArrayBuffer(44 + out.byteLength), v = new DataView(buf);
    const ws = (o, c) => { for (let i = 0; i < c.length; i++) v.setUint8(o+i, c.charCodeAt(i)); };
    ws(0,'RIFF'); v.setUint32(4, 36+out.byteLength, true); ws(8,'WAVE'); ws(12,'fmt ');
    v.setUint32(16,16,true); v.setUint16(20,1,true); v.setUint16(22,nCh,true);
    v.setUint32(24,sr,true); v.setUint32(28,sr*nCh*2,true); v.setUint16(32,nCh*2,true);
    v.setUint16(34,16,true); ws(36,'data'); v.setUint32(40,out.byteLength,true);
    new Int16Array(buf,44).set(out);
    return new Blob([buf], { type:'audio/wav' });
  }

  // ── img compress ──
  let _origFile = null;
  let _qrDebounce = null;

  function previewImg() {
    const f = document.getElementById('ic-file').files[0]; if (!f) return;
    _origFile = f;
    const url = URL.createObjectURL(f);
    const before = document.getElementById('ic-before');
    before.src = url;
    document.getElementById('ic-before-size').textContent = fmtSize(f.size);
    document.getElementById('ic-after').style.opacity = '.4';
    document.getElementById('ic-after-size').textContent = '— ajustá la calidad';
    document.getElementById('ic-reduction').textContent = '';
    document.getElementById('ic-previews').style.display = 'block';
    // trigger live preview
    _doLiveCompress();
  }

  function onQualityChange() {
    document.getElementById('ic-ql').textContent = document.getElementById('ic-q').value;
    _doLiveCompress();
  }

  function _doLiveCompress() {
    if (!_origFile) return;
    const q = document.getElementById('ic-q').value / 100;
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = img.width; c.height = img.height;
      c.getContext('2d').drawImage(img, 0, 0);
      c.toBlob(blob => {
        const href = URL.createObjectURL(blob);
        const after = document.getElementById('ic-after');
        after.src = href;
        after.style.opacity = '1';
        const pct = Math.round((1 - blob.size / _origFile.size) * 100);
        document.getElementById('ic-after-size').textContent = fmtSize(blob.size);
        const red = document.getElementById('ic-reduction');
        if (pct > 0) {
          red.textContent = `✅ Reducción estimada: ${pct}%`;
          red.style.color = 'var(--accent)';
        } else {
          red.textContent = `⚠️ Sin reducción a esta calidad`;
          red.style.color = 'var(--fg3)';
        }
      }, 'image/jpeg', q);
    };
    img.src = URL.createObjectURL(_origFile);
  }

  function compressImg() {
    if (!_origFile) return;
    const q = document.getElementById('ic-q').value / 100;
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = img.width; c.height = img.height;
      c.getContext('2d').drawImage(img, 0, 0);
      c.toBlob(blob => {
        const href = URL.createObjectURL(blob);
        const pct = Math.round((1 - blob.size / _origFile.size) * 100);
        showResult('ic-result',
          `✅ ${fmtSize(_origFile.size)} → ${fmtSize(blob.size)} ${pct > 0 ? '<b style="color:var(--accent)">(-'+pct+'%)</b>' : ''}\n` +
          `<a href="${href}" download="taro-compressed.jpg" class="dl-link">⬇️ Descargar imagen</a>`
        );
        Audio.success();
      }, 'image/jpeg', q);
    };
    img.src = URL.createObjectURL(_origFile);
  }

  // ── img convert ──
  function previewConvertFiles() {
    const files = document.getElementById('cv-file').files;
    const wrap = document.getElementById('cv-previews');
    wrap.innerHTML = '';
    Array.from(files).forEach(f => {
      const img = document.createElement('img');
      img.src = URL.createObjectURL(f);
      img.style.cssText = 'width:60px;height:60px;object-fit:cover;border-radius:6px;border:1.5px solid var(--border)';
      img.title = f.name;
      wrap.appendChild(img);
    });
  }

  function convertImg() {
    const files = document.getElementById('cv-file').files;
    const fmt = document.getElementById('cv-fmt').value;
    if (!files.length) return;
    const ext = fmt === 'image/jpeg' ? 'jpg' : fmt.split('/')[1];
    const res = document.getElementById('cv-result');
    res.innerHTML = `<p style="font-size:.78rem;color:var(--fg3);font-family:var(--mono);margin-bottom:.5rem">Listo — ${files.length} archivo(s):</p>`;
    Array.from(files).forEach(f => {
      const img = new Image();
      img.onload = () => {
        const c = document.createElement('canvas');
        c.width = img.width; c.height = img.height;
        c.getContext('2d').drawImage(img, 0, 0);
        c.toBlob(blob => {
          const name = f.name.replace(/\.[^.]+$/, '.' + ext);
          const a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = name;
          a.className = 'dl-link';
          a.style.cssText = 'margin:.25rem .25rem 0 0;display:inline-block';
          a.textContent = `⬇️ ${name}`;
          res.appendChild(a);
          Audio.success();
        }, fmt);
      };
      img.src = URL.createObjectURL(f);
    });
  }

  // ── img pdf ──
  function previewPdfFiles() {
    const files = document.getElementById('ipdf-file').files;
    const wrap = document.getElementById('ipdf-previews');
    wrap.innerHTML = '';
    Array.from(files).forEach((f, i) => {
      const div = document.createElement('div');
      div.style.cssText = 'position:relative;display:inline-block';
      const img = document.createElement('img');
      img.src = URL.createObjectURL(f);
      img.style.cssText = 'width:60px;height:60px;object-fit:cover;border-radius:6px;border:1.5px solid var(--border)';
      const num = document.createElement('span');
      num.textContent = i + 1;
      num.style.cssText = 'position:absolute;bottom:2px;right:4px;font-size:.62rem;font-family:var(--mono);color:#fff;text-shadow:0 0 3px #000';
      div.appendChild(img); div.appendChild(num);
      wrap.appendChild(div);
    });
  }

  async function imgToPdf() {
    const files = document.getElementById('ipdf-file').files; if (!files.length) return;
    toggleLoader('ipdf-loader', true);
    try {
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF(); let first = true;
      for (const f of Array.from(files)) {
        await new Promise(resolve => {
          const img = new Image();
          img.onload = () => {
            const pw = pdf.internal.pageSize.getWidth(), ph = pdf.internal.pageSize.getHeight();
            const ratio = Math.min(pw/img.width, ph/img.height);
            const w = img.width*ratio, h = img.height*ratio;
            if (!first) pdf.addPage(); first = false;
            const c = document.createElement('canvas');
            c.width = img.width; c.height = img.height;
            c.getContext('2d').drawImage(img, 0, 0);
            pdf.addImage(c.toDataURL('image/jpeg',.85),'JPEG',(pw-w)/2,(ph-h)/2,w,h);
            resolve();
          };
          img.src = URL.createObjectURL(f);
        });
      }
      toggleLoader('ipdf-loader', false);
      const blob = pdf.output('blob'), href = URL.createObjectURL(blob);
      document.getElementById('ipdf-result').innerHTML =
        `✅ PDF con ${files.length} página(s)<br><a href="${href}" download="taro-tools.pdf" class="dl-link">⬇️ Descargar PDF</a>`;
      Audio.success();
    } catch(e) {
      toggleLoader('ipdf-loader', false);
      document.getElementById('ipdf-result').innerHTML = `<span style="color:#ff8899">Error: ${e.message}</span>`;
      Audio.error();
    }
  }

  // ── video preview & compress ──
  function previewVideo() {
    const f = document.getElementById('vc-file').files[0]; if (!f) return;
    const video = document.getElementById('vc-orig-video');
    video.src = URL.createObjectURL(f);
    document.getElementById('vc-video-preview').style.display = 'block';
    video.onloadedmetadata = () => {
      document.getElementById('vc-orig-info').textContent =
        `${fmtSize(f.size)} · ${video.videoWidth}×${video.videoHeight} · ${fmtDur(video.duration)}`;
    };
  }

  async function compressVid() {
    const f = document.getElementById('vc-file').files[0]; if (!f) return;
    const btn = document.getElementById('vc-btn');
    btn.disabled = true; btn.textContent = 'Procesando...';
    toggleLoader('vc-loader', true);
    document.getElementById('vc-progress-wrap').style.display = 'block';
    document.getElementById('vc-result').innerHTML = '';

    try {
      const scale = parseFloat(document.getElementById('vc-scale').value);
      const bps   = parseInt(document.getElementById('vc-bps').value);
      const video = document.createElement('video');
      video.src = URL.createObjectURL(f); video.muted = true;
      await new Promise(r => { video.onloadedmetadata = r; });

      const totalDur = video.duration;
      const canvas = document.createElement('canvas');
      canvas.width  = Math.round(video.videoWidth  * scale);
      canvas.height = Math.round(video.videoHeight * scale);
      const ctx = canvas.getContext('2d');
      const mime = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9' : 'video/webm;codecs=vp8';
      const stream = canvas.captureStream(30);
      const rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: bps });
      const chunks = [];
      rec.ondataavailable = e => e.data.size > 0 && chunks.push(e.data);

      // progress via currentTime
      const progressInterval = setInterval(() => {
        if (!totalDur) return;
        const pct = Math.min(Math.round((video.currentTime / totalDur) * 100), 99);
        document.getElementById('vc-progress-bar').style.width = pct + '%';
        document.getElementById('vc-progress-pct').textContent = pct + '%';
        document.getElementById('vc-progress-label').textContent =
          `${fmtDur(video.currentTime)} / ${fmtDur(totalDur)}`;
      }, 300);

      rec.onstop = () => {
        clearInterval(progressInterval);
        document.getElementById('vc-progress-bar').style.width = '100%';
        document.getElementById('vc-progress-pct').textContent = '100%';
        const blob = new Blob(chunks, { type:'video/webm' });
        toggleLoader('vc-loader', false);
        const pct = Math.round((1 - blob.size / f.size) * 100);
        document.getElementById('vc-result').innerHTML =
          `✅ ${fmtSize(f.size)} → ${fmtSize(blob.size)} ${pct > 0 ? '<b style="color:var(--accent)">(-'+pct+'%)</b>' : ''}<br>` +
          `<small style="color:var(--fg3)">${canvas.width}×${canvas.height} · WEBM</small><br>` +
          `<a href="${URL.createObjectURL(blob)}" download="taro-compressed.webm" class="dl-link">⬇️ Descargar .WEBM</a>`;
        btn.disabled = false; btn.textContent = '🎬 Comprimir';
        Audio.success();
      };

      rec.start(200);
      video.currentTime = 0; await video.play();
      const draw = () => {
        if (video.ended || video.paused) { rec.stop(); return; }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        requestAnimationFrame(draw);
      };
      draw(); video.onended = () => rec.stop();
    } catch(e) {
      toggleLoader('vc-loader', false);
      document.getElementById('vc-result').innerHTML = `<span style="color:#ff8899">Error: ${e.message}</span>`;
      const btn2 = document.getElementById('vc-btn');
      if (btn2) { btn2.disabled = false; btn2.textContent = '🎬 Comprimir'; }
      Audio.error();
    }
  }

  // ── audio preview & compress ──
  function previewAudio() {
    const f = document.getElementById('ac-file').files[0]; if (!f) return;
    const audio = document.getElementById('ac-orig-audio');
    audio.src = URL.createObjectURL(f);
    document.getElementById('ac-audio-preview').style.display = 'block';
    audio.onloadedmetadata = () => {
      document.getElementById('ac-orig-info').textContent =
        `${fmtSize(f.size)} · ${fmtDur(audio.duration)}`;
      _updateAudioEstimate(f);
    };
    // update estimate on setting changes
    ['ac-ch','ac-sr'].forEach(id => {
      document.getElementById(id).addEventListener('change', () => _updateAudioEstimate(f));
    });
  }

  function _updateAudioEstimate(origFile) {
    const audio = document.getElementById('ac-orig-audio');
    if (!audio.duration) return;
    const ch = parseInt(document.getElementById('ac-ch').value);
    const sr = parseInt(document.getElementById('ac-sr').value);
    const estimatedBytes = audio.duration * sr * ch * 2; // 16-bit WAV
    const el = document.getElementById('ac-estimate');
    if (el) {
      el.textContent = `Tamaño estimado del WAV: ~${fmtSize(estimatedBytes)}`;
    }
  }

  async function compressAudio() {
    const f = document.getElementById('ac-file').files[0]; if (!f) return;
    toggleLoader('ac-loader', true);
    try {
      const targetCh = parseInt(document.getElementById('ac-ch').value);
      const targetSr = parseInt(document.getElementById('ac-sr').value);
      const ab = await f.arrayBuffer();
      const ac2 = new AudioContext();
      const decoded = await ac2.decodeAudioData(ab);
      const offCtx = new OfflineAudioContext(
        targetCh,
        Math.ceil(decoded.length * (targetSr / decoded.sampleRate)),
        targetSr
      );
      const src = offCtx.createBufferSource();
      src.buffer = decoded; src.connect(offCtx.destination); src.start();
      const rendered = await offCtx.startRendering();
      const wav = bufferToWav(rendered);
      toggleLoader('ac-loader', false);
      const pct = Math.round((1 - wav.size / f.size) * 100);
      document.getElementById('ac-result').innerHTML =
        `✅ ${fmtSize(f.size)} → ${fmtSize(wav.size)} ${pct > 0 ? '<b style="color:var(--accent)">(-'+pct+'%)</b>' : ''}<br>` +
        `<small style="color:var(--fg3)">${targetCh === 1 ? 'Mono':'Estéreo'} · ${targetSr}Hz · WAV</small><br>` +
        `<a href="${URL.createObjectURL(wav)}" download="taro-audio.wav" class="dl-link">⬇️ Descargar .WAV</a>`;
      Audio.success();
    } catch(e) {
      toggleLoader('ac-loader', false);
      document.getElementById('ac-result').innerHTML = `<span style="color:#ff8899">Error: ${e.message}</span>`;
      Audio.error();
    }
  }

  // ── pdf to text ──
  async function pdfToText() {
    const f = document.getElementById('pdf-file').files[0]; if (!f) return;
    toggleLoader('pdf-loader', true);
    const result = document.getElementById('pdf-result'); result.style.display = 'none';
    try {
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js');
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      const pdf = await pdfjsLib.getDocument({ data: await f.arrayBuffer() }).promise;
      let text = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const pg = await pdf.getPage(i);
        const ct = await pg.getTextContent();
        text += ct.items.map(s => s.str).join(' ') + '\n\n';
      }
      toggleLoader('pdf-loader', false);
      result.style.display = 'block';
      result.textContent = text.trim() || 'No se encontró texto (puede ser un PDF escaneado).';
      showCopyBtn('pdf-result', `() => document.getElementById('pdf-result').textContent`);
      Audio.success();
    } catch(e) {
      toggleLoader('pdf-loader', false);
      result.style.display = 'block'; result.className = 'result-area is-error';
      result.textContent = 'Error: ' + e.message; Audio.error();
    }
  }

  // ── cobalt ──
  async function cobaltDl() {
    const url = document.getElementById('dl-url').value.trim(); if (!url) return;
    const fmt     = document.getElementById('dl-fmt').value;
    const quality = document.getElementById('dl-quality').value;
    const btn = document.getElementById('dl-btn');
    btn.disabled = true; btn.textContent = 'Procesando...';
    toggleLoader('dl-loader', true);
    const res = document.getElementById('dl-result'); res.innerHTML = '';
    try {
      const body = { url, downloadMode: fmt === 'mp3' ? 'audio' : 'auto' };
      if (quality !== 'max' && fmt !== 'mp3') body.videoQuality = quality;
      const r = await fetch(CONFIG.COBALT_API, {
        method: 'POST',
        headers: { 'Content-Type':'application/json', 'Accept':'application/json' },
        body: JSON.stringify(body),
      });
      const data = await r.json();
      toggleLoader('dl-loader', false);
      btn.disabled = false; btn.textContent = '⬇️ Obtener enlace';
      if (data.url) {
        res.innerHTML =
          `✅ Enlace generado correctamente<br>` +
          `<a href="${data.url}" target="_blank" class="dl-link">⬇️ Descargar ${fmt.toUpperCase()}</a><br>` +
          `<small style="color:var(--fg3);font-size:.7rem;margin-top:.3rem;display:block">
            Si no descarga automáticamente → click derecho sobre el botón → "Guardar enlace como"
          </small>`;
        Audio.success();
      } else if (data.status === 'picker') {
        res.innerHTML =
          `✅ Se encontraron múltiples archivos:<br>` +
          data.picker.map((p,i) =>
            `<a href="${p.url}" target="_blank" class="dl-link" style="margin:.25rem .25rem 0 0">⬇️ Archivo ${i+1}</a>`
          ).join('');
        Audio.success();
      } else {
        res.innerHTML =
          `<span style="color:#ff8899">⚠️ ${data.text || 'No se pudo procesar esta URL.'}</span><br>` +
          `<small style="color:var(--fg3);font-size:.7rem">Probá con otra plataforma o verificá que la URL sea correcta.</small>`;
        Audio.error();
      }
    } catch(e) {
      toggleLoader('dl-loader', false);
      btn.disabled = false; btn.textContent = '⬇️ Obtener enlace';
      res.innerHTML =
        `<span style="color:#ff8899">⚠️ Error de conexión: ${e.message}</span><br>` +
        `<small style="color:var(--fg3);font-size:.7rem">Verificá tu conexión e intentá de nuevo.</small>`;
      Audio.error();
    }
  }

  // ── QR ──
  function liveQR() {
    clearTimeout(_qrDebounce);
    _qrDebounce = setTimeout(() => {
      const txt  = document.getElementById('qr-input').value.trim(); if (!txt) return;
      const size = document.getElementById('qr-size').value;
      const bg   = document.getElementById('qr-bg').value.replace('#','');
      const fg   = document.getElementById('qr-fg').value.replace('#','');
      const url  = `${CONFIG.QR_API}?size=${size}x${size}&data=${encodeURIComponent(txt)}&bgcolor=${bg}&color=${fg}&margin=10`;
      const wrap = document.getElementById('qr-preview-wrap');
      wrap.style.display = 'block';
      document.getElementById('qr-live').src = url;
    }, 400);
  }

  function downloadQR() {
    const txt = document.getElementById('qr-input').value.trim(); if (!txt) return;
    const size = document.getElementById('qr-size').value;
    const bg   = document.getElementById('qr-bg').value.replace('#','');
    const fg   = document.getElementById('qr-fg').value.replace('#','');
    const url  = `${CONFIG.QR_API}?size=${size}x${size}&data=${encodeURIComponent(txt)}&bgcolor=${bg}&color=${fg}&margin=10`;
    const a = document.createElement('a');
    a.href = url; a.download = 'taro-qr.png'; a.target = '_blank';
    a.click(); Audio.success();
  }

  // ── color conv ──
  function liveColor() {
    const raw = document.getElementById('col-input').value.trim();
    try {
      let r, g, b;
      if (raw.startsWith('#')) { const h = raw.slice(1); r=parseInt(h.slice(0,2),16); g=parseInt(h.slice(2,4),16); b=parseInt(h.slice(4,6),16); }
      else if (raw.startsWith('rgb')) { [r,g,b] = raw.match(/\d+/g).map(Number); }
      if (!isNaN(r)) document.getElementById('col-preview').style.background = `rgb(${r},${g},${b})`;
    } catch(e) {}
  }

  function convertColor() {
    const raw = document.getElementById('col-input').value.trim(); if (!raw) return;
    try {
      let r, g, b;
      if (raw.startsWith('#')) {
        const h = raw.slice(1).padEnd(6,'0');
        r=parseInt(h.slice(0,2),16); g=parseInt(h.slice(2,4),16); b=parseInt(h.slice(4,6),16);
      } else if (raw.startsWith('rgb')) {
        [r,g,b] = raw.match(/\d+/g).map(Number);
      } else if (raw.startsWith('hsl')) {
        let [hh,ss,ll] = raw.match(/[\d.]+/g).map(Number); ss/=100; ll/=100;
        const c=(1-Math.abs(2*ll-1))*ss, x=c*(1-Math.abs((hh/60)%2-1)), m=ll-c/2;
        let rr=0,gg=0,bb=0;
        if(hh<60){rr=c;gg=x;}else if(hh<120){rr=x;gg=c;}else if(hh<180){gg=c;bb=x;}
        else if(hh<240){gg=x;bb=c;}else if(hh<300){rr=x;bb=c;}else{rr=c;bb=x;}
        r=Math.round((rr+m)*255); g=Math.round((gg+m)*255); b=Math.round((bb+m)*255);
      } else { showResult('col-result','Formato no reconocido. Usá #hex, rgb() o hsl()',true); return; }
      const rn=r/255,gn=g/255,bn=b/255;
      const max=Math.max(rn,gn,bn),min=Math.min(rn,gn,bn);
      let h2=0,s2=0,l2=(max+min)/2;
      if(max!==min){const d=max-min;s2=l2>.5?d/(2-max-min):d/(max+min);
        h2=max===rn?(gn-bn)/d+(gn<bn?6:0):max===gn?(bn-rn)/d+2:(rn-gn)/d+4;h2=Math.round(h2*60);}
      const hex='#'+[r,g,b].map(v=>v.toString(16).padStart(2,'0')).join('');
      document.getElementById('col-preview').style.background = hex;
      const hsl=`hsl(${h2}, ${Math.round(s2*100)}%, ${Math.round(l2*100)}%)`;
      const rgb=`rgb(${r}, ${g}, ${b})`;
      document.getElementById('col-result').style.display = 'block';
      document.getElementById('col-result').className = 'result-area';
      document.getElementById('col-result').innerHTML =
        `<b>HEX:</b> ${hex} <button class="copy-btn" onclick="UI.copyText('${hex}',this)">copiar</button>\n` +
        `<b>RGB:</b> ${rgb} <button class="copy-btn" onclick="UI.copyText('${rgb}',this)">copiar</button>\n` +
        `<b>HSL:</b> ${hsl} <button class="copy-btn" onclick="UI.copyText('${hsl}',this)">copiar</button>`;
      Audio.success();
    } catch(e) { showResult('col-result','Error al parsear. Revisá el formato.',true); Audio.error(); }
  }

  // ── case conv ──
  function convertCase(mode) {
    const txt = document.getElementById('cc-input').value; if (!txt) return;
    const transforms = [
      t => t.toUpperCase(),
      t => t.toLowerCase(),
      t => t.replace(/\w\S*/g, w => w[0].toUpperCase() + w.slice(1).toLowerCase()),
      t => t.split('').map((c,i) => i%2===0 ? c.toLowerCase() : c.toUpperCase()).join(''),
      t => t.split('').map(c => c===c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()).join(''),
    ];
    showResult('cc-result','');
    document.getElementById('cc-result').textContent = transforms[mode](txt);
    showCopyBtn('cc-result', `() => document.getElementById('cc-result').textContent`);
    Audio.success();
  }

  // ── word count ──
  function updateWC() {
    const txt = document.getElementById('wc-input').value;
    const words = txt.trim() ? txt.trim().split(/\s+/).length : 0;
    const readSec = Math.ceil(words / 3.5);
    document.getElementById('wc-w').textContent  = words;
    document.getElementById('wc-c').textContent  = txt.length;
    document.getElementById('wc-cs').textContent = txt.replace(/\s/g,'').length;
    document.getElementById('wc-l').textContent  = txt ? txt.split('\n').length : 0;
    document.getElementById('wc-p').textContent  = txt.trim() ? txt.trim().split(/\n\s*\n/).length : 0;
    document.getElementById('wc-r').textContent  = readSec < 60 ? readSec+'s' : Math.ceil(readSec/60)+'min';
  }

  // ── base64 ──
  function b64Action(mode) {
    const txt = document.getElementById('b64-input').value; if (!txt) return;
    try {
      const out = mode==='enc' ? btoa(unescape(encodeURIComponent(txt))) : decodeURIComponent(escape(atob(txt)));
      showResult('b64-result','');
      document.getElementById('b64-result').textContent = out;
      showCopyBtn('b64-result', `() => document.getElementById('b64-result').textContent`);
      Audio.success();
    } catch(e) { showResult('b64-result','Error: texto inválido para decodificar',true); Audio.error(); }
  }

  // ── hash ──
  async function genHash() {
    const txt = document.getElementById('hash-input').value; if (!txt) return;
    const algo = document.getElementById('hash-algo').value;
    const buf  = await crypto.subtle.digest(algo, new TextEncoder().encode(txt));
    const hash = Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
    document.getElementById('hash-result').style.display = 'block';
    document.getElementById('hash-result').textContent = hash;
    showCopyBtn('hash-result', `() => document.getElementById('hash-result').textContent`);
    Audio.success();
  }

  // ── timer with laps ──
  let timerInterval = null, timerMs = 0, timerRunning = false, lapCount = 0;
  let lastLapMs = 0;

  function timerToggle() {
    const btn = document.getElementById('timer-start');
    const lapBtn = document.getElementById('timer-lap');
    if (!btn) return;
    if (!timerRunning) {
      timerRunning = true;
      const start = Date.now() - timerMs;
      timerInterval = setInterval(() => { timerMs = Date.now() - start; _updateTimerDisplay(); }, 13);
      btn.textContent = 'Detener'; btn.style.background = 'var(--accent2)';
      if (lapBtn) lapBtn.disabled = false;
    } else {
      clearInterval(timerInterval); timerRunning = false;
      btn.textContent = 'Continuar'; btn.style.background = '';
      if (lapBtn) lapBtn.disabled = true;
    }
  }

  function timerLap() {
    if (!timerRunning) return;
    lapCount++;
    const lapTime = timerMs - lastLapMs;
    lastLapMs = timerMs;
    const lapsEl = document.getElementById('timer-laps'); if (!lapsEl) return;
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;justify-content:space-between;padding:.3rem .5rem;border-bottom:1px solid var(--border);font-family:var(--mono);font-size:.78rem;color:var(--fg2)';
    row.innerHTML = `<span>Lap ${lapCount}</span><span style="color:var(--fg3)">${_msToStr(lapTime)}</span><span style="color:var(--accent)">${_msToStr(timerMs)}</span>`;
    lapsEl.prepend(row);
    Audio.click();
  }

  function timerReset() {
    clearInterval(timerInterval); timerRunning = false; timerMs = 0; lapCount = 0; lastLapMs = 0;
    _updateTimerDisplay();
    const btn = document.getElementById('timer-start');
    const lapBtn = document.getElementById('timer-lap');
    if (btn) { btn.textContent = 'Iniciar'; btn.style.background = ''; }
    if (lapBtn) lapBtn.disabled = true;
    const lapsEl = document.getElementById('timer-laps');
    if (lapsEl) lapsEl.innerHTML = '';
  }

  function _msToStr(ms) {
    const mil=ms%1000, s=Math.floor(ms/1000)%60, m=Math.floor(ms/60000)%60, h=Math.floor(ms/3600000);
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}.${String(mil).padStart(3,'0')}`;
  }

  function _updateTimerDisplay() {
    const d = document.getElementById('timer-display');
    if (d) d.textContent = _msToStr(timerMs);
  }

  // ── uuid ──
  function _uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random()*16|0;
      return (c==='x' ? r : r&0x3|0x8).toString(16);
    });
  }
  function genUUID()  { document.getElementById('uuid-out').textContent = _uuid(); Audio.success(); }
  function genUUIDs() { document.getElementById('uuid-out').textContent = Array.from({length:5},_uuid).join('\n'); Audio.success(); }

  // ── ip ──
  async function fetchIP() {
    toggleLoader('ip-loader', true);
    const res = document.getElementById('ip-result'); res.style.display = 'none';
    try {
      const d = await (await fetch(CONFIG.IP_API)).json();
      toggleLoader('ip-loader', false);
      res.style.display = 'block'; res.textContent = d.ip;
      showCopyBtn('ip-result', `() => document.getElementById('ip-result').textContent`);
      Audio.success();
    } catch(e) {
      toggleLoader('ip-loader', false);
      res.style.display = 'block'; res.className = 'result-area is-error';
      res.textContent = 'Error al consultar IP'; Audio.error();
    }
  }

  // ── ai summarize ──
  async function sumLoadFile() {
    const file = document.getElementById('sum-file').files[0];
    if (!file) return;
    const ta = document.getElementById('sum-input');
    if (file.type === 'text/plain') { ta.value = await file.text(); return; }
    if (file.type === 'application/pdf') {
      try {
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js');
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        const buf = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
        let text = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const ct = await page.getTextContent();
          text += ct.items.map(it => it.str).join(' ') + '\n';
        }
        ta.value = text.trim();
      } catch(e) { showResult('sum-result', 'Error al leer el PDF: ' + e.message, true); Audio.error(); }
      return;
    }
    showResult('sum-result', 'Formato no soportado. Usá TXT o PDF.', true); Audio.error();
  }

  async function summarize() {
    const text = document.getElementById('sum-input').value.trim();
    if (!text) { Audio.error(); return; }
    const len   = document.getElementById('sum-len').value;
    const style = document.getElementById('sum-style').value;
    const lenMap   = { corto: '1 o 2 párrafos cortos', medio: '3 o 4 párrafos', largo: 'un resumen detallado y extenso' };
    const styleMap = { neutro: 'en tono neutro y objetivo', formal: 'en tono formal y profesional', casual: 'en tono casual y accesible', bullets: 'como una lista de viñetas con los puntos clave' };
    const prompt = `Resumí el siguiente texto en ${lenMap[len]}, ${styleMap[style]}. Respondé solo con el resumen, sin comentarios extra.\n\n---\n${text}`;
    toggleLoader('sum-loader', true);
    document.getElementById('sum-result').style.display = 'none';
    document.getElementById('sum-result-copy').style.display = 'none';
    try {
      const res = await fetch(CONFIG.GEMINI_PROXY, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: CONFIG.GEMINI_MODEL, contents: [{ parts: [{ text: prompt }] }] }),
      });
      const data = await res.json();
      toggleLoader('sum-loader', false);
      if (!res.ok) throw new Error(data.error || 'Error del servidor');
      const output = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!output) throw new Error('Respuesta vacía de Gemini');
      const html = output.split('\n').filter(l => l.trim()).map(l => `<p style="margin:.4rem 0;line-height:1.6">${l}</p>`).join('');
      showResult('sum-result', html);
      showCopyBtn('sum-result', `() => document.getElementById('sum-result').innerText`);
      Audio.success();
    } catch(e) {
      toggleLoader('sum-loader', false);
      showResult('sum-result', '❌ ' + e.message, true); Audio.error();
    }
  }

  // ── ai correct ──
  async function correct() {
    const text = document.getElementById('cor-input').value.trim();
    if (!text) { Audio.error(); return; }
    const lang = document.getElementById('cor-lang').value;

    const prompt = `Corregí el siguiente texto en ${lang}. Corregí solo errores de ortografía y gramática, sin cambiar el estilo ni el significado. Respondé únicamente con el texto corregido, sin explicaciones ni comentarios.\n\n---\n${text}`;

    toggleLoader('cor-loader', true);
    document.getElementById('cor-result').style.display = 'none';
    document.getElementById('cor-result-copy').style.display = 'none';

    try {
      const res = await fetch(CONFIG.GEMINI_PROXY, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: CONFIG.GEMINI_MODEL, contents: [{ parts: [{ text: prompt }] }] }),
      });
      const data = await res.json();
      toggleLoader('cor-loader', false);
      if (!res.ok) throw new Error(data.error || 'Error del servidor');
      const output = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!output) throw new Error('Respuesta vacía de Gemini');

      // Diff visual: marcar palabras que cambiaron
      const originalWords = text.split(/\s+/);
      const correctedWords = output.trim().split(/\s+/);
      const maxLen = Math.max(originalWords.length, correctedWords.length);
      let diffHtml = '';
      for (let i = 0; i < maxLen; i++) {
        const orig = originalWords[i] || '';
        const corr = correctedWords[i] || '';
        if (orig !== corr) {
          diffHtml += `<mark style="background:var(--accent);color:#000;border-radius:3px;padding:0 2px">${corr}</mark> `;
        } else {
          diffHtml += corr + ' ';
        }
      }

      const changedCount = originalWords.filter((w, i) => w !== (correctedWords[i] || '')).length;
      const summary = changedCount === 0
        ? `<p style="font-size:.75rem;color:var(--fg3);font-family:var(--mono);margin-bottom:.6rem">✅ Sin errores encontrados</p>`
        : `<p style="font-size:.75rem;color:var(--fg3);font-family:var(--mono);margin-bottom:.6rem">✦ ${changedCount} corrección${changedCount > 1 ? 'es' : ''} marcada${changedCount > 1 ? 's' : ''} en <span style="background:var(--accent);color:#000;border-radius:3px;padding:0 2px">amarillo</span></p>`;

      showResult('cor-result', summary + `<div style="line-height:1.8">${diffHtml.trim()}</div>`);
      showCopyBtn('cor-result', `() => document.getElementById('cor-result').innerText.split('\\n').slice(1).join('\\n').trim()`);
      Audio.success();
    } catch(e) {
      toggleLoader('cor-loader', false);
      showResult('cor-result', '❌ ' + e.message, true); Audio.error();
    }
  }

  return {
    previewImg, onQualityChange, compressImg,
    previewConvertFiles, convertImg,
    previewPdfFiles, imgToPdf,
    previewVideo, compressVid,
    previewAudio, compressAudio,
    pdfToText, cobaltDl,
    liveQR, downloadQR,
    liveColor, convertColor,
    convertCase, updateWC,
    b64Action, genHash,
    timerToggle, timerLap, timerReset,
    genUUID, genUUIDs, fetchIP,
    sumLoadFile, summarize,
    correct,
  };
})();

/* ═══════════════════════════════════════════════
   ADMIN MODULE
═══════════════════════════════════════════════ */
const Admin = (() => {
  let unlocked = false;
  let tab = 'tools';
  let extra  = JSON.parse(localStorage.getItem('tt-extra')  || '[]');
  let hidden = JSON.parse(localStorage.getItem('tt-hidden') || '[]');
  let passBuf = '';
  const PASS_LEN = 11;

  async function sha256(str) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
    return [...new Uint8Array(buf)].map(x => x.toString(16).padStart(2, '0')).join('');
  }

  // ── secret password listener ──
  document.addEventListener('keydown', e => {
    if (['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)) return;
    passBuf = (passBuf + e.key).slice(-PASS_LEN);
    sha256(passBuf).then(hash => {
      if (hash === CONFIG.ADMIN_PASS_HASH) {
        if (!unlocked) {
          unlocked = true; Audio.unlock();
          UI.showToast(I18n.get().toast.unlocked);
          setTimeout(() => { renderPanel(); document.getElementById('admin-modal').classList.add('open'); }, 400);
        } else {
          renderPanel();
          document.getElementById('admin-modal').classList.add('open');
        }
        passBuf = '';
      }
    });
  });

  function isUnlocked() { return unlocked; }
  function getExtra()   { return extra; }
  function getHidden()  { return hidden; }
  function saveExtra()  { localStorage.setItem('tt-extra',  JSON.stringify(extra)); }
  function saveHidden() { localStorage.setItem('tt-hidden', JSON.stringify(hidden)); }

  function switchTab(t) {
    tab = t; Audio.click();
    ['tools','add'].forEach(x =>
      document.getElementById('atab-'+x).classList.toggle('active', x === t)
    );
    renderBody();
  }

  function renderPanel() {
    const s = I18n.get();
    document.getElementById('admin-title').textContent = s.adminTitle;
    document.getElementById('at-tl').textContent = s.atTools;
    document.getElementById('at-al').textContent = s.atAdd;
    renderBody();
  }

  function renderBody() {
    const s = I18n.get();
    const body = document.getElementById('admin-body');

    if (tab === 'tools') {
      // built-in tools management + extra tools
      const allBase = I18n.getTools();
      const baseHTML = allBase.map(t => {
        const isHidden = hidden.includes(t.id);
        return `<div class="tool-item" style="${isHidden ? 'opacity:.5' : ''}">
          <span style="font-size:1rem">${t.icon}</span>
          <span class="tool-item__name">${t.name} ${t.soon ? '<span style="font-size:.6rem;color:var(--accent2);font-family:var(--mono)">soon</span>' : ''}</span>
          <div style="display:flex;gap:.3rem">
            <button class="tool-item__btn" onclick="Admin.toggleHide('${t.id}')">
              ${isHidden ? s.showBtn : s.hideBtn}
            </button>
          </div>
        </div>`;
      }).join('');

      const extraHTML = extra.length
        ? extra.map((t, i) => `
          <div class="tool-item" id="ti-${i}">
            <span style="font-size:1rem">${t.icon}</span>
            <span class="tool-item__name">${t.name}</span>
            <div style="display:flex;gap:.3rem">
              <button class="tool-item__btn" onclick="Admin.moveUp(${i})" ${i===0?'disabled':''} style="${i===0?'opacity:.3':''}">${s.upBtn}</button>
              <button class="tool-item__btn" onclick="Admin.moveDown(${i})" ${i===extra.length-1?'disabled':''} style="${i===extra.length-1?'opacity:.3':''}">${s.downBtn}</button>
              <button class="tool-item__btn" onclick="Admin.startEdit(${i})">${s.editBtn}</button>
              <button class="tool-item__btn tool-item__btn--del" onclick="Admin.deleteTool(${i})">${s.deleteBtn}</button>
            </div>
          </div>
          <div id="edit-${i}" style="display:none"></div>`
        ).join('')
        : '';

      body.innerHTML =
        `<p style="font-size:.68rem;color:var(--fg3);font-family:var(--mono);margin-bottom:.5rem;text-transform:uppercase;letter-spacing:.5px">Herramientas base</p>` +
        baseHTML +
        (extra.length ? `<p style="font-size:.68rem;color:var(--fg3);font-family:var(--mono);margin:.8rem 0 .5rem;text-transform:uppercase;letter-spacing:.5px">Herramientas personalizadas</p>` + extraHTML : '') +
        (!extra.length ? `<p style="font-size:.78rem;color:var(--fg3);font-family:var(--mono);margin-top:.6rem">${s.listEmpty}</p>` : '');

    } else {
      // add new tool
      body.innerHTML =
        `<p style="font-size:.76rem;color:var(--fg3);font-family:var(--mono);margin-bottom:.9rem">Completá los campos. Si ponés una URL, se abre al clickear.</p>` +
        `<label>${s.fields.name}</label><input type="text" id="a-name" placeholder="${s.ph.name}">` +
        `<label>${s.fields.desc}</label><input type="text" id="a-desc" placeholder="${s.ph.desc}">` +
        `<label>${s.fields.icon}</label><input type="text" id="a-icon" placeholder="${s.ph.icon}" style="width:65px">` +
        `<label>${s.fields.cat}</label><select id="a-cat">${Object.entries(s.cats).map(([v,n])=>`<option value="${v}">${n}</option>`).join('')}</select>` +
        `<label>${s.fields.url}</label><input type="text" id="a-url" placeholder="${s.ph.url}">` +
        `<div class="btn-row"><button class="btn" onclick="Admin.addTool()">${s.addBtn}</button></div>`;
    }
  }

  function toggleHide(id) {
    const idx = hidden.indexOf(id);
    if (idx === -1) {
      hidden.push(id);
      UI.showToast(I18n.get().toast.hidden);
    } else {
      hidden.splice(idx, 1);
      UI.showToast(I18n.get().toast.shown);
    }
    saveHidden(); Tools.renderGrid(); renderBody(); Audio.click();
  }

  function moveUp(i) {
    if (i === 0) return;
    [extra[i-1], extra[i]] = [extra[i], extra[i-1]];
    saveExtra(); Tools.renderGrid(); renderBody(); Audio.click();
  }

  function moveDown(i) {
    if (i === extra.length - 1) return;
    [extra[i], extra[i+1]] = [extra[i+1], extra[i]];
    saveExtra(); Tools.renderGrid(); renderBody(); Audio.click();
  }

  function startEdit(i) {
    const t = extra[i], s = I18n.get();
    const div = document.getElementById('edit-'+i);
    if (div.style.display !== 'none') { div.style.display = 'none'; return; }
    div.style.display = 'block';
    div.innerHTML =
      `<div class="edit-form">` +
      `<label>${s.fields.name}</label><input type="text" id="ei-n-${i}" value="${t.name}">` +
      `<label>${s.fields.desc}</label><input type="text" id="ei-d-${i}" value="${t.desc}">` +
      `<label>${s.fields.icon}</label><input type="text" id="ei-i-${i}" value="${t.icon}" style="width:65px">` +
      `<label>${s.fields.cat}</label><select id="ei-c-${i}">${Object.entries(s.cats).map(([v,n])=>`<option value="${v}"${t.cat===v?' selected':''}>${n}</option>`).join('')}</select>` +
      `<label>${s.fields.url}</label><input type="text" id="ei-u-${i}" value="${t.url||''}">` +
      `<div class="btn-row"><button class="btn" onclick="Admin.saveEdit(${i})">${s.saveBtn}</button></div></div>`;
  }

  function saveEdit(i) {
    extra[i] = { ...extra[i],
      name: document.getElementById('ei-n-'+i).value.trim() || extra[i].name,
      desc: document.getElementById('ei-d-'+i).value.trim() || extra[i].desc,
      icon: document.getElementById('ei-i-'+i).value.trim() || extra[i].icon,
      cat:  document.getElementById('ei-c-'+i).value,
      url:  document.getElementById('ei-u-'+i).value.trim(),
    };
    saveExtra(); Tools.renderGrid(); renderBody();
    UI.showToast(I18n.get().toast.saved); Audio.success();
  }

  function deleteTool(i) {
    extra.splice(i, 1); saveExtra(); Tools.renderGrid(); renderBody();
    UI.showToast(I18n.get().toast.deleted); Audio.delete();
  }

  function addTool() {
    const name = document.getElementById('a-name').value.trim();
    const desc = document.getElementById('a-desc').value.trim();
    if (!name || !desc) return;
    const icon = document.getElementById('a-icon').value.trim() || '🔧';
    const cat  = document.getElementById('a-cat').value;
    const url  = document.getElementById('a-url').value.trim();
    extra.push({ id: 'c_' + Date.now(), name, desc, icon, cat, type: url ? 'external-link' : 'custom', url });
    saveExtra(); Tools.renderGrid();
    UI.showToast(I18n.get().toast.added); Audio.success();
    ['a-name','a-desc','a-icon','a-url'].forEach(id => document.getElementById(id).value = '');
  }

  return {
    isUnlocked, getExtra, getHidden,
    switchTab, renderPanel, renderBody,
    toggleHide, moveUp, moveDown,
    startEdit, saveEdit, deleteTool, addTool,
  };
})();

/* ═══════════════════════════════════════════════
   INIT
═══════════════════════════════════════════════ */
I18n.set('es');
