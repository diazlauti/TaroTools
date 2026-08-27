'use strict';

/* ═══════════════════════════════════════════════
   CONFIG
═══════════════════════════════════════════════ */
const CONFIG = {
  GEMINI_PROXY: '/.netlify/functions/gemini',
  GEMINI_MODEL: 'gemini-2.0-flash',
  COBALT_API: '/.netlify/functions/cobalt',
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
    alarm()   { [660,880,660,880,660,880].forEach((f,i)=>setTimeout(()=>beep(f,.16,'square',.14),i*190)); },
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
    { id:'b9',  icon:'🌐', cat:'texto',      type:'ai-translate'  },
    { id:'b10', icon:'📝', cat:'texto',      type:'ai-expand'     },
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
    { id:'b21', icon:'📏', cat:'imagen',     type:'img-resize'    },
    { id:'b22', icon:'🚫', cat:'imagen',     type:'meta-remove'   },
    { id:'b23', icon:'🌐', cat:'imagen',     type:'favicon-gen'   },
    { id:'b24', icon:'✂️',  cat:'imagen',     type:'bg-remove',    isNew:true },
    { id:'c1',  icon:'🔗', cat:'pdf',        type:'pdf-merge'     },
    { id:'c2',  icon:'✂️', cat:'pdf',        type:'pdf-split'     },
    { id:'c3',  icon:'🗜️', cat:'pdf',        type:'pdf-compress'  },
    { id:'c4',  icon:'🖼️', cat:'pdf',        type:'pdf-to-jpg'    },
    { id:'c5',  icon:'🔓', cat:'pdf',        type:'pdf-unlock'    },
    { id:'c6',  icon:'🔄', cat:'pdf',        type:'pdf-rotate'    },
    { id:'c7',  icon:'🗑️', cat:'pdf',        type:'pdf-delete-p'  },
    { id:'c8',  icon:'🔍', cat:'pdf',        type:'pdf-ocr'       },
    { id:'d1',  icon:'🔑', cat:'util',       type:'pwd-gen',      isNew:true },
    { id:'d2',  icon:'{ }',cat:'util',       type:'json-fmt',     isNew:true },
    { id:'d3',  icon:'🆚', cat:'texto',      type:'text-diff',    isNew:true },
    { id:'d4',  icon:'🧮', cat:'conversion', type:'unit-conv',    isNew:true },
    { id:'d5',  icon:'🍅', cat:'util',       type:'countdown-timer', isNew:true },
    { id:'d6',  icon:'🌈', cat:'util',       type:'palette-gen',  isNew:true },
    { id:'e1',  icon:'🎼', cat:'externos',   type:'external-link', isNew:true, url:'https://everynoise.com/engenremap.html' },
    { id:'e2',  icon:'🧪', cat:'externos',   type:'external-link', isNew:true, url:'https://regex101.com' },
    { id:'e3',  icon:'🖊️', cat:'externos',   type:'external-link', isNew:true, url:'https://excalidraw.com' },
    { id:'e4',  icon:'🕰️', cat:'externos',   type:'external-link', isNew:true, url:'https://web.archive.org' },
    { id:'e5',  icon:'🚦', cat:'externos',   type:'external-link', isNew:true, url:'https://downforeveryoneorjustme.com' },
    { id:'e6',  icon:'📸', cat:'externos',   type:'external-link', isNew:true, url:'https://carbon.now.sh' },
    { id:'f1',  icon:'.*', cat:'texto',      type:'regex-test',   isNew:true },
    { id:'f2',  icon:'¶',  cat:'texto',      type:'lorem-gen',    isNew:true },
    { id:'f3',  icon:'🏷️', cat:'texto',      type:'slugify',      isNew:true },
    { id:'f4',  icon:'🖌️', cat:'imagen',     type:'img-palette',  isNew:true },
  ];

  const STRINGS = {
    es: {
      tagline:'herramientas útiles · sin virus · sin drama',
      search:'Buscar herramienta...',
      mq:'✦ TARO\'S TOOLS ✦ COMPRESOR ✦ PDF ✦ TRADUCTOR ✦ RESUMIDOR ✦ DESCARGADOR ✦ CONVERTIDOR ✦ CORRECTOR ✦ VIDEO ✦ AUDIO ✦ QR ✦ COLORES ✦ CONTRASEÑAS ✦ JSON ✦ DIFF ✦ POMODORO ✦ PALETAS ✦ UNIDADES ✦',
      tabs:['Todas','Archivos','PDF','Imagen','Texto','Conversión','Media','Utilidades','Descubrí'],
      catKeys:['all','archivo','pdf','imagen','texto','conversion','media','util','externos'],
      catNames:{ archivo:'📁 Archivos', pdf:'📄 PDF', imagen:'🖼️ Imagen', texto:'📝 Texto', conversion:'🔄 Conversión', media:'🎬 Media', util:'⚡ Utilidades', externos:'🔗 Descubrí' },
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
        b21:'Redimensionar imagen', b22:'Borrar metadatos', b23:'Generador de favicon', b24:'Borrar fondo',
        c1:'Combinar PDFs', c2:'Dividir PDF', c3:'Comprimir PDF', c4:'PDF a JPG', c5:'Desbloquear PDF', c6:'Rotar PDF', c7:'Borrar páginas', c8:'OCR — imagen a texto',
        d1:'Generador de contraseñas', d2:'Formateador de JSON', d3:'Comparador de texto',
        d4:'Conversor de unidades', d5:'Temporizador Pomodoro', d6:'Paleta de colores',
        e1:'Every Noise at Once', e2:'regex101', e3:'Excalidraw',
        e4:'Wayback Machine', e5:'Down For Everyone Or Just Me', e6:'Carbon',
        f1:'Probador de regex', f2:'Generador de Lorem Ipsum', f3:'Slugify',
        f4:'Paleta de una imagen',
      },
      toolDescs:{
        b1:'Reducí el tamaño de JPG/PNG con preview y comparación antes/después.',
        b2:'Convertí entre JPG, PNG y WEBP con preview de cada archivo.',
        b3:'Juntá una o varias imágenes en un solo PDF.',
        b4:'Comprimí videos MP4 reduciendo resolución y bitrate.',
        b5:'Comprimí MP3, WAV u OGG con control de canales y sample rate.',
        b6:'Extraé el texto de cualquier PDF en segundos.',
        b7:'Resumí cualquier texto largo en segundos con IA.',
        b8:'Corregí ortografía y gramática de cualquier texto con IA.',
        b9:'Traducí texto a más de 10 idiomas con IA.',
        b10:'Expandí y desarrollá un texto corto con IA.',
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
        b21:'Redimensioná cualquier imagen a píxeles exactos o porcentaje, con preview en vivo y presets.',
        b22:'Eliminá todos los metadatos EXIF de tu foto (GPS, cámara, fecha). 100% local.',
        b23:'Convertí cualquier imagen a favicon .ico listo para usar en tu sitio web.',
        b24:'Quitá el fondo de una imagen por color, sin IA: elegí el color de fondo y ajustá la tolerancia. Ideal para fondos lisos.',
        c1:'Combiná varios PDFs en uno solo, en el orden que quieras.',
        c2:'Dividí un PDF por páginas o rangos.',
        c3:'Reducí el peso de tu PDF sin perder calidad visible.',
        c4:'Exportá cada página de un PDF como imagen JPG.',
        c5:'Eliminá restricciones de copia y edición de un PDF.',
        c6:'Rotá páginas de tu PDF en 90°, 180° o 270°.',
        c7:'Eliminá páginas específicas de un PDF.',
        c8:'Extraé texto de imágenes o PDFs escaneados con OCR.',
        d1:'Generá contraseñas seguras y aleatorias con medidor de fortaleza. 100% local.',
        d2:'Formateá, validá y minificá JSON al instante.',
        d3:'Compará dos textos y visualizá las diferencias palabra por palabra.',
        d4:'Convertí entre unidades de longitud, peso, volumen, velocidad y temperatura.',
        d5:'Temporizador con presets Pomodoro para enfocarte y tomar descansos.',
        d6:'Generá paletas de colores armónicas: complementaria, análoga, triádica y más.',
        e1:'El mapa de géneros musicales más completo de internet, generado algorítmicamente. Un agujero negro de horas.',
        e2:'Probador de expresiones regulares con explicación en vivo de cada parte del patrón.',
        e3:'Pizarra colaborativa gratis para bocetos, diagramas y wireframes a mano alzada.',
        e4:'Archivo histórico de internet — mirá cómo era cualquier sitio web en el pasado.',
        e5:'¿Un sitio está caído para todos o solo para vos? Te lo confirma al toque.',
        e6:'Convertí fragmentos de código en capturas lindas para compartir.',
        f1:'Probá expresiones regulares en vivo con resaltado de coincidencias y grupos capturados.',
        f2:'Generá texto de relleno Lorem Ipsum en palabras, oraciones o párrafos para tus maquetas.',
        f3:'Convertí cualquier texto en un slug apto para URLs, en vivo mientras escribís.',
        f4:'Extraé los colores dominantes de cualquier imagen automáticamente. 100% local.',
      },
      langs:['Inglés','Español','Portugués','Francés','Alemán','Italiano','Japonés','Chino (simplificado)','Árabe','Ruso','Coreano','Hindi'],
    },
    en: {
      tagline:'useful tools · no viruses · no drama',
      search:'Search tool...',
      mq:'✦ TARO\'S TOOLS ✦ COMPRESSOR ✦ PDF ✦ TRANSLATOR ✦ SUMMARIZER ✦ DOWNLOADER ✦ CONVERTER ✦ CORRECTOR ✦ VIDEO ✦ AUDIO ✦ QR ✦ COLORS ✦',
      tabs:['All','Files','PDF','Image','Text','Conversion','Media','Utilities'],
      catKeys:['all','archivo','pdf','imagen','texto','conversion','media','util'],
      catNames:{ archivo:'📁 Files', pdf:'📄 PDF', imagen:'🖼️ Image', texto:'📝 Text', conversion:'🔄 Conversion', media:'🎬 Media', util:'⚡ Utilities' },
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
      tabs:['Todas','Arquivos','PDF','Imagem','Texto','Conversão','Mídia','Utilidades'],
      catKeys:['all','archivo','pdf','imagen','texto','conversion','media','util'],
      catNames:{ archivo:'📁 Arquivos', pdf:'📄 PDF', imagen:'🖼️ Imagem', texto:'📝 Texto', conversion:'🔄 Conversão', media:'🎬 Mídia', util:'⚡ Utilidades' },
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
        b21:'Redimensionar imagem', b22:'Remover metadados', b23:'Gerador de favicon',
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
    // idioma fijo en español — botones de idioma removidos
    Audio.click();
    current = 'es';
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
    const btn = document.getElementById('theme-btn');
    btn.textContent = theme === 'dark' ? '☀' : '☾';
    btn.classList.remove('spin-once');
    void btn.offsetWidth; // reinicia la animación si se clickea rápido varias veces
    btn.classList.add('spin-once');
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
    if (id === 'tool-modal' && location.hash) history.replaceState(null, '', ' ');
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
    let _cardStaggerIdx = 0;

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
        card.style.setProperty('--i', _cardStaggerIdx++);
        card.dataset.cat = tool.cat;
        card.setAttribute('role', 'listitem');
        card.setAttribute('tabindex', '0');
        card.setAttribute('aria-label', tool.name);
        card.innerHTML =
          `<span class="card__cat" aria-hidden="true">${tool.cat}</span>` +
          (tool.soon ? `<span class="card__soon-badge">${s.soon}</span>` : '') +
          (tool.isNew && !tool.soon ? `<span class="card__new-badge">✨ Nuevo</span>` : '') +
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
    history.replaceState(null, '', '#' + tool.id);
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
    if (tool.type === 'pwd-gen') ToolFn.pwdGenerate();
    if (tool.type === 'unit-conv') ToolFn.unitCatChange();
  }

  return { filter, filterCat, renderTabs, renderGrid, allTools, openTool };
})();

