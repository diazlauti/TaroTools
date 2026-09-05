'use strict';

/* ═════════════════════════════════════════
   MISIONES — desbloquean la paleta
   ═════════════════════════════════════════ */
const Missions = (() => {

  const LIST = [
    { id:'night',   t:'entrar a la madrugada',            h:'entre 00:00 y 05:00' },
    { id:'weekend', t:'entrar un fin de semana',          h:'sábado o domingo' },
    { id:'light',   t:'probar el tema alternativo',       h:'el botón ☀ del header' },
    { id:'search',  t:'encontrar una tool buscándola',    h:'escribí en el prompt y abrila' },
    { id:'use1',    t:'procesar tu primer archivo',       h:'' },
    { id:'use3',    t:'usar 3 herramientas distintas',    h:'' },
    { id:'use7',    t:'usar 7 herramientas distintas',    h:'' },
    { id:'cats3',   t:'usar 3 categorías distintas',      h:'' },
    { id:'dl1',     t:'descargar un resultado',           h:'' },
    { id:'dl5',     t:'descargar 5 resultados',           h:'' },
    { id:'copy',    t:'copiar un resultado',              h:'' },
    { id:'gb',      t:'firmar el libro de visitas',       h:'' },
    { id:'return3', t:'volver en 3 días distintos',       h:'' },
    { id:'stay10',  t:'10 minutos en la página',          h:'' },
    { id:'konami',  t:'???',                              h:'↑ ↑ ↓ ↓ ← → ← → b a' },
  ];

  const TIER_PRESETS = 5;
  const TIER_FREE = 12;

  const PRESETS = [
    { name:'noche',    accent:'#9184d9', accent2:'#ff6ef7' },
    { name:'lima',     accent:'#c8ff00', accent2:'#ff2d95' },
    { name:'terminal', accent:'#7fbf8f', accent2:'#d9a84c' },
    { name:'hielo',    accent:'#00e5ff', accent2:'#7d6cff' },
  ];

  const KEY = 'tt_missions';
  const PKEY = 'tt_palette';
  let st = load();

  function load() {
    const d = { done:{}, tools:[], cats:[], days:[], dls:0 };
    try {
      const raw = JSON.parse(localStorage.getItem(KEY) || '{}');
      d.done  = raw.done  || {};
      d.tools = raw.tools || [];
      d.cats  = raw.cats  || [];
      d.days  = raw.days  || [];
      d.dls   = raw.dls   || 0;
    } catch (e) {}
    return d;
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} }

  function count() { return LIST.reduce((n, m) => n + (st.done[m.id] ? 1 : 0), 0); }

  function toast(msg) {
    const el = document.getElementById('toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove('show'), 2400);
  }

  function complete(id) {
    if (st.done[id]) return;
    const m = LIST.find(x => x.id === id);
    if (!m) return;
    st.done[id] = 1;
    save();
    render();
    const n = count();
    toast('✦ misión: ' + m.t);
    if (n === TIER_PRESETS) setTimeout(() => toast('✦ paletas desbloqueadas'), 2600);
    if (n === TIER_FREE)    setTimeout(() => toast('✦ colores libres desbloqueados'), 2600);
  }

  /* ── paleta ── */
  function applyPalette(p) {
    if (!p) return;
    document.documentElement.style.setProperty('--accent', p.accent);
    document.documentElement.style.setProperty('--accent2', p.accent2);
  }
  function savePalette(p) {
    try { localStorage.setItem(PKEY, JSON.stringify(p)); localStorage.setItem(PKEY + '_ok', '1'); } catch (e) {}
    applyPalette(p);
  }
  /* sin las misiones hechas, la paleta vuelve a la original */
  function clearPalette() {
    try { localStorage.removeItem(PKEY); localStorage.removeItem(PKEY + '_ok'); } catch (e) {}
    applyPalette(PRESETS[0]);
  }
  function currentPalette() {
    try { return JSON.parse(localStorage.getItem(PKEY) || 'null') || PRESETS[0]; }
    catch (e) { return PRESETS[0]; }
  }
  function pickPreset(i) { savePalette(PRESETS[i]); render(); toast('paleta: ' + PRESETS[i].name); }
  function setColor(which, val) {
    let p = currentPalette();
    p = { name:'propia', accent:p.accent, accent2:p.accent2 };
    p[which] = val;
    savePalette(p);
  }
  function resetPalette() { clearPalette(); render(); }

  /* ── render ── */
  function render() {
    const n = count(), total = LIST.length;
    const cEl = document.getElementById('mi-count');
    if (cEl) cEl.textContent = n + '/' + total;
    const fill = document.getElementById('mi-fill');
    if (fill) fill.style.width = Math.round(n / total * 100) + '%';

    const list = document.getElementById('mi-list');
    if (list) {
      list.innerHTML = '';
      LIST.forEach(m => {
        const done = !!st.done[m.id];
        const li = document.createElement('li');
        li.className = 'mi-item' + (done ? ' mi-item--done' : '');
        li.title = m.h || '';
        const box = document.createElement('span');
        box.className = 'mi-box';
        box.textContent = done ? '✔' : '·';
        const txt = document.createElement('span');
        txt.textContent = m.t;
        li.appendChild(box);
        li.appendChild(txt);
        list.appendChild(li);
      });
    }

    const rw = document.getElementById('mi-reward');
    if (!rw) return;
    rw.innerHTML = '';

    if (n < TIER_PRESETS) {
      const p = document.createElement('p');
      p.className = 'mi-locked';
      p.textContent = '🔒 ' + (TIER_PRESETS - n) + ' misiones más para las paletas';
      rw.appendChild(p);
      return;
    }

    const p = currentPalette();
    const head = document.createElement('p');
    head.className = 'mi-reward__head';
    head.textContent = 'paleta · ' + (p.name || 'propia');
    rw.appendChild(head);

    const sw = document.createElement('div');
    sw.className = 'mi-swatches';
    PRESETS.forEach((pr, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'mi-swatch' + (p.accent === pr.accent && p.accent2 === pr.accent2 ? ' mi-swatch--on' : '');
      b.title = pr.name;
      b.style.background = 'linear-gradient(90deg,' + pr.accent + ' 50%,' + pr.accent2 + ' 50%)';
      b.onclick = () => pickPreset(i);
      sw.appendChild(b);
    });
    rw.appendChild(sw);

    if (n < TIER_FREE) {
      const lk = document.createElement('p');
      lk.className = 'mi-locked';
      lk.textContent = '🔒 ' + (TIER_FREE - n) + ' más para elegir colores libres';
      rw.appendChild(lk);
      return;
    }

    const pk = document.createElement('div');
    pk.className = 'mi-pickers';
    [['accent', 'principal'], ['accent2', 'secundario']].forEach(pair => {
      const row = document.createElement('label');
      row.className = 'mi-picker';
      const inp = document.createElement('input');
      inp.type = 'color';
      inp.value = p[pair[0]];
      inp.oninput = () => setColor(pair[0], inp.value);
      row.appendChild(inp);
      row.appendChild(document.createTextNode(pair[1]));
      pk.appendChild(row);
    });
    rw.appendChild(pk);

    const rs = document.createElement('button');
    rs.type = 'button';
    rs.className = 'mi-reset';
    rs.textContent = 'volver al default';
    rs.onclick = resetPalette;
    rw.appendChild(rs);
  }

  /* ── hooks ── */
  function init() {
    if (count() < TIER_PRESETS) clearPalette();
    else applyPalette(currentPalette());

    const h = new Date().getHours();
    if (h >= 0 && h < 5) complete('night');
    const wd = new Date().getDay();
    if (wd === 0 || wd === 6) complete('weekend');

    const today = new Date().toDateString();
    if (st.days.indexOf(today) === -1) { st.days.push(today); save(); }
    if (st.days.length >= 3) complete('return3');

    setTimeout(() => complete('stay10'), 10 * 60 * 1000);

    if (document.body.classList.contains('light')) complete('light');
    new MutationObserver(() => {
      if (document.body.classList.contains('light')) complete('light');
    }).observe(document.body, { attributes:true, attributeFilter:['class'] });

    const s = document.getElementById('search');
    let searched = false;
    if (s) s.addEventListener('input', () => {
      if (s.value.trim().length >= 2) searched = true;
    });

    /* herramienta abierta actualmente */
    let cur = null;

    document.addEventListener('click', e => {
      const t = e.target;
      if (!t || !t.closest) return;
      const card = t.closest('.card');
      if (card && !card.classList.contains('card--soon')) {
        const nm = card.querySelector('.card__name');
        const ct = card.querySelector('.card__cat');
        cur = {
          name: nm ? nm.textContent.trim() : '',
          cat: ct ? ct.textContent.trim() : '',
          fromSearch: searched,
        };
      }
      /* "copiar" puede ser un .copy-btn dedicado o cualquier botón que llame a UI.copyText */
      const copyEl = t.closest('.copy-btn, button[onclick*="copyText"]');
      if (copyEl) complete('copy');
    }, true);

    /* uso real: el usuario eligió un archivo o la tool devolvió algo */
    function usedTool() {
      if (!cur || !cur.name) return;
      if (cur.fromSearch) complete('search');
      complete('use1');
      if (st.tools.indexOf(cur.name) === -1) {
        st.tools.push(cur.name); save();
        if (st.tools.length >= 3) complete('use3');
        if (st.tools.length >= 7) complete('use7');
      }
      if (cur.cat && st.cats.indexOf(cur.cat) === -1) {
        st.cats.push(cur.cat); save();
        if (st.cats.length >= 3) complete('cats3');
      }
    }

    document.addEventListener('change', e => {
      if (e.target && e.target.type === 'file' && e.target.files && e.target.files.length) usedTool();
    }, true);

    const body = document.getElementById('modal-body');
    if (body) new MutationObserver(muts => {
      const res = body.querySelector('.result-area');
      if (res && res.textContent.trim().length > 3) usedTool();
      muts.forEach(mu => {
        Array.prototype.forEach.call(mu.addedNodes || [], n => {
          if (n.nodeType !== 1) return;
          const isDl = n.classList && n.classList.contains('dl-link');
          if (isDl || (n.querySelector && n.querySelector('.dl-link'))) {
            usedTool();
            st.dls = (st.dls || 0) + 1; save();
            complete('dl1');
            if (st.dls >= 5) complete('dl5');
          }
        });
      });
    }).observe(body, { childList:true, subtree:true });

    const seq = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
    let pos = 0;
    document.addEventListener('keydown', e => {
      const k = e.key;
      if (k === seq[pos] || (k && k.toLowerCase && k.toLowerCase() === seq[pos])) {
        pos++;
        if (pos === seq.length) { pos = 0; complete('konami'); }
      } else {
        pos = (k === seq[0]) ? 1 : 0;
      }
    });

    render();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  return { complete, render, list: LIST };
})();