/* ═══════════════════════════════════════════════
   TOOL UI BUILDER
═══════════════════════════════════════════════ */
const ToolUI = (() => {
  function dropZone(id, accept, onchange, label, multiple=false) {
    const icons = {'image/jpeg,image/png,image/webp':'🖼️','video/*':'🎬','audio/*':'🎵','application/pdf':'📄','image/*':'🖼️'};
    const icon = icons[accept] || '📁';
    const multAttr = multiple ? 'multiple' : '';
    return `<div class="file-drop" id="${id}-drop">
      <input type="file" id="${id}" accept="${accept}" onchange="${onchange};ToolFn._dropName('${id}')" ${multAttr}>
      <div class="file-drop__icon">${icon}</div>
      <div class="file-drop__title">${label}</div>
      <div class="file-drop__sub">o hacé click para elegir</div>
      <div class="file-drop__name" id="${id}-name"></div>
    </div>`;
  }
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
      infoBox('Soporta <b>JPG, PNG, WEBP</b>. Preview en vivo antes/después. Todo en tu navegador. El resultado es JPG: si tu PNG tiene transparencia, se rellena con fondo blanco.') +
      label('Imagen') +
      `${dropZone('ic-file','image/jpeg,image/png,image/webp','ToolFn.previewImg()','Arrastrá una imagen acá')}` +
      label('Calidad: <span id="ic-ql">75</span>%') +
      `<input type="range" min="5" max="99" value="75" id="ic-q" oninput="ToolFn.onQualityChange()" style="width:100%;margin:.25rem 0 .1rem">` +
      `<div id="ic-reduction" style="font-size:.75rem;color:var(--fg3);font-family:var(--mono);min-height:1.2rem;margin:.3rem 0"></div>` +
      `<div class="btn-row"><button class="btn" onclick="ToolFn.compressImg()">⬇️ Comprimir y descargar</button></div>` +
      result('ic-result') +
      `<div id="ic-previews" style="display:none;margin:.8rem 0">
        <div style="border-radius:10px;overflow:hidden;border:1.5px solid var(--border);background:var(--bg3)">
          <div style="display:flex;justify-content:space-between;padding:.4rem .7rem;border-bottom:1px solid var(--border)">
            <span style="font-size:.7rem;font-family:var(--mono);color:var(--fg3)">ANTES / DESPUÉS</span>
            <span id="ic-reduction-badge" style="font-size:.7rem;font-family:var(--mono);color:var(--accent)"></span>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:0">
            <div style="padding:.5rem;border-right:1px solid var(--border)">
              <img id="ic-before" style="width:100%;border-radius:6px;display:block" alt="original">
              <p id="ic-before-size" style="font-size:.68rem;color:var(--fg3);font-family:var(--mono);margin-top:.3rem;text-align:center"></p>
            </div>
            <div style="padding:.5rem">
              <img id="ic-after" style="width:100%;border-radius:6px;display:block;opacity:.4;transition:opacity .3s" alt="comprimida">
              <p id="ic-after-size" style="font-size:.68rem;color:var(--fg3);font-family:var(--mono);margin-top:.3rem;text-align:center">ajustá la calidad</p>
            </div>
          </div>
        </div>
      </div>`,

    /* ── IMG CONVERT ── */
    'img-convert': () =>
      infoBox('Convertí entre <b>JPG, PNG y WEBP</b>. Podés subir varias imágenes a la vez.') +
      label('Imágenes (múltiples)') +
      `${dropZone('cv-file','image/jpeg,image/png,image/webp','ToolFn.previewConvertFiles()','Arrastrá imágenes acá',true)}` +
      `<div id="cv-previews" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(80px,1fr));gap:.5rem;margin:.6rem 0"></div>` +
      label('Convertir a') +
      sel('cv-fmt', [['image/jpeg','JPG'],['image/png','PNG'],['image/webp','WEBP']]) +
      `<div class="btn-row"><button class="btn" onclick="ToolFn.convertImg()">Convertir todo</button></div>` +
      `<div id="cv-result" style="margin-top:.7rem"></div>`,

    /* ── IMG PDF ── */
    'img-pdf': () =>
      infoBox('Subí <b>una o más imágenes</b>. Cada una ocupa una página en el PDF. El orden es el que subiste.') +
      label('Imágenes') +
      `${dropZone('ipdf-file','image/*','ToolFn.previewPdfFiles()','Arrastrá imágenes acá',true)}` +
      `<div id="ipdf-previews" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(80px,1fr));gap:.5rem;margin:.6rem 0"></div>` +
      `<div class="btn-row"><button class="btn" onclick="ToolFn.imgToPdf()">📄 Generar PDF</button></div>` +
      loader('ipdf-loader','⏳ generando PDF...') +
      `<div id="ipdf-result" style="margin-top:.7rem"></div>`,

    /* ── VID COMPRESS ── */
    'vid-compress': () =>
      infoBox('⚠️ El resultado es <b>WEBM</b> (limitación del navegador). Para MP4 profesional usá <a href="https://handbrake.fr" target="_blank">HandBrake</a> (gratis).') +
      label('Video') +
      `${dropZone('vc-file','video/*','ToolFn.previewVideo()','Arrastrá un video acá')}` +
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
      `${dropZone('ac-file','audio/*','ToolFn.previewAudio()','Arrastrá un archivo de audio acá')}` +
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
      `${dropZone('pdf-file','application/pdf','','Arrastrá un PDF acá')}` +
      `<div class="btn-row"><button class="btn" onclick="ToolFn.pdfToText()">📄 Extraer texto</button></div>` +
      loader('pdf-loader','⏳ procesando PDF...') +
      `<div class="result-area" id="pdf-result" style="display:none;max-height:260px;overflow-y:auto"></div>` +
      copyRow('pdf-result'),

    /* ── IMG RESIZE ── */
    'img-resize': () =>
      infoBox('Redimensioná tu imagen. Presets, píxeles o porcentaje. Preview en vivo. 100% local.') +
      `<input type="file" id="ir-file" accept="image/*" style="display:none" onchange="ToolFn.irLoad()">` +
      `<div class="file-drop" id="ir-drop" onclick="document.getElementById('ir-file').click()" ondragover="event.preventDefault();this.classList.add('drag-over')" ondragleave="this.classList.remove('drag-over')" ondrop="event.preventDefault();this.classList.remove('drag-over');const dt=event.dataTransfer;if(dt.files.length){const inp=document.getElementById('ir-file');const tsfr=new DataTransfer();tsfr.items.add(dt.files[0]);inp.files=tsfr.files;ToolFn.irLoad();}">
        <div class="file-drop__icon">📐</div>
        <div class="file-drop__title">Arrastrá una imagen acá</div>
        <div class="file-drop__sub">o hacé click · JPG, PNG, WEBP, GIF</div>
        <div class="file-drop__name" id="ir-name"></div>
      </div>` +
      `<div id="ir-info" style="display:none">
        <p id="ir-orig-info" style="font-size:.72rem;color:var(--fg3);font-family:var(--mono);margin:.5rem 0 .3rem"></p>

        <div style="display:flex;gap:.3rem;margin-bottom:.6rem">
          <button class="btn btn--sec ir-mode-btn" id="ir-mode-px" onclick="ToolFn.irSetMode('px')" style="font-size:.72rem;padding:.3rem .7rem;opacity:1">px</button>
          <button class="btn btn--sec ir-mode-btn" id="ir-mode-pct" onclick="ToolFn.irSetMode('pct')" style="font-size:.72rem;padding:.3rem .7rem;opacity:.5">%</button>
        </div>

        <div style="display:grid;grid-template-columns:1fr auto 1fr;gap:.5rem;align-items:end;margin-bottom:.4rem">
          <div><label style="margin-top:0" id="ir-lbl-w">Ancho (px)</label><input type="number" id="ir-w" oninput="ToolFn.irSyncAR('w')" placeholder="1920" style="text-align:center"></div>
          <div style="padding-bottom:.6rem;color:var(--fg3);font-family:var(--mono);font-size:.9rem">×</div>
          <div><label style="margin-top:0" id="ir-lbl-h">Alto (px)</label><input type="number" id="ir-h" oninput="ToolFn.irSyncAR('h')" placeholder="1080" style="text-align:center"></div>
        </div>

        <label style="display:flex;align-items:center;gap:.5rem;font-size:.8rem;cursor:pointer;margin-bottom:.5rem">
          <input type="checkbox" id="ir-ar" checked onchange="ToolFn.irPreviewLive()"> Mantener proporción
        </label>

        <label style="display:flex;align-items:center;gap:.5rem;font-size:.8rem;cursor:pointer;margin-bottom:.3rem">
          <input type="checkbox" id="ir-compress" onchange="ToolFn.irToggleCompress()"> Comprimir (JPEG)
        </label>
        <div id="ir-q-row" style="display:none;margin-bottom:.4rem">
          <label style="margin-top:.3rem">Calidad: <span id="ir-ql">80</span>%</label>
          <input type="range" min="10" max="99" value="80" id="ir-q" oninput="document.getElementById('ir-ql').textContent=this.value;ToolFn.irPreviewLive()" style="width:100%">
        </div>

        <div style="display:flex;flex-wrap:wrap;gap:.3rem;margin-bottom:.6rem">
          <button class="btn btn--sec" onclick="ToolFn.irPreset(1080,1080)" style="font-size:.7rem;padding:.25rem .5rem">📸 Instagram</button>
          <button class="btn btn--sec" onclick="ToolFn.irPreset(1080,1920)" style="font-size:.7rem;padding:.25rem .5rem">📱 TikTok</button>
          <button class="btn btn--sec" onclick="ToolFn.irPreset(1280,720)" style="font-size:.7rem;padding:.25rem .5rem">▶️ YT Thumb</button>
          <button class="btn btn--sec" onclick="ToolFn.irPreset(512,512)" style="font-size:.7rem;padding:.25rem .5rem">💬 Discord</button>
          <button class="btn btn--sec" onclick="ToolFn.irPreset(1920,1080)" style="font-size:.7rem;padding:.25rem .5rem">🖥️ FHD</button>
          <button class="btn btn--sec" onclick="ToolFn.irPreset(3840,2160)" style="font-size:.7rem;padding:.25rem .5rem">🖥️ 4K</button>
        </div>

        <div class="btn-row" style="margin-bottom:.5rem">
          <button class="btn" onclick="ToolFn.irDownload()">⬇️ Descargar</button>
        </div>

        <div style="border-radius:10px;overflow:hidden;border:1.5px solid var(--border);background:var(--bg3)">
          <div style="display:flex;justify-content:space-between;align-items:center;padding:.4rem .7rem;border-bottom:1px solid var(--border)">
            <span style="font-size:.7rem;font-family:var(--mono);color:var(--fg3)">PREVIEW EN VIVO</span>
            <span id="ir-preview-info" style="font-size:.7rem;font-family:var(--mono);color:var(--accent)"></span>
          </div>
          <canvas id="ir-canvas" style="width:100%;display:block;max-height:340px;object-fit:contain"></canvas>
        </div>
      </div>`,

    /* ── META REMOVE ── */
    'meta-remove': () =>
      infoBox('Eliminá todos los metadatos EXIF de tu imagen (ubicación GPS, cámara, fecha, etc.). Procesamiento 100% local.') +
      `<input type="file" id="mr-file" accept="image/jpeg,image/png,image/webp" style="display:none" onchange="ToolFn.mrLoad()">` +
      `<div class="file-drop" id="mr-drop" onclick="document.getElementById('mr-file').click()" ondragover="event.preventDefault();this.classList.add('drag-over')" ondragleave="this.classList.remove('drag-over')" ondrop="event.preventDefault();this.classList.remove('drag-over');document.getElementById('mr-file').files=event.dataTransfer.files;ToolFn.mrLoad()">
        <div class="file-drop__icon">🚫</div>
        <div class="file-drop__title">Arrastrá una imagen acá</div>
        <div class="file-drop__sub">o hacé click para elegir · JPG, PNG, WEBP</div>
        <div class="file-drop__name" id="mr-name"></div>
      </div>` +
      `<div id="mr-info" style="display:none">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:.5rem;margin:.6rem 0">
          <div style="background:var(--bg3);border-radius:8px;padding:.6rem;font-family:var(--mono);font-size:.72rem">
            <div style="color:var(--fg3);margin-bottom:.3rem">ORIGINAL</div>
            <div id="mr-orig-size" style="color:var(--fg2)"></div>
            <div id="mr-orig-meta" style="color:var(--accent2);margin-top:.2rem"></div>
          </div>
          <div style="background:var(--bg3);border-radius:8px;padding:.6rem;font-family:var(--mono);font-size:.72rem">
            <div style="color:var(--fg3);margin-bottom:.3rem">LIMPIA</div>
            <div id="mr-clean-size" style="color:var(--fg2)">—</div>
            <div id="mr-clean-meta" style="color:var(--accent);margin-top:.2rem">Sin metadatos</div>
          </div>
        </div>
        <div id="mr-preview" style="display:grid;grid-template-columns:1fr 1fr;gap:.5rem;margin:.4rem 0">
          <div>
            <p style="font-size:.68rem;color:var(--fg3);font-family:var(--mono);margin-bottom:.3rem">ORIGINAL</p>
            <img id="mr-before" style="width:100%;border-radius:8px;border:1.5px solid var(--border)" alt="original">
          </div>
          <div>
            <p style="font-size:.68rem;color:var(--fg3);font-family:var(--mono);margin-bottom:.3rem">SIN METADATA</p>
            <img id="mr-after" style="width:100%;border-radius:8px;border:1.5px solid var(--accent);opacity:.5" alt="limpia">
          </div>
        </div>
        <div class="btn-row"><button class="btn" onclick="ToolFn.mrProcess()">🚫 Borrar metadatos y descargar</button></div>
        <div id="mr-result" style="margin-top:.5rem"></div>
      </div>`,

    /* ── FAVICON GEN ── */
    'favicon-gen': () =>
      infoBox('Convertí cualquier imagen a favicon. Se genera un <b>.ico</b> con múltiples tamaños (16, 32, 48px) listo para usar en tu web.') +
      `<input type="file" id="fv-file" accept="image/*" style="display:none" onchange="ToolFn.fvLoad()">` +
      `<div class="file-drop" id="fv-drop" onclick="document.getElementById('fv-file').click()" ondragover="event.preventDefault();this.classList.add('drag-over')" ondragleave="this.classList.remove('drag-over')" ondrop="event.preventDefault();this.classList.remove('drag-over');document.getElementById('fv-file').files=event.dataTransfer.files;ToolFn.fvLoad()">
        <div class="file-drop__icon">🌐</div>
        <div class="file-drop__title">Arrastrá una imagen acá</div>
        <div class="file-drop__sub">o hacé click para elegir · PNG recomendado</div>
        <div class="file-drop__name" id="fv-name"></div>
      </div>` +
      `<div id="fv-info" style="display:none">
        <div style="display:flex;gap:1rem;align-items:center;margin:.7rem 0;flex-wrap:wrap">
          <div style="text-align:center">
            <canvas id="fv-p16" width="16" height="16" style="border:1px solid var(--border);border-radius:3px;image-rendering:pixelated;width:32px;height:32px"></canvas>
            <p style="font-size:.62rem;color:var(--fg3);font-family:var(--mono);margin-top:.2rem">16px</p>
          </div>
          <div style="text-align:center">
            <canvas id="fv-p32" width="32" height="32" style="border:1px solid var(--border);border-radius:3px;image-rendering:pixelated;width:48px;height:48px"></canvas>
            <p style="font-size:.62rem;color:var(--fg3);font-family:var(--mono);margin-top:.2rem">32px</p>
          </div>
          <div style="text-align:center">
            <canvas id="fv-p48" width="48" height="48" style="border:1px solid var(--border);border-radius:3px;image-rendering:pixelated;width:64px;height:64px"></canvas>
            <p style="font-size:.62rem;color:var(--fg3);font-family:var(--mono);margin-top:.2rem">48px</p>
          </div>
          <div style="text-align:center">
            <canvas id="fv-p192" width="192" height="192" style="border:1px solid var(--border);border-radius:8px;width:80px;height:80px"></canvas>
            <p style="font-size:.62rem;color:var(--fg3);font-family:var(--mono);margin-top:.2rem">192px</p>
          </div>
        </div>
        <div class="btn-row" style="flex-wrap:wrap;gap:.4rem">
          <button class="btn" onclick="ToolFn.fvDownloadIco()">⬇️ Descargar .ico</button>
          <button class="btn btn--sec" onclick="ToolFn.fvDownloadPng(192)">PNG 192px</button>
          <button class="btn btn--sec" onclick="ToolFn.fvDownloadPng(32)">PNG 32px</button>
        </div>
        <div id="fv-tip" style="font-size:.72rem;color:var(--fg3);font-family:var(--mono);margin-top:.6rem;line-height:1.5">
          💡 Poné el .ico en la raíz de tu proyecto y agregá en el &lt;head&gt;:<br>
          <code style="font-size:.7rem">&lt;link rel="icon" href="favicon.ico"&gt;</code>
        </div>
      </div>`,

    /* ── PDF MERGE ── */
    'pdf-merge': () =>
      infoBox('Combiná varios PDFs en uno solo. Arrastrá las tarjetas para reordenar. 100% local con <b>PDF-lib</b>.') +
      `<input type="file" id="pm-files" accept="application/pdf" multiple style="display:none" onchange="ToolFn.pmLoad()">` +
      `<div class="file-drop" onclick="document.getElementById('pm-files').click()" ondragover="event.preventDefault();this.classList.add('drag-over')" ondragleave="this.classList.remove('drag-over')" ondrop="event.preventDefault();this.classList.remove('drag-over');document.getElementById('pm-files').files=event.dataTransfer.files;ToolFn.pmLoad()">
        <div class="file-drop__icon">🔗</div>
        <div class="file-drop__title">Arrastrá los PDFs acá</div>
        <div class="file-drop__sub">o hacé click · varios archivos a la vez</div>
      </div>` +
      `<div id="pm-total" style="font-size:.72rem;color:var(--fg3);font-family:var(--mono);margin:.4rem 0;min-height:1.1rem"></div>` +
      `<div id="pm-list" style="margin:.6rem 0"></div>` +
      `<div class="btn-row"><button class="btn" onclick="ToolFn.pmMerge()">🔗 Combinar PDFs</button></div>` +
      loader('pm-loader','⏳ combinando PDFs...') +
      result('pm-result'),

    /* ── PDF SPLIT ── */
    'pdf-split': () => {
      const loaderHtml = loader('ps-loader','⏳ dividiendo PDF...');
      const resultHtml = result('ps-result');
      return `<div id="ps-upload-screen">` +
        infoBox('Dividí un PDF en páginas individuales o por rango. Hacé click en las miniaturas para seleccionar.') +
        `<input type="file" id="ps-file" accept="application/pdf" style="display:none" onchange="ToolFn.psLoad()">
        <div class="file-drop" onclick="document.getElementById('ps-file').click()" ondragover="event.preventDefault();this.classList.add('drag-over')" ondragleave="this.classList.remove('drag-over')" ondrop="event.preventDefault();this.classList.remove('drag-over');document.getElementById('ps-file').files=event.dataTransfer.files;ToolFn.psLoad()">
          <div class="file-drop__icon">✂️</div>
          <div class="file-drop__title">Arrastrá un PDF acá</div>
          <div class="file-drop__sub">o hacé click para elegir</div>
          <div class="file-drop__name" id="ps-name"></div>
        </div>
        </div>
        <div id="ps-editor" style="display:none">
          <div class="pr-topbar">
            <div class="pr-topbar__info">
              <span id="ps-filename" style="font-family:var(--mono);font-size:.78rem;color:var(--fg2)"></span>
              <span id="ps-pages-info" style="font-family:var(--mono);font-size:.7rem;color:var(--fg3);margin-left:.6rem"></span>
            </div>
            <button class="btn btn--sec" onclick="ToolFn.psReset()" style="font-size:.7rem;padding:.25rem .6rem">✕ Cambiar PDF</button>
          </div>
          <div class="pr-workspace">
            <div class="pr-sidebar" id="ps-sidebar">
              <p style="font-size:.62rem;color:var(--fg3);font-family:var(--mono);text-transform:uppercase;letter-spacing:1px;margin-bottom:.5rem">Páginas</p>
              <div id="ps-thumbs"></div>
            </div>
            <div class="pr-panel">
              <label>Modo</label>
              <div class="pr-scope-group">
                <button class="pr-scope-btn active" id="ps-scope-all" onclick="ToolFn.psSetScope('all',this)">Todas</button>
                <button class="pr-scope-btn" id="ps-scope-sel" onclick="ToolFn.psSetScope('sel',this)">Selección</button>
                <button class="pr-scope-btn" id="ps-scope-range" onclick="ToolFn.psSetScope('range',this)">Rango</button>
              </div>
              <div id="ps-range-row" style="display:none;margin-top:.5rem">
                <label>Páginas (ej: 1-3, 5, 7-9)</label>
                <input type="text" id="ps-range" placeholder="1-3, 5, 7-9" oninput="ToolFn.psHighlightRange()">
              </div>
              <div id="ps-sel-hint" style="display:none;font-size:.7rem;color:var(--fg3);font-family:var(--mono);margin-top:.4rem">✦ Hacé click en las miniaturas para seleccionar</div>
              <div style="margin-top:.9rem;padding:.6rem;background:var(--bg3);border-radius:8px;border:1px solid var(--border)">
                <p style="font-size:.62rem;color:var(--fg3);font-family:var(--mono);text-transform:uppercase;letter-spacing:1px;margin-bottom:.35rem">Selección</p>
                <div id="ps-sel-info" style="font-size:.75rem;color:var(--accent);font-family:var(--mono)">todas las páginas</div>
              </div>
              <div class="btn-row" style="margin-top:.9rem">
                <button class="btn" onclick="ToolFn.psSplit()">✂️ Dividir PDF</button>
              </div>
              ${loaderHtml}${resultHtml}
            </div>
          </div>
        </div>`;
    },

    /* ── PDF COMPRESS ── */
    'pdf-compress': () => {
      const loaderHtml = loader('pc-loader','⏳ comprimiendo PDF...');
      const resultHtml = result('pc-result');
      return `<div id="pc-upload-screen">` +
        infoBox('Reducí el peso del PDF quitando metadatos innecesarios. Para reducciones grandes, activá el modo agresivo. 100% local.') +
        `<input type="file" id="pc-file" accept="application/pdf" style="display:none" onchange="ToolFn.pcLoad()">
        <div class="file-drop" onclick="document.getElementById('pc-file').click()" ondragover="event.preventDefault();this.classList.add('drag-over')" ondragleave="this.classList.remove('drag-over')" ondrop="event.preventDefault();this.classList.remove('drag-over');document.getElementById('pc-file').files=event.dataTransfer.files;ToolFn.pcLoad()">
          <div class="file-drop__icon">🗜️</div>
          <div class="file-drop__title">Arrastrá un PDF acá</div>
          <div class="file-drop__sub">o hacé click para elegir</div>
          <div class="file-drop__name" id="pc-name"></div>
        </div>
        </div>
        <div id="pc-editor" style="display:none">
          <div class="pr-topbar">
            <div class="pr-topbar__info">
              <span id="pc-filename" style="font-family:var(--mono);font-size:.78rem;color:var(--fg2)"></span>
              <span id="pc-pages-info" style="font-family:var(--mono);font-size:.7rem;color:var(--fg3);margin-left:.6rem"></span>
            </div>
            <button class="btn btn--sec" onclick="ToolFn.pcReset()" style="font-size:.7rem;padding:.25rem .6rem">✕ Cambiar PDF</button>
          </div>
          <div class="pr-workspace">
            <div class="pr-sidebar" id="pc-sidebar">
              <p style="font-size:.62rem;color:var(--fg3);font-family:var(--mono);text-transform:uppercase;letter-spacing:1px;margin-bottom:.5rem">Páginas</p>
              <div id="pc-thumbs"></div>
            </div>
            <div class="pr-panel">
              <div style="background:var(--bg3);border-radius:8px;padding:.6rem;font-family:var(--mono);font-size:.72rem;margin-bottom:.7rem">
                <div style="display:flex;justify-content:space-between;margin-bottom:.2rem">
                  <span style="color:var(--fg3)">Tamaño original</span>
                  <span id="pc-orig-size" style="color:var(--fg2)">—</span>
                </div>
                <div style="display:flex;justify-content:space-between">
                  <span style="color:var(--fg3)">Estimado comprimido</span>
                  <span id="pc-est-size" style="color:var(--accent)">—</span>
                </div>
              </div>
              <label style="display:flex;align-items:center;gap:.5rem;font-size:.8rem;cursor:pointer;margin-top:0">
                <input type="checkbox" id="pc-aggressive" onchange="ToolFn.pcUpdateEst()"> Modo agresivo
              </label>
              <p style="font-size:.7rem;color:var(--fg3);font-family:var(--mono);margin:.25rem 0 .6rem">Convierte cada página en imagen para lograr mucha más reducción — el texto deja de ser seleccionable/buscable.</p>
              <label>Calidad de imagen (modo agresivo): <span id="pc-ql" style="color:var(--accent);font-family:var(--mono)">80</span>%</label>
              <input type="range" min="10" max="99" value="80" id="pc-q" oninput="ToolFn.pcUpdateEst()" style="width:100%;margin:.25rem 0 .4rem;accent-color:var(--accent)">
              <p style="font-size:.7rem;color:var(--fg3);font-family:var(--mono);margin-bottom:.6rem">Sin modo agresivo, solo se eliminan metadatos (título, autor, etc.) y el archivo se reduce apenas.</p>
              <div class="btn-row">
                <button class="btn" onclick="ToolFn.pcCompress()">🗜️ Comprimir y descargar</button>
              </div>
              ${loaderHtml}${resultHtml}
            </div>
          </div>
        </div>`;
    },

    /* ── PDF TO JPG ── */
    'pdf-to-jpg': () => {
      const loaderHtml = loader('pj-loader','⏳ convirtiendo páginas...');
      return `<div id="pj-upload-screen">` +
        infoBox('Exportá cada página como JPG. Preview en vivo al cambiar calidad. Descargá individual o todo en ZIP.') +
        `<input type="file" id="pj-file" accept="application/pdf" style="display:none" onchange="ToolFn.pjLoad()">
        <div class="file-drop" onclick="document.getElementById('pj-file').click()" ondragover="event.preventDefault();this.classList.add('drag-over')" ondragleave="this.classList.remove('drag-over')" ondrop="event.preventDefault();this.classList.remove('drag-over');document.getElementById('pj-file').files=event.dataTransfer.files;ToolFn.pjLoad()">
          <div class="file-drop__icon">🖼️</div>
          <div class="file-drop__title">Arrastrá un PDF acá</div>
          <div class="file-drop__sub">o hacé click para elegir</div>
          <div class="file-drop__name" id="pj-name"></div>
        </div>
        </div>
        <div id="pj-editor" style="display:none">
          <div class="pr-topbar">
            <div class="pr-topbar__info">
              <span id="pj-filename" style="font-family:var(--mono);font-size:.78rem;color:var(--fg2)"></span>
              <span id="pj-pages-info" style="font-family:var(--mono);font-size:.7rem;color:var(--fg3);margin-left:.6rem"></span>
            </div>
            <button class="btn btn--sec" onclick="ToolFn.pjReset()" style="font-size:.7rem;padding:.25rem .6rem">✕ Cambiar PDF</button>
          </div>
          <div class="pr-workspace">
            <div class="pr-sidebar" id="pj-sidebar">
              <p style="font-size:.62rem;color:var(--fg3);font-family:var(--mono);text-transform:uppercase;letter-spacing:1px;margin-bottom:.5rem">Páginas</p>
              <div id="pj-thumbs"></div>
            </div>
            <div class="pr-panel">
              <label>Resolución: <span id="pj-scale-lbl" style="color:var(--accent);font-family:var(--mono)">Alta (2x)</span></label>
              <input type="range" min="1" max="3" step="0.5" value="2" id="pj-scale" oninput="ToolFn.pjUpdateScaleLabel()" style="width:100%;margin:.25rem 0 .4rem;accent-color:var(--accent)">
              <label style="margin-top:.5rem">Calidad JPG: <span id="pj-ql" style="color:var(--accent);font-family:var(--mono)">92</span>%</label>
              <input type="range" min="50" max="99" value="92" id="pj-quality" oninput="ToolFn.pjUpdateQLLabel()" style="width:100%;margin:.25rem 0 .8rem;accent-color:var(--accent)">
              <div class="btn-row" style="flex-wrap:wrap">
                <button class="btn" onclick="ToolFn.pjConvert(false)">🖼️ Convertir y descargar todo</button>
                <button class="btn btn--sec" onclick="ToolFn.pjConvert(true)" id="pj-zip-btn">📦 Descargar ZIP</button>
              </div>
              ${loaderHtml}
              <div id="pj-progress" style="font-size:.72rem;color:var(--accent);font-family:var(--mono);margin:.3rem 0;min-height:1rem"></div>
              <div id="pj-previews" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:.5rem;margin-top:.6rem"></div>
            </div>
          </div>
        </div>`;
    },

    /* ── PDF UNLOCK ── */
    'pdf-unlock': () => {
      const loaderHtml = loader('pu-loader','⏳ desbloqueando PDF...');
      const resultHtml = result('pu-result');
      return `<div id="pu-upload-screen">` +
        infoBox('Eliminá restricciones de copia, impresión y edición. <b>No funciona con contraseña de apertura.</b>') +
        `<input type="file" id="pu-file" accept="application/pdf" style="display:none" onchange="ToolFn.puLoad()">
        <div class="file-drop" onclick="document.getElementById('pu-file').click()" ondragover="event.preventDefault();this.classList.add('drag-over')" ondragleave="this.classList.remove('drag-over')" ondrop="event.preventDefault();this.classList.remove('drag-over');document.getElementById('pu-file').files=event.dataTransfer.files;ToolFn.puLoad()">
          <div class="file-drop__icon">🔓</div>
          <div class="file-drop__title">Arrastrá un PDF acá</div>
          <div class="file-drop__sub">o hacé click para elegir</div>
          <div class="file-drop__name" id="pu-name"></div>
        </div>
        </div>
        <div id="pu-editor" style="display:none">
          <div class="pr-topbar">
            <div class="pr-topbar__info">
              <span id="pu-filename" style="font-family:var(--mono);font-size:.78rem;color:var(--fg2)"></span>
              <span id="pu-pages-info" style="font-family:var(--mono);font-size:.7rem;color:var(--fg3);margin-left:.6rem"></span>
            </div>
            <button class="btn btn--sec" onclick="ToolFn.puReset()" style="font-size:.7rem;padding:.25rem .6rem">✕ Cambiar PDF</button>
          </div>
          <div class="pr-workspace">
            <div class="pr-sidebar" id="pu-sidebar">
              <p style="font-size:.62rem;color:var(--fg3);font-family:var(--mono);text-transform:uppercase;letter-spacing:1px;margin-bottom:.5rem">Páginas</p>
              <div id="pu-thumbs"></div>
            </div>
            <div class="pr-panel">
              <p style="font-size:.62rem;color:var(--fg3);font-family:var(--mono);text-transform:uppercase;letter-spacing:1px;margin-bottom:.5rem">Restricciones detectadas</p>
              <div id="pu-restrictions" style="background:var(--bg3);border-radius:8px;padding:.6rem;font-family:var(--mono);font-size:.72rem;margin-bottom:.8rem">
                <div id="pu-r-print" style="display:flex;justify-content:space-between;margin-bottom:.3rem">
                  <span style="color:var(--fg3)">🖨️ Impresión</span><span id="pu-r-print-val" style="color:var(--fg2)">—</span>
                </div>
                <div id="pu-r-copy" style="display:flex;justify-content:space-between;margin-bottom:.3rem">
                  <span style="color:var(--fg3)">📋 Copia de texto</span><span id="pu-r-copy-val" style="color:var(--fg2)">—</span>
                </div>
                <div id="pu-r-edit" style="display:flex;justify-content:space-between">
                  <span style="color:var(--fg3)">✏️ Edición</span><span id="pu-r-edit-val" style="color:var(--fg2)">—</span>
                </div>
              </div>
              <p style="font-size:.68rem;color:var(--fg3);font-family:var(--mono);margin-bottom:.7rem">Tamaño: <span id="pu-orig-size">—</span></p>
              <div class="btn-row">
                <button class="btn" onclick="ToolFn.puUnlock()">🔓 Desbloquear y descargar</button>
              </div>
              ${loaderHtml}${resultHtml}
            </div>
          </div>
        </div>`;
    },

    /* ── PDF ROTATE ── */
    'pdf-rotate': () => {
      const loaderHtml = loader('pr-loader','⏳ rotando PDF...');
      const resultHtml = result('pr-result');
      return `<div id="pr-upload-screen">` +
        infoBox('Rotá páginas de tu PDF. Preview en vivo antes de descargar.') +
        `<input type="file" id="pr-file" accept="application/pdf" style="display:none" onchange="ToolFn.prLoad()">
        <div class="file-drop" onclick="document.getElementById('pr-file').click()" ondragover="event.preventDefault();this.classList.add('drag-over')" ondragleave="this.classList.remove('drag-over')" ondrop="event.preventDefault();this.classList.remove('drag-over');document.getElementById('pr-file').files=event.dataTransfer.files;ToolFn.prLoad()">
          <div class="file-drop__icon">🔄</div>
          <div class="file-drop__title">Arrastrá un PDF acá</div>
          <div class="file-drop__sub">o hacé click para elegir</div>
          <div class="file-drop__name" id="pr-name"></div>
        </div>
        </div>
        <div id="pr-editor" style="display:none">
          <div class="pr-topbar">
            <div class="pr-topbar__info">
              <span id="pr-filename" style="font-family:var(--mono);font-size:.78rem;color:var(--fg2)"></span>
              <span id="pr-pages-info" style="font-family:var(--mono);font-size:.7rem;color:var(--fg3);margin-left:.6rem"></span>
            </div>
            <button class="btn btn--sec" onclick="ToolFn.prReset()" style="font-size:.7rem;padding:.25rem .6rem">✕ Cambiar PDF</button>
          </div>
          <div class="pr-workspace">
            <div class="pr-sidebar" id="pr-sidebar">
              <p style="font-size:.62rem;color:var(--fg3);font-family:var(--mono);text-transform:uppercase;letter-spacing:1px;margin-bottom:.5rem">Páginas</p>
              <div id="pr-thumbs"></div>
            </div>
            <div class="pr-panel">
              <p style="font-size:.62rem;color:var(--fg3);font-family:var(--mono);text-transform:uppercase;letter-spacing:1px;margin-bottom:.7rem">Opciones de rotación</p>

              <label>Modo</label>
              <div class="pr-deg-group" style="margin-bottom:.6rem">
                <button class="pr-mode-btn active" onclick="ToolFn.prSetMode('rotate',this)">🔄 Rotar</button>
                <button class="pr-mode-btn" onclick="ToolFn.prSetMode('mirror-h',this)">↔ Espejo H</button>
                <button class="pr-mode-btn" onclick="ToolFn.prSetMode('mirror-v',this)">↕ Espejo V</button>
              </div>

              <div id="pr-rotate-opts">
                <label>Ángulo: <span id="pr-deg-label" style="color:var(--accent);font-family:var(--mono)">90°</span></label>
                <input type="range" id="pr-deg-slider" min="0" max="359" value="90" step="1"
                  oninput="ToolFn.prOnSlider(this.value)"
                  style="width:100%;margin:.3rem 0 .2rem;accent-color:var(--accent)">
                <div class="pr-deg-group" style="margin-top:.35rem">
                  <button class="pr-deg-btn active" onclick="ToolFn.prSnapDeg(90)">90°</button>
                  <button class="pr-deg-btn" onclick="ToolFn.prSnapDeg(180)">180°</button>
                  <button class="pr-deg-btn" onclick="ToolFn.prSnapDeg(270)">270°</button>
                </div>
              </div>

              <label style="margin-top:.9rem">Páginas</label>
              <div class="pr-scope-group">
                <button class="pr-scope-btn active" onclick="ToolFn.prSetScope('all',this)">Todas</button>
                <button class="pr-scope-btn" onclick="ToolFn.prSetScope('sel',this)">Selección</button>
                <button class="pr-scope-btn" onclick="ToolFn.prSetScope('range',this)">Rango</button>
              </div>
              <div id="pr-range-row" style="display:none;margin-top:.5rem">
                <input type="text" id="pr-range" placeholder="ej: 1, 3, 5-7" oninput="ToolFn.prUpdatePreview()">
              </div>
              <div id="pr-sel-hint" style="display:none;font-size:.7rem;color:var(--fg3);font-family:var(--mono);margin-top:.4rem">✦ Hacé click en las miniaturas para seleccionar</div>
              <div style="margin-top:.9rem;padding:.6rem;background:var(--bg3);border-radius:8px;border:1px solid var(--border)">
                <p style="font-size:.62rem;color:var(--fg3);font-family:var(--mono);text-transform:uppercase;letter-spacing:1px;margin-bottom:.35rem">Preview</p>
                <div id="pr-preview-wrap" style="display:flex;gap:.5rem;align-items:center;flex-wrap:wrap;min-height:60px">
                  <span style="font-size:.72rem;color:var(--fg3);font-family:var(--mono)">seleccioná páginas para previsualizar</span>
                </div>
              </div>
              <div class="btn-row" style="margin-top:.9rem">
                <button class="btn" onclick="ToolFn.prRotate()">🔄 Rotar y descargar</button>
              </div>
              ${loaderHtml}${resultHtml}
            </div>
          </div>
        </div>`;
    },

    /* ── PDF DELETE PAGES ── */
    'pdf-delete-p': () => {
      const loaderHtml = loader('pd-loader','⏳ eliminando páginas...');
      const resultHtml = result('pd-result');
      return `<div id="pd-upload-screen">` +
        infoBox('Hacé click en las miniaturas para seleccionar las páginas a eliminar. Preview de lo que queda.') +
        `<input type="file" id="pd-file" accept="application/pdf" style="display:none" onchange="ToolFn.pdLoad()">
        <div class="file-drop" onclick="document.getElementById('pd-file').click()" ondragover="event.preventDefault();this.classList.add('drag-over')" ondragleave="this.classList.remove('drag-over')" ondrop="event.preventDefault();this.classList.remove('drag-over');document.getElementById('pd-file').files=event.dataTransfer.files;ToolFn.pdLoad()">
          <div class="file-drop__icon">🗑️</div>
          <div class="file-drop__title">Arrastrá un PDF acá</div>
          <div class="file-drop__sub">o hacé click para elegir</div>
          <div class="file-drop__name" id="pd-name"></div>
        </div>
        </div>
        <div id="pd-editor" style="display:none">
          <div class="pr-topbar">
            <div class="pr-topbar__info">
              <span id="pd-filename" style="font-family:var(--mono);font-size:.78rem;color:var(--fg2)"></span>
              <span id="pd-pages-info" style="font-family:var(--mono);font-size:.7rem;color:var(--fg3);margin-left:.6rem"></span>
            </div>
            <button class="btn btn--sec" onclick="ToolFn.pdReset()" style="font-size:.7rem;padding:.25rem .6rem">✕ Cambiar PDF</button>
          </div>
          <div class="pr-workspace">
            <div class="pr-sidebar" id="pd-sidebar">
              <p style="font-size:.62rem;color:var(--fg3);font-family:var(--mono);text-transform:uppercase;letter-spacing:1px;margin-bottom:.5rem">Páginas</p>
              <p style="font-size:.65rem;color:var(--accent2);font-family:var(--mono);margin-bottom:.4rem">Click = marcar para borrar</p>
              <div id="pd-thumbs"></div>
            </div>
            <div class="pr-panel">
              <p style="font-size:.62rem;color:var(--fg3);font-family:var(--mono);text-transform:uppercase;letter-spacing:1px;margin-bottom:.5rem">Páginas marcadas para borrar</p>
              <div id="pd-sel-info" style="font-size:.75rem;color:var(--accent2);font-family:var(--mono);margin-bottom:.6rem;min-height:1.2rem">ninguna</div>
              <div style="margin-bottom:.7rem;padding:.6rem;background:var(--bg3);border-radius:8px;border:1px solid var(--border)">
                <p style="font-size:.62rem;color:var(--fg3);font-family:var(--mono);text-transform:uppercase;letter-spacing:1px;margin-bottom:.35rem">Quedará</p>
                <div id="pd-keep-info" style="font-size:.75rem;color:var(--accent);font-family:var(--mono)">—</div>
              </div>
              <div class="btn-row">
                <button class="btn" onclick="ToolFn.pdDelete()">🗑️ Borrar páginas y descargar</button>
              </div>
              ${loaderHtml}${resultHtml}
            </div>
          </div>
        </div>`;
    },

    /* ── PDF OCR ── */
    'pdf-ocr': () =>
      infoBox('Extraé texto de imágenes o PDFs escaneados con <b>Tesseract.js</b>. Para PDFs: elegí qué páginas escanear.') +
      `<input type="file" id="po-file" accept="image/*,application/pdf" style="display:none" onchange="ToolFn.poLoad()">` +
      `<div class="file-drop" onclick="document.getElementById('po-file').click()" ondragover="event.preventDefault();this.classList.add('drag-over')" ondragleave="this.classList.remove('drag-over')" ondrop="event.preventDefault();this.classList.remove('drag-over');document.getElementById('po-file').files=event.dataTransfer.files;ToolFn.poLoad()">
        <div class="file-drop__icon">🔍</div>
        <div class="file-drop__title">Arrastrá una imagen o PDF acá</div>
        <div class="file-drop__sub">o hacé click · JPG, PNG, PDF</div>
        <div class="file-drop__name" id="po-name"></div>
      </div>` +
      `<div id="po-info" style="display:none">
        <label>Idioma del texto en la imagen</label>` +
      sel('po-lang',[['spa','Español'],['eng','Inglés'],['por','Portugués'],['fra','Francés'],['deu','Alemán']]) +
      `<div id="po-pdf-opts" style="display:none;margin-top:.5rem">
          <label>Páginas a escanear</label>
          <div class="pr-scope-group">
            <button class="pr-scope-btn active" id="po-scope-all" onclick="ToolFn.poSetScope('all',this)">Todas</button>
            <button class="pr-scope-btn" id="po-scope-sel" onclick="ToolFn.poSetScope('sel',this)">Selección</button>
          </div>
          <p id="po-sel-hint" style="display:none;font-size:.7rem;color:var(--fg3);font-family:var(--mono);margin-top:.3rem">✦ Hacé click en las miniaturas para seleccionar</p>
          <div id="po-thumbs" style="display:flex;flex-wrap:wrap;gap:.4rem;margin-top:.5rem"></div>
        </div>
        <div class="btn-row"><button class="btn" onclick="ToolFn.poOCR()">🔍 Extraer texto</button></div>
      </div>` +
      loader('po-loader','⏳ analizando con OCR...') +
      `<div id="po-progress-wrap" style="margin:.4rem 0;display:none">
        <div style="display:flex;justify-content:space-between;font-size:.7rem;color:var(--fg3);font-family:var(--mono);margin-bottom:.2rem">
          <span id="po-progress-label">Procesando...</span>
          <span id="po-progress-pct">0%</span>
        </div>
        <div style="background:var(--bg3);border-radius:30px;height:5px;overflow:hidden">
          <div id="po-progress-bar" style="height:100%;background:linear-gradient(90deg,var(--accent),var(--accent2));border-radius:30px;transition:width .3s;width:0%"></div>
        </div>
      </div>` +
      `<div id="po-progress" style="font-size:.72rem;color:var(--accent);font-family:var(--mono);margin:.3rem 0;min-height:1rem"></div>` +
      `<div class="result-area" id="po-result" style="display:none;max-height:260px;overflow-y:auto"></div>` +
      copyRow('po-result'),

    /* ── BACKGROUND REMOVE (chroma-key local) ── */
    'bg-remove': () =>
      infoBox('Quitá el fondo de una imagen <b>por color</b> — sin IA, sin subir nada a ningún servidor. Funciona mejor con fondos lisos (fotos de producto, logos). Hacé click sobre el fondo en la imagen para elegir el color a quitar.') +
      `<input type="file" id="bg-file" accept="image/*" style="display:none" onchange="ToolFn.bgLoad()">` +
      `<div class="file-drop" id="bg-drop" onclick="document.getElementById('bg-file').click()" ondragover="event.preventDefault();this.classList.add('drag-over')" ondragleave="this.classList.remove('drag-over')" ondrop="event.preventDefault();this.classList.remove('drag-over');document.getElementById('bg-file').files=event.dataTransfer.files;ToolFn.bgLoad()">
        <div class="file-drop__icon">✂️</div>
        <div class="file-drop__title">Arrastrá una imagen acá</div>
        <div class="file-drop__sub">o hacé click para elegir · ideal con fondo liso</div>
        <div class="file-drop__name" id="bg-name"></div>
      </div>` +
      `<div id="bg-info" style="display:none">
        <div class="bg-canvas-wrap">
          <canvas id="bg-canvas"></canvas>
        </div>
        <div style="display:flex;align-items:center;gap:.6rem;margin:.6rem 0">
          <span style="font-size:.72rem;color:var(--fg3);font-family:var(--mono)">Color de fondo</span>
          <span id="bg-color-swatch" style="width:22px;height:22px;border-radius:6px;border:1.5px solid var(--border);display:inline-block"></span>
          <span id="bg-color-hex" style="font-family:var(--mono);font-size:.75rem;color:var(--fg2)"></span>
        </div>
        <label>Tolerancia: <span id="bg-tol-val">40</span></label>
        <input type="range" min="0" max="120" value="40" id="bg-tol" oninput="document.getElementById('bg-tol-val').textContent=this.value;ToolFn.bgApply()" style="width:100%">
        <div class="btn-row">
          <button class="btn" onclick="ToolFn.bgDownload()">⬇️ Descargar PNG</button>
          <button class="btn btn--sec" onclick="ToolFn.bgAutoDetect()">🎯 Auto-detectar (esquinas)</button>
        </div>
      </div>`,

    /* ── AI SUMMARIZE ── */
    'ai-summarize': () =>
      infoBox('Resumí cualquier texto con <b>IA</b>. Pegá el texto, elegí el largo del resumen y listo.') +
      label('Texto a resumir') +
      ta('ai-sum-input','Pegá el texto que querés resumir...','style="min-height:140px"') +
      label('Largo del resumen') +
      sel('ai-sum-len',[['corto','Corto (2-3 líneas)'],['medio','Medio (un párrafo)'],['largo','Largo (detallado)']]) +
      `<div class="btn-row"><button class="btn" onclick="ToolFn.aiSummarize()">✂️ Resumir</button></div>` +
      loader('ai-sum-loader','⏳ pensando...') +
      result('ai-sum-result') +
      copyRow('ai-sum-result'),

    /* ── AI CORRECT ── */
    'ai-correct': () =>
      infoBox('Corregí ortografía, gramática y puntuación de cualquier texto con <b>IA</b>.') +
      label('Texto a corregir') +
      ta('ai-cor-input','Pegá el texto que querés corregir...','style="min-height:140px"') +
      `<div class="btn-row"><button class="btn" onclick="ToolFn.aiCorrect()">✏️ Corregir</button></div>` +
      loader('ai-cor-loader','⏳ corrigiendo...') +
      result('ai-cor-result') +
      copyRow('ai-cor-result'),

    /* ── AI TRANSLATE ── */
    'ai-translate': () =>
      infoBox('Traducí cualquier texto a más de 10 idiomas con <b>IA</b>.') +
      label('Texto a traducir') +
      ta('ai-tr-input','Pegá el texto que querés traducir...','style="min-height:120px"') +
      label('Idioma destino') +
      sel('ai-tr-lang', I18n.get().langs.map(l => [l, l])) +
      `<div class="btn-row"><button class="btn" onclick="ToolFn.aiTranslate()">🌐 Traducir</button></div>` +
      loader('ai-tr-loader','⏳ traduciendo...') +
      result('ai-tr-result') +
      copyRow('ai-tr-result'),

    /* ── AI EXPAND ── */
    'ai-expand': () =>
      infoBox('Expandí un texto corto agregando más detalle y desarrollo con <b>IA</b>.') +
      label('Texto a expandir') +
      ta('ai-exp-input','Pegá el texto que querés expandir...','style="min-height:120px"') +
      `<div class="btn-row"><button class="btn" onclick="ToolFn.aiExpand()">📝 Expandir</button></div>` +
      loader('ai-exp-loader','⏳ escribiendo...') +
      result('ai-exp-result') +
      copyRow('ai-exp-result'),

    /* ── COBALT DL ── */
    'cobalt-dl': () => {
      const platforms = [
        { name:'YouTube',    icon:'▶️', hint:'youtube.com / youtu.be' },
        { name:'TikTok',     icon:'🎵', hint:'tiktok.com' },
        { name:'Instagram',  icon:'📸', hint:'instagram.com' },
        { name:'Twitter/X',  icon:'🐦', hint:'x.com / twitter.com' },
        { name:'Reddit',     icon:'🟠', hint:'reddit.com' },
        { name:'SoundCloud', icon:'☁️', hint:'soundcloud.com' },
        { name:'Twitch',     icon:'💜', hint:'twitch.tv clips' },
        { name:'Vimeo',      icon:'🎞️', hint:'vimeo.com' },
      ];
      const platformsHtml = platforms.map(p =>
        `<div title="${p.hint}" style="display:flex;flex-direction:column;align-items:center;gap:.2rem;cursor:default">
          <span style="font-size:1.3rem">${p.icon}</span>
          <span style="font-size:.58rem;font-family:var(--mono);color:var(--fg3)">${p.name}</span>
        </div>`
      ).join('');

      return infoBox(`Motor: <a href="https://cobalt.tools" target="_blank" rel="noopener">cobalt.tools</a> — procesamiento 100% del lado del servidor, sin guardar tus archivos.`) +
      `<div style="display:flex;gap:.9rem;flex-wrap:wrap;margin-bottom:1rem;padding:.7rem;background:var(--bg3);border-radius:10px;border:1px solid var(--border)">${platformsHtml}</div>` +

      label('URL del video, audio o post') +
      `<div style="position:relative">
        <input type="text" id="dl-url" placeholder="https://youtube.com/watch?v=..." oninput="ToolFn.dlValidateUrl()" autocomplete="off" spellcheck="false" style="padding-right:2.5rem">
        <span id="dl-url-status" style="position:absolute;right:.7rem;top:50%;transform:translateY(-50%);font-size:1rem;transition:opacity .2s;opacity:0"></span>
      </div>` +

      `<div id="dl-meta" style="display:none;margin:.5rem 0;padding:.7rem .9rem;background:var(--bg3);border-radius:10px;border:1px solid var(--border);animation:fadeIn .2s">
        <div style="display:flex;gap:.8rem;align-items:flex-start">
          <img id="dl-thumb" src="" alt="thumbnail" style="width:80px;height:56px;object-fit:cover;border-radius:6px;border:1px solid var(--border);flex-shrink:0;display:none">
          <div style="min-width:0;flex:1">
            <div id="dl-meta-title" style="font-family:var(--mono);font-size:.78rem;color:var(--fg2);font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis"></div>
            <div id="dl-meta-site" style="font-size:.68rem;color:var(--fg3);font-family:var(--mono);margin-top:.2rem"></div>
          </div>
        </div>
      </div>` +

      `<div style="display:grid;grid-template-columns:1fr 1fr;gap:.6rem;margin-top:.5rem">
        <div>
          <label style="margin-top:0">Modo</label>
          <select id="dl-mode" onchange="ToolFn.dlToggleMode()">
            <option value="auto">🎬 Video + audio</option>
            <option value="audio">🎵 Solo audio</option>
            <option value="mute">🔇 Solo video (sin audio)</option>
          </select>
        </div>
        <div id="dl-quality-col">
          <label style="margin-top:0">Calidad de video</label>
          <select id="dl-quality">
            <option value="max">Máxima disponible</option>
            <option value="1080" selected>1080p Full HD</option>
            <option value="720">720p HD</option>
            <option value="480">480p</option>
            <option value="360">360p</option>
          </select>
        </div>
        <div id="dl-audio-col" style="display:none">
          <label style="margin-top:0">Formato de audio</label>
          <select id="dl-audiofmt">
            <option value="mp3">MP3 (compatible universal)</option>
            <option value="ogg">OGG (libre)</option>
            <option value="opus">Opus (alta compresión)</option>
            <option value="wav">WAV (sin pérdida)</option>
            <option value="best">Mejor disponible</option>
          </select>
        </div>
        <div id="dl-bitrate-col" style="display:none">
          <label style="margin-top:0">Bitrate</label>
          <select id="dl-bitrate">
            <option value="320">320 kbps (máxima)</option>
            <option value="256">256 kbps</option>
            <option value="128" selected>128 kbps (estándar)</option>
            <option value="96">96 kbps (ligero)</option>
            <option value="64">64 kbps (muy ligero)</option>
          </select>
        </div>
      </div>` +

      `<div class="btn-row">
        <button class="btn" id="dl-btn" onclick="ToolFn.cobaltDl()">⬇️ Obtener enlace de descarga</button>
      </div>` +
      loader('dl-loader', '⏳ procesando...') +
      `<div id="dl-result" style="margin-top:.6rem"></div>` +
      `<style>
        @keyframes fadeIn { from { opacity:0; transform:translateY(-4px) } to { opacity:1; transform:translateY(0) } }
        #dl-url-status.ok  { opacity:1; }
        #dl-url-status.err { opacity:1; }
      </style>`;
    },

    /* ── QR GEN ── */
    'qr-gen': () =>
      infoBox('Preview en vivo mientras escribís. Personalizá colores y tamaño. Se genera 100% local, sin conexión a ningún servicio externo.') +
      label('Contenido del QR') +
      `<input type="text" id="qr-input" placeholder="https://... o cualquier texto" oninput="ToolFn.liveQR()">` +
      `<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:.6rem;margin-top:.5rem">` +
      `<div><label style="margin-top:0">Tamaño</label>${sel('qr-size',[['150','150px'],['250','250px'],['400','400px']])}</div>` +
      `<div><label style="margin-top:0">Fondo</label><input type="color" id="qr-bg" value="#ffffff" oninput="ToolFn.liveQR()" style="width:100%;height:36px;padding:2px;border-radius:var(--radius-sm);cursor:pointer;border:1.5px solid var(--border)"></div>` +
      `<div><label style="margin-top:0">Color QR</label><input type="color" id="qr-fg" value="#000000" oninput="ToolFn.liveQR()" style="width:100%;height:36px;padding:2px;border-radius:var(--radius-sm);cursor:pointer;border:1.5px solid var(--border)"></div>` +
      `</div>` +
      `<div id="qr-preview-wrap" style="margin:.9rem 0;text-align:center;display:none">
        <canvas id="qr-live" style="border-radius:10px;border:2px solid var(--border);width:180px;height:180px;image-rendering:pixelated" aria-label="QR preview"></canvas>
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
        ${'EyeDropper' in window ? `<button class="btn btn--sec" onclick="ToolFn.pickScreenColor()" title="Elegir color de la pantalla" aria-label="Elegir color de la pantalla" style="padding:.5rem .6rem">💧</button>` : ''}
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
      infoBox('Codificá texto a Base64 o decodificá Base64 a texto. También podés codificar un archivo entero. Útil para desarrollo.') +
      `<div class="pr-scope-group">
        <button class="pr-scope-btn active" id="b64-mode-text" onclick="ToolFn.b64SetMode('text')">Texto</button>
        <button class="pr-scope-btn" id="b64-mode-file" onclick="ToolFn.b64SetMode('file')">Archivo</button>
      </div>` +
      `<div id="b64-text-panel" style="margin-top:.6rem">` +
        label('Texto') + ta('b64-input','Texto normal o Base64...') +
        `<div class="btn-row">
          <button class="btn" onclick="ToolFn.b64Action('enc')">Codificar → Base64</button>
          <button class="btn btn--sec" onclick="ToolFn.b64Action('dec')">Decodificar ← Base64</button>
        </div>` +
      `</div>` +
      `<div id="b64-file-panel" style="display:none;margin-top:.6rem">
        <input type="file" id="b64-file" style="display:none" onchange="ToolFn.b64FileLoad()">
        <div class="file-drop" onclick="document.getElementById('b64-file').click()" ondragover="event.preventDefault();this.classList.add('drag-over')" ondragleave="this.classList.remove('drag-over')" ondrop="event.preventDefault();this.classList.remove('drag-over');document.getElementById('b64-file').files=event.dataTransfer.files;ToolFn.b64FileLoad()">
          <div class="file-drop__icon">💾</div>
          <div class="file-drop__title">Arrastrá cualquier archivo acá</div>
          <div class="file-drop__sub">o hacé click para elegir</div>
          <div class="file-drop__name" id="b64-file-name"></div>
        </div>
      </div>` +
      result('b64-result') + copyRow('b64-result'),

    /* ── HASH GEN ── */
    'hash-gen': () =>
      infoBox('Generá un hash criptográfico de un texto o de un archivo. Útil para verificar integridad.') +
      `<div class="pr-scope-group">
        <button class="pr-scope-btn active" id="hash-mode-text" onclick="ToolFn.hashSetMode('text')">Texto</button>
        <button class="pr-scope-btn" id="hash-mode-file" onclick="ToolFn.hashSetMode('file')">Archivo</button>
      </div>` +
      `<div id="hash-text-panel" style="margin-top:.6rem">${label('Texto')}${ta('hash-input','Texto a hashear...')}</div>` +
      `<div id="hash-file-panel" style="display:none;margin-top:.6rem">
        <input type="file" id="hash-file" style="display:none" onchange="ToolFn._dropName('hash-file')">
        <div class="file-drop" onclick="document.getElementById('hash-file').click()" ondragover="event.preventDefault();this.classList.add('drag-over')" ondragleave="this.classList.remove('drag-over')" ondrop="event.preventDefault();this.classList.remove('drag-over');document.getElementById('hash-file').files=event.dataTransfer.files;ToolFn._dropName('hash-file')">
          <div class="file-drop__icon">🔐</div>
          <div class="file-drop__title">Arrastrá cualquier archivo acá</div>
          <div class="file-drop__sub">o hacé click para elegir</div>
          <div class="file-drop__name" id="hash-file-name"></div>
        </div>
      </div>` +
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
      `<div style="display:flex;gap:.8rem;align-items:center;flex-wrap:wrap;margin-top:.6rem">
        <div style="display:flex;align-items:center;gap:.4rem">
          <label style="margin:0;white-space:nowrap">Cantidad</label>
          <input type="number" id="uuid-count" value="1" min="1" max="50" style="width:70px">
        </div>
        <label style="display:flex;align-items:center;gap:.4rem;font-size:.8rem;cursor:pointer;margin:0">
          <input type="checkbox" id="uuid-no-dash"> sin guiones
        </label>
      </div>` +
      `<div class="btn-row">
        <button class="btn" onclick="ToolFn.genUUIDs()">🆔 Generar</button>
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

    /* ── REGEX TESTER ── */
    'regex-test': () =>
      infoBox('Probá expresiones regulares en vivo — las coincidencias se resaltan en el texto a medida que escribís. Todo corre en tu navegador.') +
      label('Patrón') +
      `<div style="display:flex;gap:.4rem;align-items:center">
        <span style="font-family:var(--mono);color:var(--fg3)">/</span>
        <input type="text" id="rx-pattern" placeholder="[a-z]+" oninput="ToolFn.regexRun()" style="flex:1;font-family:var(--mono)">
        <span style="font-family:var(--mono);color:var(--fg3)">/</span>
      </div>` +
      `<div style="display:flex;gap:.9rem;flex-wrap:wrap;margin:.5rem 0">
        ${['g','i','m','s'].map(f => `<label style="display:flex;align-items:center;gap:.3rem;font-size:.78rem;cursor:pointer;margin:0"><input type="checkbox" id="rx-flag-${f}" ${f==='g'?'checked':''} onchange="ToolFn.regexRun()"> ${f}</label>`).join('')}
      </div>` +
      label('Texto de prueba') +
      ta('rx-test','Pegá el texto donde probar la regex...','style="min-height:120px" oninput="ToolFn.regexRun()"') +
      `<div id="rx-info" style="font-size:.72rem;color:var(--fg3);font-family:var(--mono);margin:.5rem 0;min-height:1rem"></div>` +
      `<div class="result-area" id="rx-result"></div>` +
      `<div id="rx-groups" style="margin-top:.5rem;font-size:.72rem;font-family:var(--mono);color:var(--fg2);max-height:140px;overflow-y:auto"></div>`,

    /* ── LOREM IPSUM ── */
    'lorem-gen': () =>
      infoBox('Generá texto de relleno <b>Lorem Ipsum</b> para maquetas y prototipos.') +
      `<div style="display:grid;grid-template-columns:1fr 1fr;gap:.6rem">
        <div><label style="margin-top:0">Cantidad</label><input type="number" id="lorem-count" value="3" min="1" max="200"></div>
        <div><label style="margin-top:0">Unidad</label>${sel('lorem-unit',[['parrafos','Párrafos'],['oraciones','Oraciones'],['palabras','Palabras']])}</div>
      </div>` +
      `<label style="display:flex;align-items:center;gap:.5rem;font-size:.8rem;cursor:pointer;margin-top:.6rem">
        <input type="checkbox" id="lorem-classic" checked> Empezar con "Lorem ipsum dolor sit amet..."
      </label>` +
      `<div class="btn-row"><button class="btn" onclick="ToolFn.loremGenerate()">¶ Generar</button></div>` +
      result('lorem-result') + copyRow('lorem-result'),

    /* ── SLUGIFY ── */
    'slugify': () =>
      infoBox('Convertí cualquier texto en un slug apto para URLs: minúsculas, sin tildes ni símbolos, separado por guiones.') +
      label('Texto') +
      `<input type="text" id="slug-input" placeholder="Mi Título de Artículo: ¡Genial!" oninput="ToolFn.slugifyLive()">` +
      `<div class="result-area" id="slug-output" style="font-family:var(--mono);text-align:center;margin-top:.7rem">—</div>` +
      `<div class="btn-row"><button class="btn btn--sec" onclick="UI.copyText(document.getElementById('slug-output').textContent,this)">Copiar</button></div>`,

    /* ── IMAGE DOMINANT COLOR PALETTE ── */
    'img-palette': () =>
      infoBox('Subí una imagen y extraé sus colores dominantes automáticamente. 100% local.') +
      `<input type="file" id="ip-file" accept="image/*" style="display:none" onchange="ToolFn.imgPaletteLoad()">` +
      `<div class="file-drop" id="ip-drop" onclick="document.getElementById('ip-file').click()" ondragover="event.preventDefault();this.classList.add('drag-over')" ondragleave="this.classList.remove('drag-over')" ondrop="event.preventDefault();this.classList.remove('drag-over');document.getElementById('ip-file').files=event.dataTransfer.files;ToolFn.imgPaletteLoad()">
        <div class="file-drop__icon">🖌️</div>
        <div class="file-drop__title">Arrastrá una imagen acá</div>
        <div class="file-drop__sub">o hacé click para elegir</div>
        <div class="file-drop__name" id="ip-name"></div>
      </div>` +
      `<div id="ip-info" style="display:none">
        <img id="ip-preview" style="width:100%;max-height:180px;object-fit:contain;border-radius:10px;border:1.5px solid var(--border);margin:.6rem 0;background:var(--bg3)" alt="preview">
        <label>Cantidad de colores: <span id="ip-count-val">6</span></label>
        <input type="range" min="3" max="10" value="6" id="ip-count" oninput="document.getElementById('ip-count-val').textContent=this.value;ToolFn.imgPaletteExtract()" style="width:100%">
        <div id="ip-result" class="pal-grid" style="display:none;margin-top:.8rem"></div>
      </div>`,

    /* ── PASSWORD GENERATOR ── */
    'pwd-gen': () =>
      infoBox('Generá contraseñas seguras usando <b>crypto.getRandomValues</b>. Todo se genera en tu navegador, nunca se envía a ningún servidor.') +
      `<div class="pwd-display" id="pwd-out">—</div>` +
      `<div style="margin:.6rem 0">
        <div class="pwd-strength-bar"><div class="pwd-strength-bar__fill" id="pwd-strength-fill"></div></div>
        <p id="pwd-strength-label" style="font-size:.7rem;font-family:var(--mono);color:var(--fg3);margin-top:.3rem"></p>
      </div>` +
      label('Longitud: <span id="pwd-len-val">16</span> caracteres') +
      `<input type="range" min="6" max="64" value="16" id="pwd-len" oninput="document.getElementById('pwd-len-val').textContent=this.value;ToolFn.pwdGenerate()" style="width:100%">` +
      `<div style="display:grid;grid-template-columns:1fr 1fr;gap:.3rem .6rem;margin:.7rem 0">
        <label style="display:flex;align-items:center;gap:.4rem;font-size:.78rem;cursor:pointer;margin:0"><input type="checkbox" id="pwd-lower" checked onchange="ToolFn.pwdGenerate()"> minúsculas (a-z)</label>
        <label style="display:flex;align-items:center;gap:.4rem;font-size:.78rem;cursor:pointer;margin:0"><input type="checkbox" id="pwd-upper" checked onchange="ToolFn.pwdGenerate()"> MAYÚSCULAS (A-Z)</label>
        <label style="display:flex;align-items:center;gap:.4rem;font-size:.78rem;cursor:pointer;margin:0"><input type="checkbox" id="pwd-num" checked onchange="ToolFn.pwdGenerate()"> números (0-9)</label>
        <label style="display:flex;align-items:center;gap:.4rem;font-size:.78rem;cursor:pointer;margin:0"><input type="checkbox" id="pwd-sym" checked onchange="ToolFn.pwdGenerate()"> símbolos (!@#$…)</label>
      </div>` +
      `<div class="btn-row">
        <button class="btn" onclick="ToolFn.pwdGenerate()">🔑 Generar otra</button>
        <button class="btn btn--sec" onclick="UI.copyText(document.getElementById('pwd-out').textContent,this)">Copiar</button>
      </div>`,

    /* ── JSON FORMATTER ── */
    'json-fmt': () =>
      infoBox('Pegá un JSON para formatearlo, validarlo o minificarlo. Todo se procesa en tu navegador.') +
      label('JSON') +
      ta('json-input','{"ejemplo": [1, 2, 3]}','style="min-height:140px;font-family:var(--mono)"') +
      `<div class="btn-row">
        <button class="btn" onclick="ToolFn.jsonFormat('pretty')">🧾 Formatear</button>
        <button class="btn btn--sec" onclick="ToolFn.jsonFormat('minify')">Minificar</button>
      </div>` +
      `<div id="json-stats" style="font-size:.72rem;color:var(--fg3);font-family:var(--mono);margin-top:.4rem;min-height:1rem"></div>` +
      result('json-result') +
      copyRow('json-result'),

    /* ── TEXT DIFF ── */
    'text-diff': () =>
      infoBox('Compará dos textos y mirá las diferencias: <span class="diff-ins">agregado</span> y <span class="diff-del">eliminado</span>.') +
      `<div class="pr-scope-group">
        <button class="pr-scope-btn active" id="diff-mode-word" onclick="ToolFn.diffSetMode('word')">Por palabra</button>
        <button class="pr-scope-btn" id="diff-mode-line" onclick="ToolFn.diffSetMode('line')">Por línea</button>
      </div>` +
      `<div class="diff-cols" style="margin-top:.6rem">
        <div>${label('Texto A')}${ta('diff-a','Texto original...','style="min-height:110px"')}</div>
        <div>${label('Texto B')}${ta('diff-b','Texto nuevo...','style="min-height:110px"')}</div>
      </div>` +
      `<div class="btn-row"><button class="btn" onclick="ToolFn.textDiffRun()">🆚 Comparar</button></div>` +
      `<div id="diff-stats" style="font-size:.72rem;color:var(--fg3);font-family:var(--mono);margin-top:.4rem;min-height:1rem"></div>` +
      result('diff-result'),

    /* ── UNIT CONVERTER ── */
    'unit-conv': () =>
      infoBox('Convertí entre unidades de uso común al instante.') +
      label('Categoría') +
      `<select id="uc-cat" onchange="ToolFn.unitCatChange()">
        <option value="longitud">📏 Longitud</option>
        <option value="peso">⚖️ Peso</option>
        <option value="volumen">🧪 Volumen</option>
        <option value="velocidad">🚀 Velocidad</option>
        <option value="temperatura">🌡️ Temperatura</option>
      </select>` +
      `<div style="display:grid;grid-template-columns:1fr auto 1fr;gap:.5rem;align-items:end;margin-top:.6rem">
        <div>
          <label style="margin-top:0">Desde</label>
          <input type="number" id="uc-val" value="1" oninput="ToolFn.unitConvert()">
          <select id="uc-from" onchange="ToolFn.unitConvert()" style="margin-top:.35rem"></select>
        </div>
        <button class="btn btn--sec" onclick="ToolFn.unitSwap()" style="padding:.5rem .6rem;margin-bottom:.05rem" title="Invertir" aria-label="Invertir unidades">⇄</button>
        <div>
          <label style="margin-top:0">Hacia</label>
          <input type="text" id="uc-out" readonly style="text-align:center;font-family:var(--mono);font-weight:700;color:var(--accent)">
          <select id="uc-to" onchange="ToolFn.unitConvert()" style="margin-top:.35rem"></select>
        </div>
      </div>` +
      `<div class="btn-row"><button class="btn btn--sec" onclick="UI.copyText(document.getElementById('uc-out').value,this)">Copiar resultado</button></div>`,

    /* ── COUNTDOWN / POMODORO TIMER ── */
    'countdown-timer': () =>
      infoBox('Temporizador de cuenta regresiva con presets Pomodoro. Suena una alarma al terminar.') +
      `<div class="timer-display" id="ct-display">25:00</div>` +
      `<div style="background:var(--bg3);border-radius:30px;height:6px;overflow:hidden;margin:.7rem 0">
        <div id="ct-bar" style="height:100%;background:linear-gradient(90deg,var(--accent),var(--accent2));border-radius:30px;transition:width .2s;width:100%"></div>
      </div>` +
      `<div class="btn-row" style="justify-content:center">
        <button class="btn" id="ct-start" onclick="ToolFn.ctToggle()">Iniciar</button>
        <button class="btn btn--sec" onclick="ToolFn.ctReset()">Resetear</button>
      </div>` +
      `<div style="display:flex;flex-wrap:wrap;gap:.35rem;margin-top:.9rem">
        <button class="btn btn--sec" onclick="ToolFn.ctSetPreset(25)" style="font-size:.72rem;padding:.3rem .6rem">🍅 25 min — Foco</button>
        <button class="btn btn--sec" onclick="ToolFn.ctSetPreset(5)" style="font-size:.72rem;padding:.3rem .6rem">☕ 5 min — Descanso</button>
        <button class="btn btn--sec" onclick="ToolFn.ctSetPreset(15)" style="font-size:.72rem;padding:.3rem .6rem">🛋️ 15 min — Descanso largo</button>
      </div>` +
      `<div style="display:flex;align-items:center;gap:.5rem;margin-top:.7rem">
        <label style="margin:0;white-space:nowrap">Personalizado (min)</label>
        <input type="number" id="ct-custom" min="1" max="180" placeholder="ej: 10" oninput="ToolFn.ctSetCustom()">
      </div>`,

    /* ── COLOR PALETTE GENERATOR ── */
    'palette-gen': () =>
      infoBox('Generá paletas de colores armónicas a partir de un color base. Hacé click en un color para copiar su HEX.') +
      `<div style="display:flex;gap:.5rem;align-items:center;margin-bottom:.5rem">
        <input type="text" id="pal-input" placeholder="#ff6ef7" value="#ff6ef7" style="flex:1">
        <input type="color" id="pal-picker" value="#ff6ef7" oninput="document.getElementById('pal-input').value=this.value" style="width:44px;height:38px;padding:2px;border-radius:8px;cursor:pointer;border:1.5px solid var(--border)">
      </div>` +
      label('Esquema') +
      sel('pal-scheme',[['complementario','Complementario'],['analogo','Análogo'],['triadico','Triádico'],['monocromatico','Monocromático'],['random','Aleatorio']]) +
      `<div class="btn-row"><button class="btn" onclick="ToolFn.paletteGenerate()">🌈 Generar paleta</button></div>` +
      `<div id="pal-result" class="pal-grid" style="display:none"></div>`,
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

  function _escHtml(s) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
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

  // JPEG no soporta transparencia: sin esto, los píxeles transparentes de un PNG
  // salen negros en vez de blancos al exportar a canvas.toBlob('image/jpeg', ...)
  function _drawOpaque(img) {
    const c = document.createElement('canvas');
    c.width = img.width; c.height = img.height;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.drawImage(img, 0, 0);
    return c;
  }

  function _doLiveCompress() {
    if (!_origFile) return;
    const q = document.getElementById('ic-q').value / 100;
    const img = new Image();
    img.onload = () => {
      const c = _drawOpaque(img);
      c.toBlob(blob => {
        const href = URL.createObjectURL(blob);
        const after = document.getElementById('ic-after');
        after.src = href;
        after.style.opacity = '1';
        const pct = Math.round((1 - blob.size / _origFile.size) * 100);
        document.getElementById('ic-after-size').textContent = fmtSize(blob.size);
        const red = document.getElementById('ic-reduction');
        const badge = document.getElementById('ic-reduction-badge');
        if (pct > 0) {
          red.textContent = `✅ Reducción estimada: ${pct}%`;
          red.style.color = 'var(--accent)';
          if (badge) badge.textContent = `-${pct}%`;
        } else {
          red.textContent = `⚠️ Sin reducción a esta calidad`;
          red.style.color = 'var(--fg3)';
          if (badge) badge.textContent = '';
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
      const c = _drawOpaque(img);
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
        const c = fmt === 'image/jpeg' ? _drawOpaque(img) : document.createElement('canvas');
        if (fmt !== 'image/jpeg') {
          c.width = img.width; c.height = img.height;
          c.getContext('2d').drawImage(img, 0, 0);
        }
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
            const c = _drawOpaque(img);
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
    if (typeof MediaRecorder === 'undefined' || !HTMLCanvasElement.prototype.captureStream) {
      document.getElementById('vc-result').innerHTML =
        '<span style="color:#ff8899">Tu navegador no soporta grabación de video en canvas. Probá con una versión reciente de Chrome, Firefox o Edge.</span>';
      Audio.error();
      return;
    }
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

// ── cobalt url validate ──
  let _dlDebounce;
  function dlValidateUrl() {
    clearTimeout(_dlDebounce);
    const inp = document.getElementById('dl-url');
    const status = document.getElementById('dl-url-status');
    const val = inp.value.trim();
    if (!val) { status.textContent = ''; status.className = ''; return; }
    _dlDebounce = setTimeout(() => {
      try {
        const u = new URL(val);
        const validHosts = [
          'youtube.com','youtu.be','www.youtube.com',
          'tiktok.com','www.tiktok.com',
          'instagram.com','www.instagram.com',
          'twitter.com','x.com','www.twitter.com','www.x.com',
          'reddit.com','www.reddit.com',
          'soundcloud.com','www.soundcloud.com',
          'twitch.tv','www.twitch.tv','clips.twitch.tv',
          'vimeo.com','www.vimeo.com',
          'dailymotion.com','www.dailymotion.com',
          'facebook.com','www.facebook.com',
          'bilibili.com','www.bilibili.com',
        ];
        const host = u.hostname.replace(/^www\./,'');
        const known = validHosts.some(h => u.hostname === h || u.hostname.endsWith('.'+h.replace(/^www\./,'')));
        if (known || u.protocol === 'https:') {
          status.textContent = '✓';
          status.style.color = 'var(--accent)';
          // mostrar meta simplificado (solo dominio + hint)
          document.getElementById('dl-meta').style.display = 'block';
          document.getElementById('dl-meta-title').textContent = val.length > 60 ? val.slice(0,57)+'…' : val;
          document.getElementById('dl-meta-site').textContent = u.hostname;
        } else {
          status.textContent = '⚠';
          status.style.color = 'var(--accent2)';
        }
      } catch(e) {
        status.textContent = '✕';
        status.style.color = '#ff8899';
        document.getElementById('dl-meta').style.display = 'none';
      }
    }, 350);
  }

  function dlToggleMode() {
    const mode = document.getElementById('dl-mode').value;
    const isAudio = mode === 'audio';
    document.getElementById('dl-quality-col').style.display  = isAudio ? 'none' : '';
    document.getElementById('dl-audio-col').style.display    = isAudio ? '' : 'none';
    document.getElementById('dl-bitrate-col').style.display  = isAudio ? '' : 'none';
  }

  async function cobaltDl() {
    const url  = document.getElementById('dl-url').value.trim();
    if (!url) {
      showResult('dl-result', '⚠️ Ingresá una URL para continuar.', true);
      return;
    }
    try { new URL(url); } catch(e) {
      showResult('dl-result', '⚠️ La URL no es válida. Verificá que empiece con https://', true);
      return;
    }

    const mode    = document.getElementById('dl-mode').value;
    const quality = document.getElementById('dl-quality').value;
    const audiofmt = document.getElementById('dl-audiofmt')?.value || 'mp3';
    const bitrate  = document.getElementById('dl-bitrate')?.value  || '128';
    const btn = document.getElementById('dl-btn');

    btn.disabled = true;
    btn.textContent = '⏳ Procesando...';
    toggleLoader('dl-loader', true);
    document.getElementById('dl-result').innerHTML = '';

    const body = {
      url,
      downloadMode: mode,
      videoQuality: mode !== 'audio' ? quality : undefined,
      audioFormat:  mode === 'audio' ? audiofmt : undefined,
      audioBitrate: mode === 'audio' ? bitrate : undefined,
      filenameStyle: 'pretty',
    };
    // limpiar keys undefined
    Object.keys(body).forEach(k => body[k] === undefined && delete body[k]);

    const ERRORS = {
      'error.api.auth.jwt.missing':    'Esta instancia requiere autenticación. Intentá en cobalt.tools directamente.',
      'error.api.auth.key.missing':    'Esta instancia requiere una API key.',
      'error.api.rate_exceeded':       'Demasiadas solicitudes. Esperá un momento e intentá de nuevo.',
      'error.api.content.too_long':    'El video es demasiado largo para procesar.',
      'error.api.fetch.short_link':    'No se pudo expandir el enlace corto.',
      'error.api.fetch.empty':         'No se encontró contenido en esa URL.',
      'error.api.fetch.fail':          'No se pudo obtener el contenido. La URL puede ser privada o inválida.',
      'error.api.link.unsupported':    'Esta plataforma no está soportada. Probá con YouTube, TikTok, Instagram u otras.',
      'error.api.content.video.unavailable': 'El video no está disponible (puede ser privado, eliminado o con restricción regional).',
      'error.api.content.age_restricted': 'El contenido tiene restricción de edad.',
      'error.proxy.fetch_failed': 'No se pudo conectar con el servicio de descarga. Puede estar temporalmente caído o bloqueando al servidor — probá de nuevo en un rato, o directamente en cobalt.tools.',
    };

    try {
      const r = await fetch(CONFIG.COBALT_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept':       'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await r.json();
      toggleLoader('dl-loader', false);
      btn.disabled = false;
      btn.textContent = '⬇️ Obtener enlace de descarga';

      if (!r.ok || data.status === 'error') {
        const code = data?.error?.code || '';
        const msg  = ERRORS[code] || (code ? `Error: ${code}` : 'No se pudo procesar esta URL.');
        const hint = code === 'error.api.link.unsupported'
          ? '<br><small style="color:var(--fg3);font-size:.7rem">Plataformas soportadas: YouTube, TikTok, Instagram, Twitter/X, Reddit, Vimeo, SoundCloud y más.</small>'
          : '<br><small style="color:var(--fg3);font-size:.7rem">Si el problema persiste, intentá directamente en <a href="https://cobalt.tools" target="_blank" style="color:var(--accent)">cobalt.tools</a>.</small>';
        showResult('dl-result', `⚠️ ${msg}${hint}`, true);
        Audio.error();
        return;
      }

      if (data.status === 'tunnel' || data.status === 'redirect') {
        const dlUrl   = data.url;
        const fname   = data.filename || 'taro-download';
        const estSize = r.headers.get('Estimated-Content-Length');
        const sizeStr = estSize ? ` · ~${fmtSize(parseInt(estSize))}` : '';
        const modeLabel = mode === 'audio' ? `${audiofmt.toUpperCase()} · ${bitrate} kbps` : `${quality === 'max' ? 'calidad máxima' : quality+'p'}`;
        showResult('dl-result',
          `✅ Listo — ${modeLabel}${sizeStr}<br>` +
          `<a href="${dlUrl}" target="_blank" class="dl-link">⬇️ Descargar "${fname}"</a><br>` +
          `<small style="color:var(--fg3);font-size:.7rem;margin-top:.4rem;display:block">` +
          `Si no descarga automáticamente → click derecho → "Guardar enlace como"</small>`
        );
        Audio.success();

      } else if (data.status === 'picker') {
        const items = data.picker || [];
        const pickerHtml = items.map((p, i) => {
          const thumb = p.thumb ? `<img src="${p.thumb}" style="width:60px;height:42px;object-fit:cover;border-radius:5px;border:1px solid var(--border);flex-shrink:0" alt="">` : '';
          return `<div style="display:flex;align-items:center;gap:.6rem;padding:.5rem;background:var(--bg3);border-radius:8px;border:1px solid var(--border)">
            ${thumb}
            <div style="flex:1;min-width:0">
              <div style="font-size:.72rem;color:var(--fg3);font-family:var(--mono)">${p.type || 'archivo'} ${i+1}</div>
            </div>
            <a href="${p.url}" target="_blank" class="dl-link" style="margin:0;flex-shrink:0">⬇️</a>
          </div>`;
        }).join('');
        showResult('dl-result',
          `✅ Se encontraron ${items.length} archivos:<br>` +
          `<div style="display:flex;flex-direction:column;gap:.4rem;margin-top:.5rem">${pickerHtml}</div>`
        );
        Audio.success();

      } else {
        showResult('dl-result',
          `⚠️ Respuesta inesperada del servidor (status: ${data.status || 'desconocido'}).<br>` +
          `<small style="color:var(--fg3);font-size:.7rem">Probá en <a href="https://cobalt.tools" target="_blank" style="color:var(--accent)">cobalt.tools</a> directamente.</small>`,
          true
        );
        Audio.error();
      }

    } catch(e) {
      toggleLoader('dl-loader', false);
      btn.disabled = false;
      btn.textContent = '⬇️ Obtener enlace de descarga';
      const isNetwork = e instanceof TypeError && e.message.includes('fetch');
      showResult('dl-result',
        isNetwork
          ? `⚠️ No se pudo conectar con cobalt.tools.<br><small style="color:var(--fg3);font-size:.7rem">Verificá tu conexión o intentá de nuevo en unos minutos. El servidor puede estar temporalmente caído.</small>`
          : `⚠️ Error inesperado: ${e.message}`,
        true
      );
      Audio.error();
    }
  }

  // ── QR (generado 100% local, sin depender de una API externa) ──
  async function _loadQrLib() {
    if (window.qrcode) return window.qrcode;
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js');
    return window.qrcode;
  }

  async function _renderQR(canvas, text, size, bg, fg) {
    const qrLib = await _loadQrLib();
    const qr = qrLib(0, 'M'); // typeNumber 0 = auto (elige el tamaño mínimo que entre)
    qr.addData(text);
    qr.make();
    const count = qr.getModuleCount();
    const margin = 2; // módulos de quiet zone
    const totalModules = count + margin * 2;
    const cell = Math.max(1, Math.floor(size / totalModules));
    const px = cell * totalModules;
    canvas.width = px; canvas.height = px;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, px, px);
    ctx.fillStyle = fg;
    for (let r = 0; r < count; r++) {
      for (let c = 0; c < count; c++) {
        if (qr.isDark(r, c)) ctx.fillRect((c + margin) * cell, (r + margin) * cell, cell, cell);
      }
    }
  }

  function liveQR() {
    clearTimeout(_qrDebounce);
    _qrDebounce = setTimeout(async () => {
      const txt  = document.getElementById('qr-input').value.trim(); if (!txt) return;
      const size = parseInt(document.getElementById('qr-size').value);
      const bg   = document.getElementById('qr-bg').value;
      const fg   = document.getElementById('qr-fg').value;
      try {
        await _renderQR(document.getElementById('qr-live'), txt, size, bg, fg);
        document.getElementById('qr-preview-wrap').style.display = 'block';
      } catch(e) {
        UI.showToast('⚠️ Texto muy largo para un QR');
      }
    }, 400);
  }

  function downloadQR() {
    const canvas = document.getElementById('qr-live');
    if (!canvas.width) return;
    canvas.toBlob(blob => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'taro-qr.png';
      a.click();
      Audio.success();
    }, 'image/png');
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

  async function pickScreenColor() {
    if (!('EyeDropper' in window)) return;
    try {
      const result = await new EyeDropper().open();
      document.getElementById('col-input').value = result.sRGBHex;
      document.getElementById('col-picker').value = result.sRGBHex;
      liveColor();
      Audio.success();
    } catch(e) { /* el usuario canceló la selección */ }
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

  // ── AI tools (Gemini proxy) ──
  async function _callGemini(prompt) {
    const r = await fetch(CONFIG.GEMINI_PROXY, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }] }),
    });
    let data;
    try { data = await r.json(); } catch(e) { throw new Error('Respuesta inválida del servidor'); }
    if (!r.ok) throw new Error(data?.error || `Error del servidor (${r.status})`);
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('La IA no devolvió ningún resultado. Probá de nuevo.');
    return text.trim();
  }

  const AI_MAX_CHARS = 6000;

  async function _runAiTool({ inputId, loaderId, resultId, btnLabel, buildPrompt }) {
    const txt = document.getElementById(inputId).value.trim();
    if (!txt) return;
    if (txt.length > AI_MAX_CHARS) {
      showResult(resultId, `⚠️ El texto es muy largo (${txt.length} caracteres). Probá con menos de ${AI_MAX_CHARS}.`, true);
      Audio.error();
      return;
    }
    toggleLoader(loaderId, true);
    document.getElementById(resultId).style.display = 'none';
    try {
      const out = await _callGemini(buildPrompt(txt));
      toggleLoader(loaderId, false);
      showResult(resultId, '');
      document.getElementById(resultId).textContent = out;
      showCopyBtn(resultId, `() => document.getElementById('${resultId}').textContent`);
      Audio.success();
    } catch(e) {
      toggleLoader(loaderId, false);
      showResult(resultId, '⚠️ ' + e.message, true);
      Audio.error();
    }
  }

  function aiSummarize() {
    const lengthMap = {
      corto: 'en 2 o 3 oraciones muy breves',
      medio: 'en un párrafo corto',
      largo: 'de forma detallada pero concisa, en varios párrafos si hace falta',
    };
    const length = document.getElementById('ai-sum-len').value;
    _runAiTool({
      inputId: 'ai-sum-input', loaderId: 'ai-sum-loader', resultId: 'ai-sum-result',
      buildPrompt: txt => `Resumí el siguiente texto en español, ${lengthMap[length]}. Devolvé únicamente el resumen, sin introducciones ni comentarios adicionales:\n\n${txt}`,
    });
  }

  function aiCorrect() {
    _runAiTool({
      inputId: 'ai-cor-input', loaderId: 'ai-cor-loader', resultId: 'ai-cor-result',
      buildPrompt: txt => `Corregí la ortografía, gramática y puntuación del siguiente texto, manteniendo el idioma y el estilo originales. Devolvé únicamente el texto corregido, sin explicaciones ni comentarios:\n\n${txt}`,
    });
  }

  function aiTranslate() {
    const lang = document.getElementById('ai-tr-lang').value;
    _runAiTool({
      inputId: 'ai-tr-input', loaderId: 'ai-tr-loader', resultId: 'ai-tr-result',
      buildPrompt: txt => `Traducí el siguiente texto al idioma "${lang}". Devolvé únicamente la traducción, sin explicaciones ni comentarios adicionales:\n\n${txt}`,
    });
  }

  function aiExpand() {
    _runAiTool({
      inputId: 'ai-exp-input', loaderId: 'ai-exp-loader', resultId: 'ai-exp-result',
      buildPrompt: txt => `Expandí y desarrollá el siguiente texto agregando más detalle, ejemplos y contexto, manteniendo el idioma y el tono originales. Devolvé únicamente el texto expandido, sin explicaciones ni comentarios adicionales:\n\n${txt}`,
    });
  }

  // ── base64 ──
  function b64SetMode(mode) {
    document.getElementById('b64-mode-text').classList.toggle('active', mode === 'text');
    document.getElementById('b64-mode-file').classList.toggle('active', mode === 'file');
    document.getElementById('b64-text-panel').style.display = mode === 'text' ? 'block' : 'none';
    document.getElementById('b64-file-panel').style.display = mode === 'file' ? 'block' : 'none';
    document.getElementById('b64-result').style.display = 'none';
    document.getElementById('b64-result-copy').style.display = 'none';
  }

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

  function b64FileLoad() {
    const f = document.getElementById('b64-file').files[0]; if (!f) return;
    document.getElementById('b64-file-name').textContent = `${f.name} · ${fmtSize(f.size)}`;
    const reader = new FileReader();
    reader.onload = () => {
      showResult('b64-result', '');
      document.getElementById('b64-result').textContent = reader.result;
      showCopyBtn('b64-result', `() => document.getElementById('b64-result').textContent`);
      Audio.success();
    };
    reader.onerror = () => { showResult('b64-result','Error al leer el archivo',true); Audio.error(); };
    reader.readAsDataURL(f);
  }

  // ── hash ──
  function hashSetMode(mode) {
    document.getElementById('hash-mode-text').classList.toggle('active', mode === 'text');
    document.getElementById('hash-mode-file').classList.toggle('active', mode === 'file');
    document.getElementById('hash-text-panel').style.display = mode === 'text' ? 'block' : 'none';
    document.getElementById('hash-file-panel').style.display = mode === 'file' ? 'block' : 'none';
    document.getElementById('hash-result').style.display = 'none';
  }

  async function genHash() {
    const isFile = document.getElementById('hash-mode-file').classList.contains('active');
    const algo = document.getElementById('hash-algo').value;
    let buf;
    if (isFile) {
      const f = document.getElementById('hash-file').files[0]; if (!f) return;
      buf = await f.arrayBuffer();
    } else {
      const txt = document.getElementById('hash-input').value; if (!txt) return;
      buf = new TextEncoder().encode(txt);
    }
    const digest = await crypto.subtle.digest(algo, buf);
    const hash = Array.from(new Uint8Array(digest)).map(b=>b.toString(16).padStart(2,'0')).join('');
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
  function genUUIDs() {
    const count = Math.min(50, Math.max(1, parseInt(document.getElementById('uuid-count').value) || 1));
    const noDash = document.getElementById('uuid-no-dash').checked;
    document.getElementById('uuid-out').textContent =
      Array.from({ length: count }, _uuid).map(u => noDash ? u.replace(/-/g,'') : u).join('\n');
    Audio.success();
  }

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

  // ── img resize ──
  let _irFile = null, _irOrig = null, _irMode = 'px', _irDebounce = null;

  function irLoad() {
    const f = document.getElementById('ir-file').files[0]; if (!f) return;
    _irFile = f;
    document.getElementById('ir-name').textContent = f.name;
    const img = new Image();
    img.onload = () => {
      _irOrig = img;
      _irMode = 'px';
      document.getElementById('ir-w').value = img.width;
      document.getElementById('ir-h').value = img.height;
      document.getElementById('ir-lbl-w').textContent = 'Ancho (px)';
      document.getElementById('ir-lbl-h').textContent = 'Alto (px)';
      document.getElementById('ir-orig-info').textContent =
        `${img.width} × ${img.height}px · ${fmtSize(f.size)} · ${f.name}`;
      document.getElementById('ir-info').style.display = 'block';
      irPreviewLive();
    };
    img.src = URL.createObjectURL(f);
  }

  function irSetMode(mode) {
    if (!_irOrig) return;
    _irMode = mode;
    const pxBtn  = document.getElementById('ir-mode-px');
    const pctBtn = document.getElementById('ir-mode-pct');
    pxBtn.style.opacity  = mode === 'px'  ? '1' : '.5';
    pctBtn.style.opacity = mode === 'pct' ? '1' : '.5';
    if (mode === 'px') {
      document.getElementById('ir-lbl-w').textContent = 'Ancho (px)';
      document.getElementById('ir-lbl-h').textContent = 'Alto (px)';
      document.getElementById('ir-w').value = _irOrig.width;
      document.getElementById('ir-h').value = _irOrig.height;
    } else {
      document.getElementById('ir-lbl-w').textContent = 'Ancho (%)';
      document.getElementById('ir-lbl-h').textContent = 'Alto (%)';
      document.getElementById('ir-w').value = 100;
      document.getElementById('ir-h').value = 100;
    }
    irPreviewLive();
  }

  function irToggleCompress() {
    const on = document.getElementById('ir-compress').checked;
    document.getElementById('ir-q-row').style.display = on ? 'block' : 'none';
    irPreviewLive();
  }

  function _irGetDims() {
    const wVal = parseFloat(document.getElementById('ir-w').value) || 100;
    const hVal = parseFloat(document.getElementById('ir-h').value) || 100;
    if (_irMode === 'pct') {
      return {
        w: Math.round(_irOrig.width  * wVal / 100),
        h: Math.round(_irOrig.height * hVal / 100),
      };
    }
    return { w: Math.round(wVal), h: Math.round(hVal) };
  }

  function irSyncAR(changed) {
    if (!_irOrig || !document.getElementById('ir-ar').checked) { irPreviewLive(); return; }
    const ratio = _irOrig.width / _irOrig.height;
    if (changed === 'w') {
      const wVal = parseFloat(document.getElementById('ir-w').value) || 0;
      if (_irMode === 'pct') {
        document.getElementById('ir-h').value = wVal.toFixed(1);
      } else {
        document.getElementById('ir-h').value = Math.round(wVal / ratio) || '';
      }
    } else {
      const hVal = parseFloat(document.getElementById('ir-h').value) || 0;
      if (_irMode === 'pct') {
        document.getElementById('ir-w').value = hVal.toFixed(1);
      } else {
        document.getElementById('ir-w').value = Math.round(hVal * ratio) || '';
      }
    }
    irPreviewLive();
  }

  function irPreviewLive() {
    if (!_irOrig) return;
    clearTimeout(_irDebounce);
    _irDebounce = setTimeout(() => {
      const { w, h } = _irGetDims();
      if (!w || !h) return;
      const canvas = document.getElementById('ir-canvas');
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(_irOrig, 0, 0, w, h);
      const infoEl = document.getElementById('ir-preview-info');
      const pctW = Math.round(w / _irOrig.width * 100);
      infoEl.textContent = `${w} × ${h}px (${pctW}%)`;
    }, 120);
  }

  function irPreset(w, h) {
    _irMode = 'px';
    document.getElementById('ir-mode-px').style.opacity  = '1';
    document.getElementById('ir-mode-pct').style.opacity = '.5';
    document.getElementById('ir-lbl-w').textContent = 'Ancho (px)';
    document.getElementById('ir-lbl-h').textContent = 'Alto (px)';
    document.getElementById('ir-w').value = w;
    document.getElementById('ir-h').value = h;
    irPreviewLive();
  }

  function irDownload() {
    if (!_irOrig) return;
    const { w, h } = _irGetDims();
    const doCompress = document.getElementById('ir-compress').checked;
    const q    = doCompress ? (parseInt(document.getElementById('ir-q').value) / 100) : 0.95;
    const mime = doCompress ? 'image/jpeg' : 'image/png';
    const ext  = doCompress ? 'jpg' : 'png';
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    c.getContext('2d').drawImage(_irOrig, 0, 0, w, h);
    c.toBlob(blob => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `taro-resize-${w}x${h}.${ext}`;
      a.click();
      Audio.success();
    }, mime, q);
  }

  // ── meta remove ──
  let _mrFile = null;

  // Lector mínimo de EXIF (JPEG/APP1) — solo los tags más relevantes para mostrarle
  // al usuario qué información personal tiene realmente la foto antes de borrarla.
  function _readExif(buf) {
    try {
      const view = new DataView(buf);
      if (view.getUint16(0) !== 0xFFD8) return null;
      let offset = 2;
      while (offset + 4 <= view.byteLength) {
        const marker = view.getUint16(offset);
        if ((marker & 0xFF00) !== 0xFF00) break;
        const segLen = view.getUint16(offset + 2);
        if (marker === 0xFFE1 && offset + 4 + 6 <= view.byteLength &&
            view.getUint32(offset + 4) === 0x45786966) {
          const tiffStart = offset + 4 + 6;
          const little = view.getUint16(tiffStart) === 0x4949;
          const get16 = o => view.getUint16(o, little);
          const get32 = o => view.getUint32(o, little);
          const ifdOffset = tiffStart + get32(tiffStart + 4);
          const entries = get16(ifdOffset);
          const NAMES = { 0x010F:'Make', 0x0110:'Model', 0x0132:'Fecha', 0x8825:'GPS' };
          const tags = {};
          for (let i = 0; i < entries; i++) {
            const eo = ifdOffset + 2 + i * 12;
            if (eo + 12 > view.byteLength) break;
            const tag = get16(eo), type = get16(eo + 2), count = get32(eo + 4);
            if (!(tag in NAMES)) continue;
            if (tag === 0x8825) { tags.GPS = true; continue; }
            if (type === 2) {
              const strOffset = count > 4 ? tiffStart + get32(eo + 8) : eo + 8;
              let str = '';
              for (let j = 0; j < count - 1 && strOffset + j < view.byteLength; j++) {
                const c = view.getUint8(strOffset + j);
                if (c === 0) break;
                str += String.fromCharCode(c);
              }
              if (str.trim()) tags[NAMES[tag]] = str.trim();
            }
          }
          return tags;
        }
        offset += 2 + segLen;
      }
      return null;
    } catch(e) { return null; }
  }

  async function mrLoad() {
    const input = document.getElementById('mr-file');
    const f = input.files[0]; if (!f) return;
    _mrFile = f;
    document.getElementById('mr-name').textContent = f.name;
    document.getElementById('mr-orig-size').textContent = fmtSize(f.size);
    const metaEl = document.getElementById('mr-orig-meta');
    metaEl.textContent = '⏳ analizando...';
    if (f.type === 'image/jpeg') {
      const exif = _readExif(await f.arrayBuffer());
      const parts = [];
      if (exif) {
        if (exif.Make || exif.Model) parts.push(`📷 ${[exif.Make, exif.Model].filter(Boolean).join(' ')}`);
        if (exif.Fecha) parts.push(`🕐 ${exif.Fecha}`);
        if (exif.GPS) parts.push('📍 ubicación GPS');
      }
      metaEl.textContent = parts.length ? `⚠️ Encontrado: ${parts.join(' · ')}` : '✓ No se detectaron metadatos EXIF';
    } else {
      metaEl.textContent = 'Los archivos PNG/WEBP no suelen incluir EXIF';
    }
    const url = URL.createObjectURL(f);
    document.getElementById('mr-before').src = url;
    document.getElementById('mr-after').style.opacity = '.5';
    // Limpiar y hacer preview de limpia
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = img.width; c.height = img.height;
      c.getContext('2d').drawImage(img, 0, 0);
      c.toBlob(blob => {
        document.getElementById('mr-after').src = URL.createObjectURL(blob);
        document.getElementById('mr-after').style.opacity = '1';
        document.getElementById('mr-clean-size').textContent = fmtSize(blob.size);
      }, f.type || 'image/jpeg', 0.95);
    };
    img.src = url;
    document.getElementById('mr-info').style.display = 'block';
  }

  function mrProcess() {
    if (!_mrFile) return;
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = img.width; c.height = img.height;
      c.getContext('2d').drawImage(img, 0, 0);
      const mime = _mrFile.type === 'image/png' ? 'image/png' : 'image/jpeg';
      const ext  = _mrFile.type === 'image/png' ? 'png' : 'jpg';
      c.toBlob(blob => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'taro-clean.' + ext;
        a.click();
        document.getElementById('mr-result').innerHTML =
          `<div class="result-area">✅ Metadatos eliminados · ${fmtSize(_mrFile.size)} → ${fmtSize(blob.size)}</div>`;
        Audio.success();
      }, mime, 0.95);
    };
    img.src = URL.createObjectURL(_mrFile);
  }

  // ── favicon gen ──
  let _fvImg = null;

  // recorta al centro en vez de estirar, para no distorsionar logos no cuadrados
  function _drawCover(ctx, img, size) {
    const scale = Math.max(size / img.width, size / img.height);
    const w = img.width * scale, h = img.height * scale;
    ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
  }

  function fvLoad() {
    const input = document.getElementById('fv-file');
    const f = input.files[0]; if (!f) return;
    document.getElementById('fv-name').textContent = f.name;
    const img = new Image();
    img.onload = () => {
      _fvImg = img;
      [16, 32, 48, 192].forEach(sz => {
        const id = sz === 192 ? 'fv-p192' : `fv-p${sz}`;
        const c = document.getElementById(id);
        c.width = sz; c.height = sz;
        _drawCover(c.getContext('2d'), img, sz);
      });
      document.getElementById('fv-info').style.display = 'block';
    };
    img.src = URL.createObjectURL(f);
  }

  function fvDownloadPng(sz) {
    if (!_fvImg) return;
    const c = document.createElement('canvas');
    c.width = sz; c.height = sz;
    _drawCover(c.getContext('2d'), _fvImg, sz);
    c.toBlob(blob => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `favicon-${sz}.png`;
      a.click();
      Audio.success();
    }, 'image/png');
  }

  function fvDownloadIco() {
    if (!_fvImg) return;

    // Genera un .ico real multi-tamaño (16, 32, 48px) con BMP de 32bpp
    function canvasToRawBMP(canvas) {
      const w = canvas.width, h = canvas.height;
      const ctx = canvas.getContext('2d');
      const imgData = ctx.getImageData(0, 0, w, h);
      const pixels = imgData.data;

      // BMP dentro de ICO: BITMAPINFOHEADER (40 bytes) + pixels XOR (BGRA, bottom-up) + mask AND
      const rowSize = w * 4;
      const xorSize = rowSize * h;
      const andRowSize = Math.ceil(w / 8) * 4; // padded to 4 bytes
      const andSize = andRowSize * h;
      const totalSize = 40 + xorSize + andSize;

      const buf = new ArrayBuffer(totalSize);
      const view = new DataView(buf);

      // BITMAPINFOHEADER
      view.setUint32(0, 40, true);           // biSize
      view.setInt32(4, w, true);             // biWidth
      view.setInt32(8, h * 2, true);         // biHeight (doble: XOR + AND)
      view.setUint16(12, 1, true);           // biPlanes
      view.setUint16(14, 32, true);          // biBitCount
      view.setUint32(16, 0, true);           // biCompression (BI_RGB)
      view.setUint32(20, xorSize, true);     // biSizeImage
      // resto en 0

      // Píxeles XOR: BGRA, bottom-up
      let offset = 40;
      for (let row = h - 1; row >= 0; row--) {
        for (let col = 0; col < w; col++) {
          const i = (row * w + col) * 4;
          view.setUint8(offset++, pixels[i + 2]); // B
          view.setUint8(offset++, pixels[i + 1]); // G
          view.setUint8(offset++, pixels[i]);     // R
          view.setUint8(offset++, pixels[i + 3]); // A
        }
      }
      // AND mask: todo ceros (imagen opaca con canal alpha)
      for (let i = 0; i < andSize; i++) view.setUint8(offset++, 0);

      return new Uint8Array(buf);
    }

    const sizes = [16, 32, 48];
    const bmpData = sizes.map(sz => {
      const c = document.createElement('canvas');
      c.width = sz; c.height = sz;
      _drawCover(c.getContext('2d'), _fvImg, sz);
      return canvasToRawBMP(c);
    });

    // ICO header: ICONDIR + ICONDIRENTRY * n + data
    const numImages = sizes.length;
    const headerSize = 6 + 16 * numImages;
    let dataOffset = headerSize;
    const parts = [];

    // ICONDIR
    const iconDir = new DataView(new ArrayBuffer(6));
    iconDir.setUint16(0, 0, true);         // reserved
    iconDir.setUint16(2, 1, true);         // type = 1 (ICO)
    iconDir.setUint16(4, numImages, true); // count
    parts.push(new Uint8Array(iconDir.buffer));

    // ICONDIRENTRY * n
    const entries = new DataView(new ArrayBuffer(16 * numImages));
    bmpData.forEach((bmp, idx) => {
      const sz = sizes[idx];
      const base = idx * 16;
      entries.setUint8(base + 0, sz === 256 ? 0 : sz); // width (0 = 256)
      entries.setUint8(base + 1, sz === 256 ? 0 : sz); // height
      entries.setUint8(base + 2, 0);                   // colorCount
      entries.setUint8(base + 3, 0);                   // reserved
      entries.setUint16(base + 4, 1, true);            // planes
      entries.setUint16(base + 6, 32, true);           // bitCount
      entries.setUint32(base + 8, bmp.length, true);   // sizeInBytes
      entries.setUint32(base + 12, dataOffset, true);  // offset
      dataOffset += bmp.length;
    });
    parts.push(new Uint8Array(entries.buffer));

    // data
    bmpData.forEach(bmp => parts.push(bmp));

    // merge
    const totalLen = parts.reduce((acc, p) => acc + p.length, 0);
    const merged = new Uint8Array(totalLen);
    let pos = 0;
    parts.forEach(p => { merged.set(p, pos); pos += p.length; });

    const blob = new Blob([merged], { type: 'image/x-icon' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'favicon.ico';
    a.click();
    Audio.success();
  }

  function _dropName(id) {
    const file = document.getElementById(id)?.files?.[0];
    const nameEl = document.getElementById(id + '-name');
    if (nameEl && file) nameEl.textContent = file.name;
  }

  // ── background remove (chroma-key local) ──
  let _bgImg = null, _bgColor = null;

  function bgLoad() {
    const f = document.getElementById('bg-file').files[0]; if (!f) return;
    document.getElementById('bg-name').textContent = f.name;
    const img = new Image();
    img.onload = () => {
      _bgImg = img;
      const canvas = document.getElementById('bg-canvas');
      canvas.width = img.width; canvas.height = img.height;
      canvas.getContext('2d').drawImage(img, 0, 0);
      canvas.onclick = _bgPickColor;
      document.getElementById('bg-info').style.display = 'block';
      bgAutoDetect();
    };
    img.src = URL.createObjectURL(f);
  }

  function _bgSampleAt(x, y) {
    const c = document.createElement('canvas');
    c.width = _bgImg.width; c.height = _bgImg.height;
    const ctx = c.getContext('2d');
    ctx.drawImage(_bgImg, 0, 0);
    const d = ctx.getImageData(x, y, 1, 1).data;
    return { r: d[0], g: d[1], b: d[2] };
  }

  function _bgPickColor(e) {
    const canvas = document.getElementById('bg-canvas');
    const rect = canvas.getBoundingClientRect();
    const x = Math.min(canvas.width - 1, Math.max(0, Math.floor((e.clientX - rect.left) * (canvas.width / rect.width))));
    const y = Math.min(canvas.height - 1, Math.max(0, Math.floor((e.clientY - rect.top) * (canvas.height / rect.height))));
    _bgColor = _bgSampleAt(x, y);
    _bgUpdateSwatch();
    bgApply();
    Audio.click();
  }

  function bgAutoDetect() {
    if (!_bgImg) return;
    const w = _bgImg.width, h = _bgImg.height;
    const corners = [[0,0],[w-1,0],[0,h-1],[w-1,h-1]];
    let r=0, g=0, b=0;
    corners.forEach(([x,y]) => { const s = _bgSampleAt(x,y); r+=s.r; g+=s.g; b+=s.b; });
    _bgColor = { r: Math.round(r/4), g: Math.round(g/4), b: Math.round(b/4) };
    _bgUpdateSwatch();
    bgApply();
  }

  function _bgUpdateSwatch() {
    if (!_bgColor) return;
    const hex = '#' + [_bgColor.r,_bgColor.g,_bgColor.b].map(v => v.toString(16).padStart(2,'0')).join('');
    document.getElementById('bg-color-swatch').style.background = hex;
    document.getElementById('bg-color-hex').textContent = hex;
  }

  function bgApply() {
    if (!_bgImg || !_bgColor) return;
    const canvas = document.getElementById('bg-canvas');
    const ctx = canvas.getContext('2d');
    ctx.drawImage(_bgImg, 0, 0);
    const tol = parseInt(document.getElementById('bg-tol').value);
    const feather = 24; // banda de transición suave para que el borde no quede dentado
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;
    const { r: br, g: bg, b: bb } = _bgColor;
    for (let i = 0; i < data.length; i += 4) {
      const dr = data[i] - br, dg = data[i+1] - bg, db = data[i+2] - bb;
      const dist = Math.sqrt(dr*dr + dg*dg + db*db);
      if (dist < tol) data[i+3] = 0;
      else if (dist < tol + feather) data[i+3] = Math.round(data[i+3] * (dist - tol) / feather);
    }
    ctx.putImageData(imgData, 0, 0);
  }

  function bgDownload() {
    if (!_bgImg) return;
    document.getElementById('bg-canvas').toBlob(blob => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'taro-sin-fondo.png';
      a.click();
      Audio.success();
    }, 'image/png');
  }

  // ════ PDF TOOLS — helper: cargar pdf-lib ════
  async function _loadPdfLib() {
    if (window.PDFLib) return window.PDFLib;
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js');
    return window.PDFLib;
  }

  async function _loadPdfJs() {
    if (window.pdfjsLib) return window.pdfjsLib;
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js');
    window.pdfjsLib.GlobalWorkerOptions.workerSrc =
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    return window.pdfjsLib;
  }

  function _parsePageRanges(str, total) {
    const pages = new Set();
    str.split(',').forEach(part => {
      const [a, b] = part.trim().split('-').map(Number);
      if (b) { for (let i = a; i <= Math.min(b, total); i++) pages.add(i); }
      else if (a) pages.add(a);
    });
    return [...pages].filter(p => p >= 1 && p <= total).sort((a,b)=>a-b);
  }

  // ── pdf merge ──
  let _pmFiles = [];

  async function _pmThumb(file) {
    const pdfjs = await _loadPdfJs();
    const pdf = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
    const page = await pdf.getPage(1);
    const vp = page.getViewport({ scale: 0.4 });
    const c = document.createElement('canvas');
    c.width = vp.width; c.height = vp.height;
    await page.render({ canvasContext: c.getContext('2d'), viewport: vp }).promise;
    return { dataUrl: c.toDataURL('image/jpeg', 0.7), pages: pdf.numPages };
  }

  async function pmLoad() {
    const files = [...document.getElementById('pm-files').files];
    if (!files.length) return;
    // append new files
    for (const f of files) {
      const { dataUrl, pages } = await _pmThumb(f).catch(() => ({ dataUrl: null, pages: '?' }));
      _pmFiles.push({ file: f, dataUrl, pages });
    }
    pmRenderList();
  }

  function pmRenderList() {
    const list = document.getElementById('pm-list');
    const totalPages = _pmFiles.reduce((a, f) => a + (typeof f.pages === 'number' ? f.pages : 0), 0);
    const totalEl = document.getElementById('pm-total');
    if (totalEl) totalEl.textContent = _pmFiles.length
      ? `${_pmFiles.length} archivos · ${totalPages} páginas en total`
      : '';

    list.innerHTML = _pmFiles.map((f, i) => `
      <div class="pm-item" draggable="true" data-idx="${i}"
        ondragstart="ToolFn.pmDragStart(event,${i})"
        ondragover="event.preventDefault();this.classList.add('pm-item--over')"
        ondragleave="this.classList.remove('pm-item--over')"
        ondrop="event.preventDefault();this.classList.remove('pm-item--over');ToolFn.pmDrop(event,${i})"
        style="display:flex;align-items:center;gap:.6rem;padding:.4rem .5rem;background:var(--bg3);border-radius:8px;margin-bottom:.3rem;cursor:grab;border:1.5px solid var(--border);transition:border-color .15s">
        ${f.dataUrl
          ? `<img src="${f.dataUrl}" style="width:36px;height:48px;object-fit:cover;border-radius:4px;border:1px solid var(--border);flex-shrink:0" alt="">`
          : `<div style="width:36px;height:48px;background:var(--bg2);border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:.9rem;flex-shrink:0">📄</div>`}
        <div style="flex:1;min-width:0">
          <div style="font-size:.75rem;font-family:var(--mono);color:var(--fg2);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${f.file.name}</div>
          <div style="font-size:.67rem;color:var(--fg3);font-family:var(--mono);margin-top:.1rem">${fmtSize(f.file.size)} · ${f.pages} pág.</div>
        </div>
        <span style="color:var(--fg3);font-size:.9rem;cursor:grab;padding:0 .2rem" title="Arrastrá para reordenar">⠿</span>
        <button onclick="ToolFn.pmRemove(${i})" style="background:none;border:none;color:var(--fg3);cursor:pointer;font-size:.9rem;padding:0" title="Quitar">✕</button>
      </div>`
    ).join('');
  }

  let _pmDragIdx = null;
  function pmDragStart(e, idx) { _pmDragIdx = idx; e.dataTransfer.effectAllowed = 'move'; }
  function pmDrop(e, targetIdx) {
    if (_pmDragIdx === null || _pmDragIdx === targetIdx) return;
    const dragged = _pmFiles.splice(_pmDragIdx, 1)[0];
    _pmFiles.splice(targetIdx, 0, dragged);
    _pmDragIdx = null;
    pmRenderList();
  }

  function pmRemove(i) {
    _pmFiles.splice(i, 1);
    pmRenderList();
  }

  async function pmMerge() {
    if (_pmFiles.length < 2) { showResult('pm-result','❌ Necesitás al menos 2 PDFs.',true); Audio.error(); return; }
    toggleLoader('pm-loader', true);
    try {
      const { PDFDocument } = await _loadPdfLib();
      const merged = await PDFDocument.create();
      for (const item of _pmFiles) {
        const buf = await item.file.arrayBuffer();
        const pdf = await PDFDocument.load(buf, { ignoreEncryption: true });
        const pages = await merged.copyPages(pdf, pdf.getPageIndices());
        pages.forEach(p => merged.addPage(p));
      }
      const bytes = await merged.save();
      const blob = new Blob([bytes], { type:'application/pdf' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
      a.download = 'taro-merged.pdf'; a.click();
      toggleLoader('pm-loader', false);
      showResult('pm-result', `✅ ${_pmFiles.length} PDFs combinados · ${fmtSize(blob.size)}`);
      Audio.success();
    } catch(e) { toggleLoader('pm-loader',false); showResult('pm-result','❌ '+e.message,true); Audio.error(); }
  }

  // ── pdf split ──
  let _psFile = null, _psPagesTotal = 0, _psScope = 'all', _psSelected = new Set();

  async function psLoad() {
    const f = document.getElementById('ps-file').files[0]; if (!f) return;
    _psFile = f; _psSelected = new Set(); _psScope = 'all';
    document.getElementById('ps-filename').textContent = f.name;
    document.getElementById('ps-upload-screen').style.display = 'none';
    document.getElementById('ps-editor').style.display = 'block';

    const pdfjs = await _loadPdfJs();
    const pdf = await pdfjs.getDocument({ data: await f.arrayBuffer() }).promise;
    _psPagesTotal = pdf.numPages;
    document.getElementById('ps-pages-info').textContent = `${_psPagesTotal} páginas · ${fmtSize(f.size)}`;

    const thumbsEl = document.getElementById('ps-thumbs');
    thumbsEl.innerHTML = '';
    for (let i = 1; i <= _psPagesTotal; i++) {
      const page = await pdf.getPage(i);
      const vp = page.getViewport({ scale: 0.3 });
      const c = document.createElement('canvas');
      c.width = vp.width; c.height = vp.height;
      await page.render({ canvasContext: c.getContext('2d'), viewport: vp }).promise;
      const wrap = document.createElement('div');
      wrap.className = 'pr-thumb'; wrap.dataset.page = i;
      wrap.innerHTML = `<div class="pr-thumb__canvas-wrap"><canvas width="${vp.width}" height="${vp.height}" style="width:100%;display:block"></canvas><div class="pr-thumb__overlay"></div></div><p class="pr-thumb__num">${i}</p>`;
      wrap.querySelector('canvas').getContext('2d').drawImage(c, 0, 0);
      wrap.addEventListener('click', () => psToggleSelect(i, wrap));
      thumbsEl.appendChild(wrap);
    }
    psUpdateSelInfo();
  }

  function psReset() {
    _psFile = null; _psPagesTotal = 0; _psSelected = new Set();
    document.getElementById('ps-upload-screen').style.display = 'block';
    document.getElementById('ps-editor').style.display = 'none';
    document.getElementById('ps-file').value = '';
  }

  function psSetScope(scope, btn) {
    _psScope = scope;
    document.querySelectorAll('#ps-editor .pr-scope-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const rangeRow = document.getElementById('ps-range-row');
    const selHint  = document.getElementById('ps-sel-hint');
    rangeRow.style.display = scope === 'range' ? 'block' : 'none';
    selHint.style.display  = scope === 'sel'   ? 'block' : 'none';
    // toggle clickability
    document.querySelectorAll('#ps-thumbs .pr-thumb').forEach(t => {
      t.style.cursor = scope === 'sel' ? 'pointer' : 'default';
    });
    if (scope === 'range') psHighlightRange();
    else psUpdateSelInfo();
  }

  function psToggleSelect(pageNum, wrap) {
    if (_psScope !== 'sel') return;
    if (_psSelected.has(pageNum)) { _psSelected.delete(pageNum); wrap.classList.remove('pr-thumb--selected'); }
    else { _psSelected.add(pageNum); wrap.classList.add('pr-thumb--selected'); }
    psUpdateSelInfo();
  }

  function psHighlightRange() {
    const str = document.getElementById('ps-range')?.value || '';
    const highlighted = str ? _parsePageRanges(str, _psPagesTotal) : [];
    document.querySelectorAll('#ps-thumbs .pr-thumb').forEach(t => {
      const n = parseInt(t.dataset.page);
      t.classList.toggle('pr-thumb--selected', highlighted.includes(n));
    });
    psUpdateSelInfo(highlighted);
  }

  function psUpdateSelInfo(pages) {
    const info = document.getElementById('ps-sel-info');
    if (!info) return;
    let list;
    if (_psScope === 'all') list = Array.from({length:_psPagesTotal},(_,i)=>i+1);
    else if (_psScope === 'sel') list = [..._psSelected].sort((a,b)=>a-b);
    else list = pages || [];
    info.textContent = list.length ? `${list.length} páginas seleccionadas (${list.slice(0,8).join(', ')}${list.length>8?'…':''})` : 'ninguna';
  }

  async function psSplit() {
    if (!_psFile) return;
    toggleLoader('ps-loader', true);
    try {
      const { PDFDocument } = await _loadPdfLib();
      const srcPdf = await PDFDocument.load(await _psFile.arrayBuffer(), { ignoreEncryption:true });
      let pageNums;
      if (_psScope === 'all') pageNums = Array.from({length:_psPagesTotal}, (_,i)=>i+1);
      else if (_psScope === 'sel') pageNums = [..._psSelected].sort((a,b)=>a-b);
      else pageNums = _parsePageRanges(document.getElementById('ps-range').value, _psPagesTotal);
      if (!pageNums.length) throw new Error('No se encontraron páginas válidas');

      const files = [];
      for (const num of pageNums) {
        const newPdf = await PDFDocument.create();
        const [page] = await newPdf.copyPages(srcPdf, [num-1]);
        newPdf.addPage(page);
        const bytes = await newPdf.save();
        files.push({ name: `taro-pag${num}.pdf`, bytes });
      }

      // más de 3 archivos: los navegadores bloquean/preguntan ante muchas descargas
      // seguidas, así que los empaquetamos en un .zip en vez de dispararlas una por una.
      if (files.length > 3) {
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js');
        const zip = new JSZip();
        files.forEach(f => zip.file(f.name, f.bytes));
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(zipBlob);
        a.download = 'taro-split.zip'; a.click();
      } else {
        for (const f of files) {
          const blob = new Blob([f.bytes], {type:'application/pdf'});
          const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
          a.download = f.name; a.click();
          await new Promise(r => setTimeout(r, 200));
        }
      }

      toggleLoader('ps-loader', false);
      showResult('ps-result', `✅ ${pageNums.length} páginas exportadas${files.length > 3 ? ' en un .zip' : ''}`);
      Audio.success();
    } catch(e) { toggleLoader('ps-loader',false); showResult('ps-result','❌ '+e.message,true); Audio.error(); }
  }

  // ── pdf compress ──
  let _pcFile = null, _pcOrigSize = 0;

  async function pcLoad() {
    const f = document.getElementById('pc-file').files[0]; if (!f) return;
    _pcFile = f; _pcOrigSize = f.size;
    document.getElementById('pc-filename').textContent = f.name;
    document.getElementById('pc-upload-screen').style.display = 'none';
    document.getElementById('pc-editor').style.display = 'block';
    document.getElementById('pc-orig-size').textContent = fmtSize(f.size);
    pcUpdateEst();

    const pdfjs = await _loadPdfJs();
    const pdf = await pdfjs.getDocument({ data: await f.arrayBuffer() }).promise;
    document.getElementById('pc-pages-info').textContent = `${pdf.numPages} páginas`;

    const thumbsEl = document.getElementById('pc-thumbs');
    thumbsEl.innerHTML = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const vp = page.getViewport({ scale: 0.3 });
      const c = document.createElement('canvas');
      c.width = vp.width; c.height = vp.height;
      await page.render({ canvasContext: c.getContext('2d'), viewport: vp }).promise;
      const wrap = document.createElement('div');
      wrap.className = 'pr-thumb';
      wrap.innerHTML = `<div class="pr-thumb__canvas-wrap"><canvas width="${vp.width}" height="${vp.height}" style="width:100%;display:block"></canvas></div><p class="pr-thumb__num">${i}</p>`;
      wrap.querySelector('canvas').getContext('2d').drawImage(c, 0, 0);
      thumbsEl.appendChild(wrap);
    }
  }

  function pcReset() {
    _pcFile = null;
    document.getElementById('pc-upload-screen').style.display = 'block';
    document.getElementById('pc-editor').style.display = 'none';
    document.getElementById('pc-file').value = '';
    document.getElementById('pc-thumbs').innerHTML = '';
  }

  function pcUpdateEst() {
    const aggressive = document.getElementById('pc-aggressive')?.checked;
    const q = parseInt(document.getElementById('pc-q')?.value || 80) / 100;
    document.getElementById('pc-ql').textContent = Math.round(q * 100);
    if (!_pcOrigSize) return;
    // estimación aproximada: sin modo agresivo solo se limpian metadatos (~3%);
    // con modo agresivo el tamaño depende fuerte de la calidad de rasterizado elegida
    const est = aggressive
      ? Math.round(_pcOrigSize * (0.15 + q * 0.6))
      : Math.round(_pcOrigSize * 0.97);
    document.getElementById('pc-est-size').textContent =
      fmtSize(est) + ` (${Math.max(0, Math.round((1 - est / _pcOrigSize) * 100))}% menos)`;
  }

  async function pcCompress() {
    if (!_pcFile) return;
    toggleLoader('pc-loader', true);
    try {
      const aggressive = document.getElementById('pc-aggressive').checked;
      let blob;
      if (aggressive) {
        const quality = parseInt(document.getElementById('pc-q').value) / 100;
        const pdfjs = await _loadPdfJs();
        const { PDFDocument } = await _loadPdfLib();
        const srcPdf = await pdfjs.getDocument({ data: await _pcFile.arrayBuffer() }).promise;
        const outPdf = await PDFDocument.create();
        for (let i = 1; i <= srcPdf.numPages; i++) {
          const page = await srcPdf.getPage(i);
          const vp = page.getViewport({ scale: 1.5 });
          const c = document.createElement('canvas');
          c.width = vp.width; c.height = vp.height;
          await page.render({ canvasContext: c.getContext('2d'), viewport: vp }).promise;
          const imgBytes = await fetch(c.toDataURL('image/jpeg', quality)).then(r => r.arrayBuffer());
          const img = await outPdf.embedJpg(imgBytes);
          const newPage = outPdf.addPage([vp.width, vp.height]);
          newPage.drawImage(img, { x:0, y:0, width:vp.width, height:vp.height });
        }
        blob = new Blob([await outPdf.save()], {type:'application/pdf'});
      } else {
        const { PDFDocument } = await _loadPdfLib();
        const pdf = await PDFDocument.load(await _pcFile.arrayBuffer(), { ignoreEncryption:true });
        pdf.setTitle(''); pdf.setAuthor(''); pdf.setSubject('');
        pdf.setKeywords([]); pdf.setProducer(''); pdf.setCreator('');
        blob = new Blob([await pdf.save({ useObjectStreams: true })], {type:'application/pdf'});
      }
      const saved = Math.round((1 - blob.size/_pcFile.size)*100);
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
      a.download = 'taro-compressed.pdf'; a.click();
      toggleLoader('pc-loader', false);
      showResult('pc-result',
        `✅ ${fmtSize(_pcFile.size)} → ${fmtSize(blob.size)} ${saved>0?'(-'+saved+'%)':'(sin cambio)'}` +
        (aggressive ? '<br><small style="color:var(--fg3)">Modo agresivo: el texto ya no es seleccionable.</small>' : '')
      );
      Audio.success();
    } catch(e) { toggleLoader('pc-loader',false); showResult('pc-result','❌ '+e.message,true); Audio.error(); }
  }

  // ── pdf to jpg ──
  let _pjFile = null, _pjPages = 0, _pjPdfDoc = null;

  async function pjLoad() {
    const f = document.getElementById('pj-file').files[0]; if (!f) return;
    _pjFile = f;
    document.getElementById('pj-filename').textContent = f.name;
    document.getElementById('pj-upload-screen').style.display = 'none';
    document.getElementById('pj-editor').style.display = 'block';

    const pdfjs = await _loadPdfJs();
    _pjPdfDoc = await pdfjs.getDocument({ data: await f.arrayBuffer() }).promise;
    _pjPages = _pjPdfDoc.numPages;
    document.getElementById('pj-pages-info').textContent = `${_pjPages} páginas · ${fmtSize(f.size)}`;

    const thumbsEl = document.getElementById('pj-thumbs');
    thumbsEl.innerHTML = '';
    for (let i = 1; i <= _pjPages; i++) {
      const page = await _pjPdfDoc.getPage(i);
      const vp = page.getViewport({ scale: 0.3 });
      const c = document.createElement('canvas');
      c.width = vp.width; c.height = vp.height;
      await page.render({ canvasContext: c.getContext('2d'), viewport: vp }).promise;
      const wrap = document.createElement('div');
      wrap.className = 'pr-thumb';
      wrap.innerHTML = `<div class="pr-thumb__canvas-wrap"><canvas width="${vp.width}" height="${vp.height}" style="width:100%;display:block"></canvas></div><p class="pr-thumb__num">${i}</p>`;
      wrap.querySelector('canvas').getContext('2d').drawImage(c, 0, 0);
      thumbsEl.appendChild(wrap);
    }
  }

  function pjReset() {
    _pjFile = null; _pjPdfDoc = null;
    document.getElementById('pj-upload-screen').style.display = 'block';
    document.getElementById('pj-editor').style.display = 'none';
    document.getElementById('pj-file').value = '';
    document.getElementById('pj-thumbs').innerHTML = '';
    document.getElementById('pj-previews').innerHTML = '';
  }

  function pjUpdateScaleLabel() {
    const v = parseFloat(document.getElementById('pj-scale').value);
    const labels = {1:'Estándar (1x)',1.5:'Media (1.5x)',2:'Alta (2x)',2.5:'Muy alta (2.5x)',3:'Máxima (3x)'};
    document.getElementById('pj-scale-lbl').textContent = labels[v] || v + 'x';
  }

  function pjUpdateQLLabel() {
    document.getElementById('pj-ql').textContent = document.getElementById('pj-quality').value;
  }

  async function pjConvert(asZip = false) {
    if (!_pjFile) return;
    toggleLoader('pj-loader', true);
    const previews = document.getElementById('pj-previews');
    previews.innerHTML = '';
    const progressEl = document.getElementById('pj-progress');
    try {
      const pdfjs = await _loadPdfJs();
      const scale = parseFloat(document.getElementById('pj-scale').value);
      const quality = parseInt(document.getElementById('pj-quality').value) / 100;
      const pdf = await pdfjs.getDocument({ data: await _pjFile.arrayBuffer() }).promise;
      const blobs = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        progressEl.textContent = `Página ${i} de ${pdf.numPages}…`;
        const page = await pdf.getPage(i);
        const vp = page.getViewport({ scale });
        const canvas = document.createElement('canvas');
        canvas.width = vp.width; canvas.height = vp.height;
        await page.render({ canvasContext: canvas.getContext('2d'), viewport: vp }).promise;

        await new Promise(resolve => {
          canvas.toBlob(blob => {
            const url = URL.createObjectURL(blob);
            blobs.push({ blob, name: `taro-pag${i}.jpg` });
            const wrap = document.createElement('div');
            wrap.style.cssText = 'text-align:center';
            wrap.innerHTML = `<img src="${url}" style="width:100%;border-radius:6px;border:1px solid var(--border)">
              <a href="${url}" download="taro-pag${i}.jpg" style="display:block;font-size:.68rem;color:var(--accent);font-family:var(--mono);margin-top:.2rem">⬇️ pag ${i}</a>`;
            previews.appendChild(wrap);
            resolve();
          }, 'image/jpeg', quality);
        });

        if (!asZip) {
          const a = document.createElement('a');
          a.href = URL.createObjectURL(blobs[blobs.length-1].blob);
          a.download = `taro-pag${i}.jpg`; a.click();
          await new Promise(r => setTimeout(r, 300));
        }
      }

      if (asZip) {
        // Use JSZip if available, else fallback to individual downloads
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js');
        const zip = new JSZip();
        blobs.forEach(({ blob, name }) => zip.file(name, blob));
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(zipBlob);
        a.download = 'taro-jpg.zip'; a.click();
      }

      toggleLoader('pj-loader', false);
      progressEl.textContent = '';
      Audio.success();
    } catch(e) {
      toggleLoader('pj-loader',false);
      progressEl.textContent = '❌ ' + e.message;
      Audio.error();
    }
  }

  // ── pdf unlock ──
  let _puFile = null;

  async function puLoad() {
    const f = document.getElementById('pu-file').files[0]; if (!f) return;
    _puFile = f;
    document.getElementById('pu-filename').textContent = f.name;
    document.getElementById('pu-upload-screen').style.display = 'none';
    document.getElementById('pu-editor').style.display = 'block';
    document.getElementById('pu-orig-size').textContent = fmtSize(f.size);

    // detect restrictions via PDF-lib
    try {
      const { PDFDocument } = await _loadPdfLib();
      const pdf = await PDFDocument.load(await f.arrayBuffer(), { ignoreEncryption: true });
      // pdf-lib doesn't expose permission flags directly but we can infer from context
      const enc = pdf.context.lookup(pdf.context.trailerInfo.Encrypt);
      const hasEnc = !!enc;
      const badge = (ok) => ok
        ? `<span style="color:var(--accent)">✅ Permitido</span>`
        : `<span style="color:var(--accent2)">🔒 Restringido</span>`;
      if (hasEnc) {
        document.getElementById('pu-r-print-val').innerHTML = badge(false);
        document.getElementById('pu-r-copy-val').innerHTML  = badge(false);
        document.getElementById('pu-r-edit-val').innerHTML  = badge(false);
      } else {
        document.getElementById('pu-r-print-val').innerHTML = badge(true);
        document.getElementById('pu-r-copy-val').innerHTML  = badge(true);
        document.getElementById('pu-r-edit-val').innerHTML  = badge(true);
      }
    } catch(e) {
      ['print','copy','edit'].forEach(k => {
        document.getElementById('pu-r-'+k+'-val').textContent = 'No disponible';
      });
    }

    document.getElementById('pu-pages-info').textContent = `${fmtSize(f.size)}`;

    // generate thumbnails
    try {
      const pdfjs = await _loadPdfJs();
      const pdf = await pdfjs.getDocument({ data: await f.arrayBuffer() }).promise;
      document.getElementById('pu-pages-info').textContent = `${pdf.numPages} páginas · ${fmtSize(f.size)}`;
      const thumbsEl = document.getElementById('pu-thumbs');
      thumbsEl.innerHTML = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const vp = page.getViewport({ scale: 0.3 });
        const c = document.createElement('canvas');
        c.width = vp.width; c.height = vp.height;
        await page.render({ canvasContext: c.getContext('2d'), viewport: vp }).promise;
        const wrap = document.createElement('div');
        wrap.className = 'pr-thumb';
        wrap.innerHTML = `<div class="pr-thumb__canvas-wrap"><canvas width="${vp.width}" height="${vp.height}" style="width:100%;display:block"></canvas></div><p class="pr-thumb__num">${i}</p>`;
        wrap.querySelector('canvas').getContext('2d').drawImage(c, 0, 0);
        thumbsEl.appendChild(wrap);
      }
    } catch(e) { /* thumbnails optional */ }
  }

  function puReset() {
    _puFile = null;
    document.getElementById('pu-upload-screen').style.display = 'block';
    document.getElementById('pu-editor').style.display = 'none';
    document.getElementById('pu-file').value = '';
    document.getElementById('pu-thumbs').innerHTML = '';
  }

  async function puUnlock() {
    if (!_puFile) return;
    toggleLoader('pu-loader', true);
    try {
      const { PDFDocument } = await _loadPdfLib();
      const pdf = await PDFDocument.load(await _puFile.arrayBuffer(), { ignoreEncryption:true });
      const bytes = await pdf.save();
      const blob = new Blob([bytes], {type:'application/pdf'});
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
      a.download = 'taro-unlocked.pdf'; a.click();
      toggleLoader('pu-loader', false);
      showResult('pu-result', '✅ Restricciones eliminadas · ' + fmtSize(blob.size));
      Audio.success();
    } catch(e) { toggleLoader('pu-loader',false); showResult('pu-result','❌ '+e.message,true); Audio.error(); }
  }

  // ── pdf rotate ──
  let _prFile = null, _prPagesTotal = 0, _prDeg = 90, _prScope = 'all', _prSelected = new Set(), _prMode = 'rotate';

  async function prLoad() {
    const f = document.getElementById('pr-file').files[0]; if (!f) return;
    _prFile = f;
    _prSelected = new Set();
    _prScope = 'all';
    _prDeg = 90;
    document.getElementById('pr-filename').textContent = f.name;
    document.getElementById('pr-upload-screen').style.display = 'none';
    document.getElementById('pr-editor').style.display = 'block';

    const pdfjs = await _loadPdfJs();
    const pdf = await pdfjs.getDocument({ data: await f.arrayBuffer() }).promise;
    _prPagesTotal = pdf.numPages;
    document.getElementById('pr-pages-info').textContent = `${_prPagesTotal} páginas · ${fmtSize(f.size)}`;

    const thumbsEl = document.getElementById('pr-thumbs');
    thumbsEl.innerHTML = '';

    for (let i = 1; i <= _prPagesTotal; i++) {
      const page = await pdf.getPage(i);
      const vp = page.getViewport({ scale: 0.3 });
      const c = document.createElement('canvas');
      c.width = vp.width; c.height = vp.height;
      await page.render({ canvasContext: c.getContext('2d'), viewport: vp }).promise;

      const wrap = document.createElement('div');
      wrap.className = 'pr-thumb';
      wrap.dataset.page = i;
      wrap.innerHTML = `
        <div class="pr-thumb__canvas-wrap">
          <canvas width="${vp.width}" height="${vp.height}" style="width:100%;display:block"></canvas>
          <div class="pr-thumb__overlay"><span class="pr-thumb__rot-badge" id="pr-badge-${i}"></span></div>
        </div>
        <p class="pr-thumb__num">${i}</p>
      `;
      wrap.querySelector('canvas').getContext('2d').drawImage(c, 0, 0);
      wrap.addEventListener('click', () => prToggleSelect(i, wrap));
      thumbsEl.appendChild(wrap);
    }
    prUpdatePreview();
  }

  function prReset() {
    _prFile = null; _prPagesTotal = 0; _prSelected = new Set();
    document.getElementById('pr-upload-screen').style.display = 'block';
    document.getElementById('pr-editor').style.display = 'none';
    document.getElementById('pr-file').value = '';
  }

  function prSetMode(mode, btn) {
    _prMode = mode;
    document.querySelectorAll('.pr-mode-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const rotOpts = document.getElementById('pr-rotate-opts');
    if (rotOpts) rotOpts.style.display = mode === 'rotate' ? 'block' : 'none';
    prUpdatePreview();
  }

  function prOnSlider(val) {
    _prDeg = parseInt(val);
    const lbl = document.getElementById('pr-deg-label');
    if (lbl) lbl.textContent = _prDeg + '°';
    // quitar active de snap buttons
    document.querySelectorAll('.pr-deg-btn').forEach(b => {
      b.classList.toggle('active', parseInt(b.textContent) === _prDeg);
    });
    prUpdatePreview();
  }

  function prSnapDeg(deg) {
    _prDeg = deg;
    const slider = document.getElementById('pr-deg-slider');
    if (slider) slider.value = deg;
    const lbl = document.getElementById('pr-deg-label');
    if (lbl) lbl.textContent = deg + '°';
    document.querySelectorAll('.pr-deg-btn').forEach(b => {
      b.classList.toggle('active', parseInt(b.textContent) === deg);
    });
    prUpdatePreview();
  }

  function prSetDeg(deg, btn) {
    _prDeg = deg;
    document.querySelectorAll('.pr-deg-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    prUpdatePreview();
  }

  function prSetScope(scope, btn) {
    _prScope = scope;
    document.querySelectorAll('.pr-scope-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('pr-range-row').style.display = scope === 'range' ? 'block' : 'none';
    document.getElementById('pr-sel-hint').style.display = scope === 'sel' ? 'block' : 'none';
    document.querySelectorAll('.pr-thumb').forEach(t => {
      t.classList.toggle('pr-thumb--selectable', scope === 'sel');
      if (scope !== 'sel') t.classList.remove('pr-thumb--active');
    });
    if (scope !== 'sel') _prSelected = new Set();
    prUpdatePreview();
  }

  function prToggleSelect(pageNum, el) {
    if (_prScope !== 'sel') return;
    if (_prSelected.has(pageNum)) {
      _prSelected.delete(pageNum);
      el.classList.remove('pr-thumb--active');
    } else {
      _prSelected.add(pageNum);
      el.classList.add('pr-thumb--active');
    }
    prUpdatePreview();
  }

  function prGetTargetPages() {
    if (_prScope === 'all') return Array.from({length:_prPagesTotal},(_,i)=>i+1);
    if (_prScope === 'sel') return [..._prSelected].sort((a,b)=>a-b);
    return _parsePageRanges(document.getElementById('pr-range')?.value || '', _prPagesTotal);
  }

  function prUpdatePreview() {
    const pages = prGetTargetPages();
    const wrap = document.getElementById('pr-preview-wrap'); if (!wrap) return;

    // badges en miniaturas
    document.querySelectorAll('.pr-thumb__rot-badge').forEach(b => b.textContent = '');
    const badgeLabel = _prMode === 'rotate' ? _prDeg + '°' : (_prMode === 'mirror-h' ? '↔' : '↕');
    pages.forEach(n => {
      const badge = document.getElementById('pr-badge-' + n);
      if (badge) badge.textContent = badgeLabel;
    });

    if (!pages.length) {
      wrap.innerHTML = '<span style="font-size:.72rem;color:var(--fg3);font-family:var(--mono)">ninguna página seleccionada</span>';
      return;
    }

    const toShow = pages.slice(0, 4);
    wrap.innerHTML = '';
    toShow.forEach(n => {
      const srcCanvas = document.querySelector(`.pr-thumb[data-page="${n}"] canvas`);
      if (!srcCanvas) return;
      const sw = srcCanvas.width, sh = srcCanvas.height;
      let dw = sw, dh = sh;

      if (_prMode === 'rotate') {
        const swap = _prDeg === 90 || _prDeg === 270;
        dw = swap ? sh : sw; dh = swap ? sw : sh;
      }

      const c = document.createElement('canvas');
      c.width = dw; c.height = dh;
      const ctx = c.getContext('2d');

      if (_prMode === 'rotate') {
        ctx.translate(dw/2, dh/2);
        ctx.rotate(_prDeg * Math.PI / 180);
        ctx.drawImage(srcCanvas, -sw/2, -sh/2);
      } else if (_prMode === 'mirror-h') {
        ctx.translate(dw, 0); ctx.scale(-1, 1);
        ctx.drawImage(srcCanvas, 0, 0);
      } else {
        ctx.translate(0, dh); ctx.scale(1, -1);
        ctx.drawImage(srcCanvas, 0, 0);
      }

      const div = document.createElement('div');
      div.style.cssText = 'text-align:center';
      div.innerHTML = `<p style="font-size:.6rem;color:var(--accent);font-family:var(--mono);margin-bottom:.2rem">pág ${n}</p>`;
      c.style.cssText = 'max-width:70px;max-height:90px;border-radius:4px;border:1.5px solid var(--accent);display:block';
      div.prepend(c);
      wrap.appendChild(div);
    });
    if (pages.length > 4) {
      const more = document.createElement('span');
      more.style.cssText = 'font-size:.7rem;color:var(--fg3);font-family:var(--mono);align-self:center';
      more.textContent = '+' + (pages.length - 4) + ' más';
      wrap.appendChild(more);
    }
  }

  async function prRotate() {
    if (!_prFile) return;
    const pageNums = prGetTargetPages();
    if (!pageNums.length) { showResult('pr-result','❌ Seleccioná al menos una página.',true); Audio.error(); return; }
    toggleLoader('pr-loader', true);
    try {
      if (_prMode === 'rotate') {
        // rotación simple con pdf-lib
        const { PDFDocument, degrees } = await _loadPdfLib();
        const pdf = await PDFDocument.load(await _prFile.arrayBuffer(), { ignoreEncryption:true });
        pageNums.forEach(n => {
          const page = pdf.getPage(n-1);
          page.setRotation(degrees((page.getRotation().angle + _prDeg) % 360));
        });
        const bytes = await pdf.save();
        const blob = new Blob([bytes], {type:'application/pdf'});
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
        a.download = 'taro-rotated.pdf'; a.click();
        toggleLoader('pr-loader', false);
        showResult('pr-result', `✅ ${pageNums.length} página${pageNums.length>1?'s':''} rotada${pageNums.length>1?'s':''} ${_prDeg}°`);
      } else {
        // mirror: renderizar cada página con canvas y reconstruir PDF
        const pdfjs = await _loadPdfJs();
        const { PDFDocument } = await _loadPdfLib();
        const srcPdf = await pdfjs.getDocument({ data: await _prFile.arrayBuffer() }).promise;
        const outPdf = await PDFDocument.create();

        for (let i = 1; i <= srcPdf.numPages; i++) {
          const page = await srcPdf.getPage(i);
          const vp = page.getViewport({ scale: 2 });
          const c = document.createElement('canvas');
          c.width = vp.width; c.height = vp.height;
          const ctx = c.getContext('2d');

          if (pageNums.includes(i)) {
            // aplicar espejo
            if (_prMode === 'mirror-h') {
              ctx.translate(vp.width, 0); ctx.scale(-1, 1);
            } else {
              ctx.translate(0, vp.height); ctx.scale(1, -1);
            }
          }
          await page.render({ canvasContext: ctx, viewport: vp }).promise;

          const imgData = c.toDataURL('image/jpeg', 0.92);
          const imgBytes = await fetch(imgData).then(r => r.arrayBuffer());
          const img = await outPdf.embedJpg(imgBytes);
          const newPage = outPdf.addPage([vp.width, vp.height]);
          newPage.drawImage(img, { x:0, y:0, width:vp.width, height:vp.height });
        }

        const bytes = await outPdf.save();
        const blob = new Blob([bytes], {type:'application/pdf'});
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
        a.download = 'taro-mirror.pdf'; a.click();
        toggleLoader('pr-loader', false);
        const label = _prMode === 'mirror-h' ? 'horizontal' : 'vertical';
        showResult('pr-result', `✅ Espejo ${label} aplicado · ${pageNums.length} página${pageNums.length>1?'s':''}`);
      }
      Audio.success();
    } catch(e) { toggleLoader('pr-loader',false); showResult('pr-result','❌ '+e.message,true); Audio.error(); }
  }
  // ── pdf delete pages ──
  let _pdFile = null, _pdPagesTotal = 0, _pdSelected = new Set();

  async function pdLoad() {
    const f = document.getElementById('pd-file').files[0]; if (!f) return;
    _pdFile = f; _pdSelected = new Set();
    document.getElementById('pd-filename').textContent = f.name;
    document.getElementById('pd-upload-screen').style.display = 'none';
    document.getElementById('pd-editor').style.display = 'block';

    const pdfjs = await _loadPdfJs();
    const pdf = await pdfjs.getDocument({ data: await f.arrayBuffer() }).promise;
    _pdPagesTotal = pdf.numPages;
    document.getElementById('pd-pages-info').textContent = `${_pdPagesTotal} páginas · ${fmtSize(f.size)}`;

    const thumbsEl = document.getElementById('pd-thumbs');
    thumbsEl.innerHTML = '';
    for (let i = 1; i <= _pdPagesTotal; i++) {
      const page = await pdf.getPage(i);
      const vp = page.getViewport({ scale: 0.3 });
      const c = document.createElement('canvas');
      c.width = vp.width; c.height = vp.height;
      await page.render({ canvasContext: c.getContext('2d'), viewport: vp }).promise;
      const wrap = document.createElement('div');
      wrap.className = 'pr-thumb'; wrap.dataset.page = i;
      wrap.innerHTML = `<div class="pr-thumb__canvas-wrap"><canvas width="${vp.width}" height="${vp.height}" style="width:100%;display:block"></canvas><div class="pr-thumb__overlay" id="pd-ov-${i}"></div></div><p class="pr-thumb__num">${i}</p>`;
      wrap.querySelector('canvas').getContext('2d').drawImage(c, 0, 0);
      wrap.addEventListener('click', () => pdToggleSelect(i, wrap));
      thumbsEl.appendChild(wrap);
    }
    pdUpdateInfo();
  }

  function pdReset() {
    _pdFile = null; _pdPagesTotal = 0; _pdSelected = new Set();
    document.getElementById('pd-upload-screen').style.display = 'block';
    document.getElementById('pd-editor').style.display = 'none';
    document.getElementById('pd-file').value = '';
    document.getElementById('pd-thumbs').innerHTML = '';
  }

  function pdToggleSelect(pageNum, wrap) {
    if (_pdSelected.has(pageNum)) {
      _pdSelected.delete(pageNum);
      wrap.classList.remove('pr-thumb--selected');
      wrap.style.opacity = '1';
    } else {
      _pdSelected.add(pageNum);
      wrap.classList.add('pr-thumb--selected');
      wrap.style.opacity = '.45';
    }
    pdUpdateInfo();
  }

  function pdUpdateInfo() {
    const toDelete = [..._pdSelected].sort((a,b)=>a-b);
    const keep = _pdPagesTotal - toDelete.length;
    const selInfo  = document.getElementById('pd-sel-info');
    const keepInfo = document.getElementById('pd-keep-info');
    selInfo.textContent  = toDelete.length ? toDelete.join(', ') : 'ninguna';
    keepInfo.textContent = keep > 0 ? `${keep} página${keep>1?'s':''} restante${keep>1?'s':''}` : '⚠️ Quedaría vacío';
  }

  async function pdDelete() {
    if (!_pdFile) return;
    const toDelete = [..._pdSelected];
    if (!toDelete.length) { showResult('pd-result','❌ Seleccioná al menos una página.',true); Audio.error(); return; }
    if (toDelete.length >= _pdPagesTotal) { showResult('pd-result','❌ No podés eliminar todas las páginas.',true); Audio.error(); return; }
    toggleLoader('pd-loader', true);
    try {
      const { PDFDocument } = await _loadPdfLib();
      const pdf = await PDFDocument.load(await _pdFile.arrayBuffer(), { ignoreEncryption:true });
      const keepPages = Array.from({length:_pdPagesTotal},(_,i)=>i+1).filter(n=>!toDelete.includes(n));
      const newPdf = await PDFDocument.create();
      const copied = await newPdf.copyPages(pdf, keepPages.map(n=>n-1));
      copied.forEach(p => newPdf.addPage(p));
      const bytes = await newPdf.save();
      const blob = new Blob([bytes], {type:'application/pdf'});
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
      a.download = 'taro-edited.pdf'; a.click();
      toggleLoader('pd-loader', false);
      showResult('pd-result', `✅ ${toDelete.length} página${toDelete.length>1?'s':''} eliminada${toDelete.length>1?'s':''} · ${fmtSize(blob.size)}`);
      Audio.success();
    } catch(e) { toggleLoader('pd-loader',false); showResult('pd-result','❌ '+e.message,true); Audio.error(); }
  }

  // ── pdf ocr ──
  let _poFile = null, _poPagesTotal = 0, _poScope = 'all', _poSelected = new Set();

  async function poLoad() {
    const f = document.getElementById('po-file').files[0]; if (!f) return;
    _poFile = f; _poSelected = new Set(); _poPagesTotal = 0;
    document.getElementById('po-name').textContent = f.name;
    document.getElementById('po-info').style.display = 'block';

    const isPdf = f.type === 'application/pdf';
    const pdfOptsEl = document.getElementById('po-pdf-opts');
    pdfOptsEl.style.display = isPdf ? 'block' : 'none';

    if (isPdf) {
      const pdfjs = await _loadPdfJs();
      const pdf = await pdfjs.getDocument({ data: await f.arrayBuffer() }).promise;
      _poPagesTotal = pdf.numPages;
      const thumbsEl = document.getElementById('po-thumbs');
      thumbsEl.innerHTML = '';
      for (let i = 1; i <= _poPagesTotal; i++) {
        const page = await pdf.getPage(i);
        const vp = page.getViewport({ scale: 0.25 });
        const c = document.createElement('canvas');
        c.width = vp.width; c.height = vp.height;
        await page.render({ canvasContext: c.getContext('2d'), viewport: vp }).promise;
        const wrap = document.createElement('div');
        wrap.className = 'pr-thumb'; wrap.dataset.page = i;
        wrap.style.cssText = 'width:52px;flex-shrink:0';
        wrap.innerHTML = `<div class="pr-thumb__canvas-wrap" style="height:70px"><canvas width="${vp.width}" height="${vp.height}" style="width:100%;height:100%;object-fit:cover;display:block"></canvas></div><p class="pr-thumb__num">${i}</p>`;
        wrap.querySelector('canvas').getContext('2d').drawImage(c, 0, 0);
        wrap.addEventListener('click', () => poToggleSelect(i, wrap));
        thumbsEl.appendChild(wrap);
      }
    }
  }

  function poSetScope(scope, btn) {
    _poScope = scope;
    document.querySelectorAll('#po-pdf-opts .pr-scope-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('po-sel-hint').style.display = scope === 'sel' ? 'block' : 'none';
  }

  function poToggleSelect(pageNum, wrap) {
    if (_poScope !== 'sel') return;
    if (_poSelected.has(pageNum)) { _poSelected.delete(pageNum); wrap.classList.remove('pr-thumb--selected'); }
    else { _poSelected.add(pageNum); wrap.classList.add('pr-thumb--selected'); }
  }

  async function poOCR() {
    if (!_poFile) return;
    toggleLoader('po-loader', true);
    document.getElementById('po-result').style.display = 'none';
    const progress = document.getElementById('po-progress');
    const progressWrap = document.getElementById('po-progress-wrap');
    const progressBar  = document.getElementById('po-progress-bar');
    const progressPct  = document.getElementById('po-progress-pct');
    const progressLbl  = document.getElementById('po-progress-label');
    progressWrap.style.display = 'block';
    progress.textContent = 'Cargando Tesseract...';
    try {
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/tesseract.js/5.0.4/tesseract.min.js');
      const lang = document.getElementById('po-lang').value;
      const isPdf = _poFile.type === 'application/pdf';

      let pagesToProcess = [];
      if (isPdf) {
        if (_poScope === 'all') pagesToProcess = Array.from({length:_poPagesTotal},(_,i)=>i+1);
        else pagesToProcess = [..._poSelected].sort((a,b)=>a-b);
        if (!pagesToProcess.length) pagesToProcess = [1];
      }

      const pdfjs = isPdf ? await _loadPdfJs() : null;
      const pdfDoc = isPdf ? await pdfjs.getDocument({ data: await _poFile.arrayBuffer() }).promise : null;

      let allText = '';
      const total = isPdf ? pagesToProcess.length : 1;

      for (let idx = 0; idx < total; idx++) {
        const pageLabel = isPdf ? `Página ${pagesToProcess[idx]}/${_poPagesTotal}` : 'Imagen';
        progressLbl.textContent = `${pageLabel} — reconociendo...`;
        progressBar.style.width = Math.round(idx / total * 100) + '%';
        progressPct.textContent = Math.round(idx / total * 100) + '%';

        let imageUrl;
        if (isPdf) {
          const page = await pdfDoc.getPage(pagesToProcess[idx]);
          const vp = page.getViewport({ scale: 2 });
          const canvas = document.createElement('canvas');
          canvas.width = vp.width; canvas.height = vp.height;
          await page.render({ canvasContext: canvas.getContext('2d'), viewport: vp }).promise;
          imageUrl = canvas.toDataURL('image/png');
        } else {
          imageUrl = URL.createObjectURL(_poFile);
        }

        const result = await Tesseract.recognize(imageUrl, lang, {
          logger: m => {
            if (m.status === 'recognizing text') {
              const pct = Math.round((idx / total + m.progress / total) * 100);
              progressBar.style.width = pct + '%';
              progressPct.textContent = pct + '%';
              progressLbl.textContent = `${pageLabel} — ${Math.round(m.progress * 100)}%`;
            }
          }
        });
        const text = result.data.text.trim();
        if (text) allText += (isPdf ? `[Página ${pagesToProcess[idx]}]\n` : '') + text + '\n\n';
      }

      toggleLoader('po-loader', false);
      progressWrap.style.display = 'none';
      progress.textContent = '';
      if (!allText.trim()) throw new Error('No se encontró texto');
      document.getElementById('po-result').textContent = allText.trim();
      document.getElementById('po-result').style.display = 'block';
      document.getElementById('po-result-copy').style.display = 'block';
      Audio.success();
    } catch(e) {
      toggleLoader('po-loader', false);
      progressWrap.style.display = 'none';
      progress.textContent = '';
      document.getElementById('po-result').textContent = '❌ ' + e.message;
      document.getElementById('po-result').style.display = 'block';
      Audio.error();
    }
  }

  // ── password generator ──
  function pwdGenerate() {
    const len   = parseInt(document.getElementById('pwd-len').value);
    const useLower = document.getElementById('pwd-lower').checked;
    const useUpper = document.getElementById('pwd-upper').checked;
    const useNum   = document.getElementById('pwd-num').checked;
    const useSym   = document.getElementById('pwd-sym').checked;
    let charset = '';
    if (useLower) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (useUpper) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (useNum)   charset += '0123456789';
    if (useSym)   charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    const out = document.getElementById('pwd-out');
    if (!charset) {
      out.textContent = '—';
      document.getElementById('pwd-strength-fill').style.width = '0%';
      document.getElementById('pwd-strength-label').textContent = 'Elegí al menos un tipo de carácter';
      return;
    }
    const rnd = new Uint32Array(len);
    crypto.getRandomValues(rnd);
    let pwd = '';
    for (let i = 0; i < len; i++) pwd += charset[rnd[i] % charset.length];
    out.textContent = pwd;

    const entropy = len * Math.log2(charset.length);
    const fill  = document.getElementById('pwd-strength-fill');
    const label = document.getElementById('pwd-strength-label');
    let pct, txt, color;
    if (entropy < 40)      { pct = 25;  txt = 'Débil';      color = '#ff4466'; }
    else if (entropy < 60) { pct = 50;  txt = 'Media';      color = 'var(--accent2)'; }
    else if (entropy < 90) { pct = 75;  txt = 'Fuerte';     color = 'var(--accent3)'; }
    else                    { pct = 100; txt = 'Muy fuerte'; color = 'var(--accent)'; }
    fill.style.width = pct + '%';
    fill.style.background = color;
    label.textContent = `${txt} · ~${Math.round(entropy)} bits de entropía`;
    Audio.success();
  }

  // ── json formatter ──
  function jsonFormat(mode) {
    const raw = document.getElementById('json-input').value.trim();
    if (!raw) return;
    try {
      const obj = JSON.parse(raw);
      const out = mode === 'pretty' ? JSON.stringify(obj, null, 2) : JSON.stringify(obj);
      showResult('json-result', '');
      document.getElementById('json-result').textContent = out;
      showCopyBtn('json-result', `() => document.getElementById('json-result').textContent`);
      document.getElementById('json-stats').textContent =
        `${fmtSize(new Blob([raw]).size)} → ${fmtSize(new Blob([out]).size)}`;
      Audio.success();
    } catch(e) {
      showResult('json-result', '❌ JSON inválido: ' + e.message, true);
      Audio.error();
    }
  }

  // ── text diff ──
  function _diffTokens(ta, tb) {
    const n = ta.length, m = tb.length;
    const dp = Array.from({ length: n + 1 }, () => new Int32Array(m + 1));
    for (let i = n - 1; i >= 0; i--) {
      for (let j = m - 1; j >= 0; j--) {
        dp[i][j] = ta[i] === tb[j] ? dp[i+1][j+1] + 1 : Math.max(dp[i+1][j], dp[i][j+1]);
      }
    }
    const ops = [];
    let i = 0, j = 0;
    while (i < n && j < m) {
      if (ta[i] === tb[j]) { ops.push(['eq', ta[i]]); i++; j++; }
      else if (dp[i+1][j] >= dp[i][j+1]) { ops.push(['del', ta[i]]); i++; }
      else { ops.push(['ins', tb[j]]); j++; }
    }
    while (i < n) { ops.push(['del', ta[i]]); i++; }
    while (j < m) { ops.push(['ins', tb[j]]); j++; }
    return ops;
  }

  let _diffMode = 'word';

  function diffSetMode(mode) {
    _diffMode = mode;
    document.getElementById('diff-mode-word').classList.toggle('active', mode === 'word');
    document.getElementById('diff-mode-line').classList.toggle('active', mode === 'line');
  }

  function textDiffRun() {
    const a = document.getElementById('diff-a').value;
    const b = document.getElementById('diff-b').value;
    if (!a && !b) return;
    const isLine = _diffMode === 'line';
    const tokenize = isLine ? s => s.split('\n') : s => s.split(/(\s+)/);
    const ta = tokenize(a), tb = tokenize(b);
    if (ta.length * tb.length > 1000000) {
      showResult('diff-result', '⚠️ Los textos son demasiado largos para comparar en el navegador. Probá con fragmentos más cortos.', true);
      Audio.error();
      return;
    }
    const ops = _diffTokens(ta, tb);
    const html = ops.map(([type, tok]) => {
      if (type === 'eq') return _escHtml(tok);
      return `<span class="diff-${type}">${_escHtml(tok)}</span>`;
    }).join(isLine ? '\n' : '');
    const added   = ops.filter(o => o[0] === 'ins' && o[1].trim()).length;
    const removed = ops.filter(o => o[0] === 'del' && o[1].trim()).length;
    showResult('diff-result', html || '<span style="color:var(--fg3)">Sin diferencias — los textos son idénticos.</span>');
    document.getElementById('diff-stats').textContent =
      (added || removed) ? `+${added} agregadas · -${removed} eliminadas` : 'Los textos son idénticos';
    Audio.success();
  }

  // ── regex tester ──
  let _rxDebounce = null;

  function regexRun() {
    clearTimeout(_rxDebounce);
    _rxDebounce = setTimeout(_regexRunNow, 150);
  }

  function _regexRunNow() {
    const pattern = document.getElementById('rx-pattern').value;
    const testStr = document.getElementById('rx-test').value;
    const resultEl = document.getElementById('rx-result');
    const infoEl = document.getElementById('rx-groups');
    const statusEl = document.getElementById('rx-info');
    infoEl.innerHTML = '';

    if (!pattern) { resultEl.innerHTML = _escHtml(testStr); statusEl.textContent = ''; return; }
    if (testStr.length > 20000) {
      resultEl.innerHTML = '';
      statusEl.textContent = '⚠️ El texto de prueba es muy largo. Probá con menos de 20.000 caracteres.';
      statusEl.style.color = '#ff8899';
      return;
    }

    const userFlags = ['g','i','m','s'].filter(f => document.getElementById('rx-flag-'+f).checked).join('');
    let re;
    try {
      // forzamos 'g' para poder iterar todas las coincidencias, sin importar si el usuario tildó "g"
      re = new RegExp(pattern, userFlags.includes('g') ? userFlags : userFlags + 'g');
    } catch(e) {
      resultEl.innerHTML = _escHtml(testStr);
      statusEl.textContent = '❌ Regex inválida: ' + e.message;
      statusEl.style.color = '#ff8899';
      return;
    }

    let html = '', lastIndex = 0, count = 0, m;
    const groupRows = [];
    while ((m = re.exec(testStr)) !== null) {
      count++;
      html += _escHtml(testStr.slice(lastIndex, m.index));
      html += `<mark class="rx-match">${_escHtml(m[0]) || '&nbsp;'}</mark>`;
      lastIndex = m.index + m[0].length;
      if (m.length > 1 && groupRows.length < 30) {
        groupRows.push(`Match ${count}: ` + m.slice(1).map((g,i) => `$${i+1}=${g !== undefined ? '"'+_escHtml(g)+'"' : '—'}`).join(' · '));
      }
      if (m[0].length === 0) re.lastIndex++; // evita loop infinito con coincidencias vacías
      if (count > 3000) break; // guard contra patrones/entradas patológicas
    }
    html += _escHtml(testStr.slice(lastIndex));
    resultEl.innerHTML = html;
    statusEl.style.color = '';
    statusEl.textContent = count ? `${count} coincidencia${count>1?'s':''}` : 'Sin coincidencias';
    infoEl.innerHTML = groupRows.map(r => `<div>${r}</div>`).join('');
  }

  // ── lorem ipsum ──
  const LOREM_WORDS = ['lorem','ipsum','dolor','sit','amet','consectetur','adipiscing','elit','sed','do','eiusmod','tempor','incididunt','ut','labore','et','dolore','magna','aliqua','enim','ad','minim','veniam','quis','nostrud','exercitation','ullamco','laboris','nisi','aliquip','ex','ea','commodo','consequat','duis','aute','irure','in','reprehenderit','voluptate','velit','esse','cillum','fugiat','nulla','pariatur','excepteur','sint','occaecat','cupidatat','non','proident','sunt','culpa','qui','officia','deserunt','mollit','anim','id','est','laborum'];

  function _loremWord() { return LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)]; }
  function _cap(w) { return w.charAt(0).toUpperCase() + w.slice(1); }

  function _loremSentence() {
    const n = 6 + Math.floor(Math.random() * 8);
    const words = Array.from({ length: n }, _loremWord);
    return _cap(words.join(' ')) + '.';
  }

  function _loremParagraph() {
    const n = 4 + Math.floor(Math.random() * 3);
    return Array.from({ length: n }, _loremSentence).join(' ');
  }

  function loremGenerate() {
    const unit = document.getElementById('lorem-unit').value;
    const count = Math.min(200, Math.max(1, parseInt(document.getElementById('lorem-count').value) || 1));
    const classic = document.getElementById('lorem-classic').checked;
    const CLASSIC_OPENER = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.';
    let out;
    if (unit === 'palabras') {
      const words = Array.from({ length: count }, _loremWord);
      const openerWords = CLASSIC_OPENER.replace('.', '').split(' ').map(w => w.toLowerCase());
      if (classic) for (let i = 0; i < Math.min(openerWords.length, count); i++) words[i] = openerWords[i];
      out = _cap(words.join(' ')) + '.';
    } else if (unit === 'oraciones') {
      const sentences = Array.from({ length: count }, _loremSentence);
      if (classic) sentences[0] = CLASSIC_OPENER;
      out = sentences.join(' ');
    } else {
      const paras = Array.from({ length: count }, _loremParagraph);
      if (classic) paras[0] = CLASSIC_OPENER + ' ' + paras[0];
      out = paras.join('\n\n');
    }
    showResult('lorem-result', '');
    document.getElementById('lorem-result').textContent = out;
    showCopyBtn('lorem-result', `() => document.getElementById('lorem-result').textContent`);
    Audio.success();
  }

  // ── slugify ──
  function _slugify(str) {
    return str
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // quita tildes/diacriticos
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/[\s_]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function slugifyLive() {
    document.getElementById('slug-output').textContent = _slugify(document.getElementById('slug-input').value) || '—';
  }

  // ── image dominant color palette ──
  let _ipImg = null;

  function imgPaletteLoad() {
    const f = document.getElementById('ip-file').files[0]; if (!f) return;
    document.getElementById('ip-name').textContent = f.name;
    const img = new Image();
    img.onload = () => {
      _ipImg = img;
      document.getElementById('ip-preview').src = URL.createObjectURL(f);
      document.getElementById('ip-info').style.display = 'block';
      imgPaletteExtract();
    };
    img.src = URL.createObjectURL(f);
  }

  function imgPaletteExtract() {
    if (!_ipImg) return;
    const SIZE = 100; // reducimos la imagen para que el conteo de píxeles sea instantáneo
    const c = document.createElement('canvas');
    c.width = SIZE; c.height = SIZE;
    const ctx = c.getContext('2d');
    ctx.drawImage(_ipImg, 0, 0, SIZE, SIZE);
    const data = ctx.getImageData(0, 0, SIZE, SIZE).data;

    const bucketSize = 24;
    const buckets = new Map();
    for (let i = 0; i < data.length; i += 4) {
      if (data[i+3] < 128) continue; // ignoramos píxeles muy transparentes
      const r = data[i], g = data[i+1], b = data[i+2];
      const key = [r/bucketSize|0, g/bucketSize|0, b/bucketSize|0].join(',');
      const entry = buckets.get(key) || { count: 0, r: 0, g: 0, b: 0 };
      entry.count++; entry.r += r; entry.g += g; entry.b += b;
      buckets.set(key, entry);
    }

    const count = parseInt(document.getElementById('ip-count').value);
    const swatches = [...buckets.values()]
      .sort((a, b) => b.count - a.count)
      .slice(0, count)
      .map(e => '#' + [e.r, e.g, e.b].map(sum => Math.round(sum / e.count).toString(16).padStart(2,'0')).join(''));

    const resultEl = document.getElementById('ip-result');
    resultEl.innerHTML = swatches.map(hex => `
      <div class="pal-swatch" style="background:${hex}" onclick="UI.copyText('${hex}',this.querySelector('.pal-swatch__code'))">
        <span class="pal-swatch__code">${hex}</span>
      </div>`).join('');
    resultEl.style.display = 'grid';
  }

  // ── unit converter ──
  const UNIT_DATA = {
    longitud:   { units: { mm:0.001, cm:0.01, m:1, km:1000, in:0.0254, ft:0.3048, yd:0.9144, mi:1609.344 } },
    peso:       { units: { mg:0.001, g:1, kg:1000, oz:28.3495, lb:453.592, t:1000000 } },
    volumen:    { units: { ml:0.001, l:1, gal:3.78541, m3:1000 } },
    velocidad:  { units: { 'km/h':1, 'm/s':3.6, mph:1.60934, nudo:1.852 } },
    temperatura:{ units: { '°C':null, '°F':null, 'K':null } },
  };

  function unitCatChange() {
    const cat = document.getElementById('uc-cat').value;
    const units = Object.keys(UNIT_DATA[cat].units);
    const fromSel = document.getElementById('uc-from'), toSel = document.getElementById('uc-to');
    fromSel.innerHTML = units.map(u => `<option value="${u}">${u}</option>`).join('');
    toSel.innerHTML   = units.map(u => `<option value="${u}">${u}</option>`).join('');
    if (units.length > 1) toSel.selectedIndex = 1;
    unitConvert();
  }

  function _tempToC(v, unit) {
    if (unit === '°C') return v;
    if (unit === '°F') return (v - 32) * 5 / 9;
    return v - 273.15;
  }
  function _cFromTemp(c, unit) {
    if (unit === '°C') return c;
    if (unit === '°F') return c * 9 / 5 + 32;
    return c + 273.15;
  }

  function unitConvert() {
    const cat  = document.getElementById('uc-cat').value;
    const val  = parseFloat(document.getElementById('uc-val').value);
    const from = document.getElementById('uc-from').value;
    const to   = document.getElementById('uc-to').value;
    const out  = document.getElementById('uc-out');
    if (isNaN(val) || !from || !to) { out.value = ''; return; }
    const result = cat === 'temperatura'
      ? _cFromTemp(_tempToC(val, from), to)
      : val * UNIT_DATA[cat].units[from] / UNIT_DATA[cat].units[to];
    out.value = String(Math.round(result * 100000) / 100000);
  }

  function unitSwap() {
    const fromSel = document.getElementById('uc-from'), toSel = document.getElementById('uc-to');
    const tmp = fromSel.value; fromSel.value = toSel.value; toSel.value = tmp;
    unitConvert();
  }

  // ── countdown / pomodoro timer ──
  let ctMs = 1500000, ctTotalMs = 1500000, ctInterval = null, ctRunning = false;

  function _ctUpdateDisplay() {
    const disp = document.getElementById('ct-display'); if (!disp) return;
    const totalSec = Math.ceil(ctMs / 1000);
    const m = Math.floor(totalSec / 60), s = totalSec % 60;
    disp.textContent = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    const bar = document.getElementById('ct-bar');
    if (bar) bar.style.width = (ctTotalMs ? Math.round((ctMs / ctTotalMs) * 100) : 0) + '%';
  }

  function _ctClearDoneState() {
    clearInterval(ctInterval); ctRunning = false;
    const btn = document.getElementById('ct-start'); if (btn) btn.textContent = 'Iniciar';
    document.getElementById('ct-display')?.classList.remove('timer-display--done');
  }

  function ctSetPreset(min) {
    _ctClearDoneState();
    ctTotalMs = min * 60000; ctMs = ctTotalMs;
    const customInput = document.getElementById('ct-custom'); if (customInput) customInput.value = '';
    _ctUpdateDisplay();
  }

  function ctSetCustom() {
    const min = parseFloat(document.getElementById('ct-custom').value);
    if (!min || min <= 0) return;
    _ctClearDoneState();
    ctTotalMs = Math.round(min * 60000); ctMs = ctTotalMs;
    _ctUpdateDisplay();
  }

  function ctToggle() {
    if (!ctTotalMs) return;
    const btn = document.getElementById('ct-start');
    if (!ctRunning) {
      if (ctMs <= 0) return;
      ctRunning = true;
      const start = Date.now(), startMs = ctMs;
      ctInterval = setInterval(() => {
        ctMs = Math.max(0, startMs - (Date.now() - start));
        _ctUpdateDisplay();
        if (ctMs <= 0) ctFinish();
      }, 200);
      btn.textContent = 'Pausar';
      Audio.click();
    } else {
      clearInterval(ctInterval); ctRunning = false;
      btn.textContent = 'Iniciar';
      Audio.click();
    }
  }

  function ctReset() {
    _ctClearDoneState();
    ctMs = ctTotalMs;
    _ctUpdateDisplay();
  }

  function ctFinish() {
    clearInterval(ctInterval); ctRunning = false;
    const btn = document.getElementById('ct-start'); if (btn) btn.textContent = 'Iniciar';
    document.getElementById('ct-display')?.classList.add('timer-display--done');
    Audio.alarm();
    UI.showToast('⏰ ¡Tiempo cumplido!');
  }

  // ── color palette generator ──
  function _hexToHsl(hex) {
    const h = hex.replace('#','');
    const r = parseInt(h.slice(0,2),16)/255, g = parseInt(h.slice(2,4),16)/255, b = parseInt(h.slice(4,6),16)/255;
    const max = Math.max(r,g,b), min = Math.min(r,g,b);
    let hh = 0, ss = 0; const ll = (max+min)/2;
    if (max !== min) {
      const d = max-min;
      ss = ll > .5 ? d/(2-max-min) : d/(max+min);
      hh = max===r ? (g-b)/d+(g<b?6:0) : max===g ? (b-r)/d+2 : (r-g)/d+4;
      hh *= 60;
    }
    return [hh, ss*100, ll*100];
  }

  function _hslToHex(h, s, l) {
    h = ((h % 360) + 360) % 360; s /= 100; l /= 100;
    const c = (1-Math.abs(2*l-1))*s, x = c*(1-Math.abs((h/60)%2-1)), m = l-c/2;
    let r=0, g=0, b=0;
    if (h<60){r=c;g=x;} else if (h<120){r=x;g=c;} else if (h<180){g=c;b=x;}
    else if (h<240){g=x;b=c;} else if (h<300){r=x;b=c;} else {r=c;b=x;}
    const to255 = v => Math.round((v+m)*255).toString(16).padStart(2,'0');
    return '#'+to255(r)+to255(g)+to255(b);
  }

  function paletteGenerate() {
    const scheme = document.getElementById('pal-scheme').value;
    let hex = document.getElementById('pal-input').value.trim();
    if (scheme !== 'random') {
      if (!/^#?[0-9a-f]{6}$/i.test(hex)) {
        UI.showToast('⚠️ Ingresá un HEX válido, ej: #ff6ef7');
        Audio.error();
        return;
      }
      if (!hex.startsWith('#')) hex = '#' + hex;
    }
    const lightness = [30, 45, 60, 75, 85];
    const swatches = [];
    if (scheme === 'random') {
      for (let i = 0; i < 5; i++) swatches.push(_hslToHex(Math.random()*360, 65, lightness[i]));
    } else {
      const [h, s] = _hexToHsl(hex);
      const sat = Math.max(s, 45);
      const hueOffsets = {
        complementario: [0, 0, 180, 180, 180],
        analogo:        [-30, -15, 0, 15, 30],
        triadico:       [0, 120, 120, 240, 240],
        monocromatico:  [0, 0, 0, 0, 0],
      }[scheme];
      hueOffsets.forEach((off, i) => swatches.push(_hslToHex(h + off, sat, lightness[i])));
    }
    const resultEl = document.getElementById('pal-result');
    resultEl.innerHTML = swatches.map(c => `
      <div class="pal-swatch" style="background:${c}" onclick="UI.copyText('${c}',this.querySelector('.pal-swatch__code'))">
        <span class="pal-swatch__code">${c}</span>
      </div>`).join('');
    resultEl.style.display = 'grid';
    Audio.success();
  }

  return {
    previewImg, onQualityChange, compressImg,
    previewConvertFiles, convertImg,
    previewPdfFiles, imgToPdf,
    previewVideo, compressVid,
    previewAudio, compressAudio,
    pdfToText, cobaltDl,
    liveQR, downloadQR,
    liveColor, convertColor, pickScreenColor,
    convertCase, updateWC,
    aiSummarize, aiCorrect, aiTranslate, aiExpand,
    b64Action, b64SetMode, b64FileLoad, genHash, hashSetMode,
    timerToggle, timerLap, timerReset,
    genUUIDs, fetchIP,
    pmLoad, pmRemove, pmMerge, pmRenderList, pmDragStart, pmDrop,
    psLoad, psReset, psSetScope, psToggleSelect, psHighlightRange, psSplit,
    pcLoad, pcReset, pcUpdateEst, pcCompress,
    pjLoad, pjReset, pjUpdateScaleLabel, pjUpdateQLLabel, pjConvert,
    puLoad, puReset, puUnlock,
    prLoad, prReset, prSetMode, prOnSlider, prSnapDeg, prSetDeg, prSetScope, prToggleSelect, prUpdatePreview, prRotate,
    pdLoad, pdReset, pdToggleSelect, pdDelete,
    poLoad, poSetScope, poToggleSelect, poOCR,
    _dropName,
    irLoad, irSetMode, irToggleCompress, irSyncAR, irPreset, irPreviewLive, irDownload,
    mrLoad, mrProcess,
    fvLoad, fvDownloadPng, fvDownloadIco,
    bgLoad, bgAutoDetect, bgApply, bgDownload,
    pwdGenerate,
    jsonFormat,
    textDiffRun, diffSetMode,
    regexRun,
    loremGenerate,
    slugifyLive,
    imgPaletteLoad, imgPaletteExtract,
    unitCatChange, unitConvert, unitSwap,
    ctSetPreset, ctSetCustom, ctToggle, ctReset,
    paletteGenerate,
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
        `<div class="btn-row" style="margin-bottom:.9rem">
          <button class="btn btn--sec" onclick="Admin.exportBackup()" style="font-size:.7rem;padding:.3rem .6rem">⬇️ Exportar backup</button>
          <button class="btn btn--sec" onclick="document.getElementById('admin-import-file').click()" style="font-size:.7rem;padding:.3rem .6rem">⬆️ Importar backup</button>
          <input type="file" id="admin-import-file" accept="application/json" style="display:none" onchange="Admin.importBackup(this.files[0]);this.value=''">
        </div>` +
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

  function exportBackup() {
    const data = { extra, hidden, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'tarotools-backup.json';
    a.click();
    UI.showToast('✦ backup descargado');
    Audio.success();
  }

  function importBackup(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (!Array.isArray(data.extra) || !Array.isArray(data.hidden)) throw new Error('formato inválido');
        extra = data.extra;
        hidden = data.hidden;
        saveExtra(); saveHidden();
        Tools.renderGrid(); renderBody();
        UI.showToast('✦ backup importado');
        Audio.success();
      } catch(e) {
        UI.showToast('⚠️ Archivo de backup inválido');
        Audio.error();
      }
    };
    reader.readAsText(file);
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
    exportBackup, importBackup,
  };
})();

/* ═══════════════════════════════════════════════
   INIT
═══════════════════════════════════════════════ */
I18n.set('es');
/* ── drag over highlight ── */
document.addEventListener('dragover', e => {
  e.preventDefault();
  const drop = e.target.closest('.file-drop');
  if (drop) drop.classList.add('drag-over');
});
document.addEventListener('dragleave', e => {
  const drop = e.target.closest('.file-drop');
  if (drop && !drop.contains(e.relatedTarget)) drop.classList.remove('drag-over');
});
document.addEventListener('drop', e => {
  document.querySelectorAll('.file-drop').forEach(d => d.classList.remove('drag-over'));
});

/* ── deep link ── */
(function initDeepLink() {
  function openFromHash() {
    const hash = location.hash.replace('#', '').trim();
    if (!hash) return;
    const tool = Tools.allTools().find(t => t.id === hash);
    if (tool && !tool.soon) Tools.openTool(tool);
  }
  window.addEventListener('DOMContentLoaded', () => setTimeout(openFromHash, 100));
  window.addEventListener('hashchange', openFromHash);
})();
