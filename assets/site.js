/* 🧉 Tata — página web: idioma, encabezado/pie comunes, comandos y guía. */
(() => {
  // ───────────── Configuración (links) ─────────────
  // Lo que esté vacío no se muestra.
  const CONFIG = {
    invite:
      'https://discord.com/oauth2/authorize?client_id=1573429647566180523&permissions=1099780189206&integration_type=0&scope=bot+applications.commands',
    support: '', // link de invitación al servidor de soporte (ej: https://discord.gg/xxxx)
    votes: [
      { name: 'Discord Bot List', url: 'https://discordbotlist.com/bots/tatabot/upvote' },
      // { name: 'Top.gg', url: 'https://top.gg/bot/1573429647566180523/vote' }, // cuando lo aprueben
    ],
    pay: [
      { name: 'Ko-fi', note: { es: 'USD, con tarjeta o PayPal', en: 'USD, card or PayPal' }, emoji: '💖', url: 'https://ko-fi.com/tatabot' },
      { name: 'Mercado Pago', note: { es: 'ARS, pago instantáneo', en: 'ARS, instant payment' }, emoji: '🔵', url: 'https://link.mercadopago.com.ar/tatabot' },
      { name: 'Cafecito', note: { es: 'ARS', en: 'ARS' }, emoji: '☕', url: 'https://cafecito.app/tatabot' },
    ],
    contact: 'https://github.com/NachoCro/TataWeb/issues', // para consultas legales/privacidad si no hay servidor de soporte
  };

  const $ = (sel, root = document) => root.querySelector(sel);
  const el = (tag, attrs = {}, ...children) => {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (v == null || v === false) continue;
      if (k === 'class') node.className = v;
      else if (k === 'text') node.textContent = v;
      else node.setAttribute(k, v === true ? '' : v);
    }
    for (const c of children.flat()) if (c != null && c !== false) node.append(c.nodeType ? c : document.createTextNode(c));
    return node;
  };
  const bi = (es, en) => [el('span', { 'data-only': 'es' }, es), el('span', { 'data-only': 'en' }, en)];

  // ───────────── Idioma ─────────────
  const lang = () => document.documentElement.dataset.lang || 'es';
  function setLang(l) {
    document.documentElement.dataset.lang = l;
    document.documentElement.lang = l;
    try {
      localStorage.setItem('tata-lang', l);
    } catch {}
    const title = document.querySelector(`meta[name="title-${l}"]`)?.content;
    if (title) document.title = title;
    document.dispatchEvent(new CustomEvent('tata:lang', { detail: l }));
  }

  // ───────────── Encabezado y pie ─────────────
  const PAGES = [
    { href: 'index.html', es: 'Inicio', en: 'Home', id: 'inicio' },
    { href: 'comandos.html', es: 'Comandos', en: 'Commands', id: 'comandos' },
    { href: 'guia.html', es: 'Guía', en: 'Guide', id: 'guia' },
    { href: 'premium.html', es: 'Premium', en: 'Premium', id: 'premium' },
  ];

  function header() {
    const current = document.body.dataset.page;
    const nav = el('nav', { class: 'nav', id: 'nav', 'aria-label': 'Menú' }, PAGES.map((p) => el('a', { href: p.href, 'aria-current': p.id === current ? 'page' : null }, bi(p.es, p.en))));
    const menu = el('button', { class: 'menu-btn', 'aria-label': 'Menú', 'aria-expanded': 'false', 'aria-controls': 'nav' }, '☰');
    menu.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      menu.setAttribute('aria-expanded', String(open));
    });
    const langBox = el(
      'div',
      { class: 'lang', role: 'group', 'aria-label': 'Idioma / Language' },
      el('button', { 'data-set': 'es', type: 'button' }, 'ES'),
      el('button', { 'data-set': 'en', type: 'button' }, 'EN'),
    );
    langBox.addEventListener('click', (e) => {
      const l = e.target.closest('[data-set]')?.dataset.set;
      if (l) setLang(l);
    });
    return el(
      'header',
      { class: 'top' },
      el(
        'div',
        { class: 'wrap' },
        el('a', { class: 'brand', href: 'index.html' }, el('span', { class: 'mate', 'aria-hidden': 'true' }, '🧉'), 'Tata'),
        nav,
        menu,
        langBox,
        el('a', { class: 'btn btn-gold btn-sm btn-invite', href: CONFIG.invite, target: '_blank', rel: 'noopener' }, bi('Agregar a Discord', 'Add to Discord')),
      ),
    );
  }

  function footer() {
    return el(
      'footer',
      {},
      el(
        'div',
        { class: 'wrap' },
        el('div', {}, '🧉 ', el('strong', {}, 'Tata'), ' · ', bi('Mitología latinoamericana en Discord', 'Latin American folklore on Discord')),
        el(
          'nav',
          { 'aria-label': 'Pie' },
          el('a', { href: CONFIG.invite, target: '_blank', rel: 'noopener' }, bi('Invitar', 'Invite')),
          CONFIG.support && el('a', { href: CONFIG.support, target: '_blank', rel: 'noopener' }, bi('Soporte', 'Support')),
          el('a', { href: 'premium.html' }, 'Premium'),
          el('a', { href: 'terminos.html' }, bi('Términos', 'Terms')),
          el('a', { href: 'privacidad.html' }, bi('Privacidad', 'Privacy')),
        ),
        el('div', { class: 'muted' }, bi('No afiliado a Discord Inc.', 'Not affiliated with Discord Inc.')),
      ),
    );
  }

  // Links con data-link="invite|support|contact|vote" y listas de pago/votos
  function fillLinks() {
    document.querySelectorAll('[data-link]').forEach((a) => {
      const key = a.dataset.link;
      const url = key === 'vote' ? CONFIG.votes[0]?.url : CONFIG[key];
      if (url) {
        a.href = url;
        if (url.startsWith('http')) {
          a.target = '_blank';
          a.rel = 'noopener';
        }
      } else if (key === 'support') a.remove();
    });
    document.querySelectorAll('[data-pay]').forEach((box) => {
      box.replaceChildren(
        ...CONFIG.pay.map((p) =>
          el('a', { class: 'btn btn-ghost', href: p.url, target: '_blank', rel: 'noopener' }, `${p.emoji} ${p.name}`, el('span', { class: 'muted', 'data-only': 'es' }, ` · ${p.note.es}`), el('span', { class: 'muted', 'data-only': 'en' }, ` · ${p.note.en}`)),
        ),
      );
    });
    document.querySelectorAll('[data-votes]').forEach((box) => {
      box.replaceChildren(...CONFIG.votes.map((v) => el('a', { class: 'btn btn-ghost', href: v.url, target: '_blank', rel: 'noopener' }, `🗳️ ${v.name}`)));
    });
  }

  // ───────────── Datos generados (scripts/build-data.js) ─────────────
  const cache = {};
  async function data(name) {
    const key = `${lang()}/${name}`;
    cache[key] ??= fetch(`data/${key}.json`).then((r) => {
      if (!r.ok) throw new Error(r.status);
      return r.json();
    });
    return cache[key];
  }
  const norm = (s) => String(s ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  // **negrita** y `código` de los textos del bot → HTML seguro
  const rich = (text) => {
    const span = document.createElement('span');
    String(text ?? '')
      .split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g)
      .forEach((part) => {
        if (/^\*\*[^*]+\*\*$/.test(part)) span.append(el('strong', {}, part.slice(2, -2)));
        else if (/^`[^`]+`$/.test(part)) span.append(el('code', {}, part.slice(1, -1)));
        else if (/^\*[^*]+\*$/.test(part)) span.append(el('em', {}, part.slice(1, -1)));
        else span.append(part);
      });
    return span;
  };

  // ───────────── Página de comandos ─────────────
  async function commandsPage() {
    const list = $('#commands');
    const search = $('#cmd-search');
    const chips = $('#cmd-cats');
    let active = 'all';

    async function render() {
      let db;
      try {
        db = await data('commands');
      } catch {
        list.replaceChildren(el('p', { class: 'empty' }, bi('No se pudieron cargar los comandos.', 'Could not load the commands.')));
        return;
      }
      chips.replaceChildren(
        el('button', { class: 'chip', type: 'button', 'data-cat': 'all', 'aria-pressed': String(active === 'all') }, bi('Todos', 'All')),
        ...db.categories.map((c) => el('button', { class: 'chip', type: 'button', 'data-cat': c.id, 'aria-pressed': String(active === c.id) }, `${c.emoji} ${c.name}`)),
      );
      const q = norm(search.value);
      const blocks = [];
      for (const cat of db.categories) {
        if (active !== 'all' && cat.id !== active) continue;
        const cmds = cat.commands.filter((c) => !q || norm([c.name, c.also, c.desc, ...c.aliases].join(' ')).includes(q));
        if (!cmds.length) continue;
        blocks.push(
          el('div', { class: 'cat' }, el('h2', {}, `${cat.emoji} ${cat.name}`), cat.desc && el('p', {}, rich(cat.desc))),
          ...cmds.map((c) =>
            el(
              'details',
              { class: 'cmd' },
              el('summary', {}, el('span', { class: 'name' }, `/${c.name}`), c.usage && el('span', { class: 'usage' }, c.usage), el('span', { class: 'desc' }, c.desc)),
              el(
                'div',
                { class: 'more' },
                c.options.length
                  ? el(
                      'ul',
                      {},
                      c.options.map((o) =>
                        el('li', {}, el('code', {}, o.name), o.required ? '' : lang() === 'en' ? ' (optional)' : ' (opcional)', ` — ${o.desc}`, o.choices.length ? el('div', { class: 'muted' }, o.choices.join(' · ')) : null),
                      ),
                    )
                  : null,
                el(
                  'p',
                  { style: 'margin:8px 0 0' },
                  bi('Con prefijo: ', 'With prefix: '),
                  el('code', {}, `?${c.name}`),
                  c.also ? [' · ', el('code', {}, `?${c.also}`)] : null,
                  c.aliases.length ? [' · ', ...c.aliases.flatMap((a, i) => [i ? ' ' : '', el('code', {}, `?${a}`)])] : null,
                ),
              ),
            ),
          ),
        );
      }
      list.replaceChildren(...(blocks.length ? blocks : [el('p', { class: 'empty' }, bi('No encontré ningún comando con eso.', 'No command matches that.'))]));
    }

    chips.addEventListener('click', (e) => {
      const id = e.target.closest('[data-cat]')?.dataset.cat;
      if (!id) return;
      active = id;
      render();
    });
    search.addEventListener('input', render);
    document.addEventListener('tata:lang', render);
    render();
  }

  // ───────────── Guía del juego ─────────────
  const TABS = [
    { id: 'gifts', emoji: '🎰', es: 'Dones', en: 'Gifts' },
    { id: 'creatures', emoji: '👹', es: 'Criaturas', en: 'Creatures' },
    { id: 'zones', emoji: '🗺️', es: 'Zonas', en: 'Zones' },
    { id: 'nahuales', emoji: '🐾', es: 'Nahuales', en: 'Nahuales' },
    { id: 'relics', emoji: '🎒', es: 'Reliquias', en: 'Relics' },
    { id: 'ranks', emoji: '🎖️', es: 'Rangos', en: 'Ranks' },
  ];
  const T = (es, en) => (lang() === 'en' ? en : es);

  const RENDER = {
    gifts: (g) =>
      el(
        'article',
        { class: `entry r-${g.rarity.id}` },
        el('div', { class: 'head' }, el('span', { class: 'emoji' }, g.emoji), el('div', {}, el('h3', {}, g.name), el('div', { class: 'sub' }, `${g.rarity.emoji} ${g.rarity.name} · ${g.origin}`))),
        el(
          'ul',
          {},
          g.skills.map((s) => el('li', {}, el('strong', {}, s.name), ` (${T('Nv', 'Lv')} ${s.level}, ${s.cost}⚡) — ${s.effect}`)),
          g.greatSpell && el('li', {}, '🩸 ', el('strong', {}, g.greatSpell.name), ` (100⚡) — ${g.greatSpell.effect}`),
        ),
      ),
    creatures: (group) =>
      el(
        'article',
        { class: 'entry' },
        el('div', { class: 'head' }, el('span', { class: 'emoji' }, group.grade.emoji), el('div', {}, el('h3', {}, group.grade.name), el('div', { class: 'sub' }, `${group.creatures.length} ${T('criaturas', 'creatures')}`))),
        el('ul', {}, group.creatures.map((c) => el('li', {}, `${c.emoji} `, el('strong', {}, c.name), c.skills.length ? el('span', { class: 'muted' }, ` — ${c.skills.join(', ')}`) : null))),
      ),
    zones: (z) =>
      el(
        'article',
        { class: 'entry' },
        el('div', { class: 'head' }, el('span', { class: 'emoji' }, z.emoji), el('div', {}, el('h3', {}, z.name), el('div', { class: 'sub' }, `${T('Nv', 'Lv')} ${z.level}+ · ${z.safe ? T('🛡️ segura', '🛡️ safe') : T('⚠️ peligrosa', '⚠️ dangerous')}`))),
        el('p', { style: 'margin:0' }, z.desc),
        el('div', { class: 'stats' }, z.grades.map((g) => `${g.emoji} ${g.name}`).join(' · '), z.boss ? ` · 👑 ${z.boss}` : ''),
      ),
    nahuales: (n) =>
      el(
        'article',
        { class: `entry r-${n.rarity.id}` },
        el('div', { class: 'head' }, el('span', { class: 'emoji' }, n.emoji), el('div', {}, el('h3', {}, n.name), el('div', { class: 'sub' }, `${n.rarity.emoji} ${n.rarity.name}`))),
        el('p', { style: 'margin:0' }, n.passive),
      ),
    relics: (r) =>
      el(
        'article',
        { class: `entry r-${r.rarity.id}` },
        el('div', { class: 'head' }, el('span', { class: 'emoji' }, r.emoji), el('div', {}, el('h3', {}, r.name), el('div', { class: 'sub' }, `${r.rarity.emoji} ${r.rarity.name} · ${r.slot}`))),
        el('p', { style: 'margin:0' }, r.desc),
        r.stats && el('div', { class: 'stats' }, r.stats),
      ),
    ranks: (r) =>
      el(
        'article',
        { class: 'entry' },
        el('div', { class: 'head' }, el('span', { class: 'emoji' }, r.emoji), el('div', {}, el('h3', {}, r.name), el('div', { class: 'sub' }, `${T('Desde el nivel', 'From level')} ${r.level}`))),
        el('p', { style: 'margin:0' }, r.desc),
      ),
  };
  const TEXT = {
    gifts: (g) => [g.name, g.origin, g.rarity.name, ...g.skills.map((s) => s.name), g.greatSpell?.name],
    creatures: (g) => [g.grade.name, ...g.creatures.map((c) => c.name)],
    zones: (z) => [z.name, z.desc, z.boss],
    nahuales: (n) => [n.name, n.passive, n.rarity.name],
    relics: (r) => [r.name, r.desc, r.slot, r.rarity.name, r.stats],
    ranks: (r) => [r.name, r.desc],
  };

  async function guidePage() {
    const tabs = $('#guide-tabs');
    const list = $('#guide');
    const search = $('#guide-search');
    let tab = (location.hash.slice(1) && TABS.some((t) => t.id === location.hash.slice(1)) && location.hash.slice(1)) || 'gifts';

    async function render() {
      tabs.replaceChildren(...TABS.map((t) => el('button', { class: 'chip', type: 'button', 'data-tab': t.id, 'aria-pressed': String(t.id === tab) }, `${t.emoji} `, bi(t.es, t.en))));
      let db;
      try {
        db = await data('guide');
      } catch {
        list.replaceChildren(el('p', { class: 'empty' }, bi('No se pudo cargar la guía.', 'Could not load the guide.')));
        return;
      }
      const q = norm(search.value);
      const items = db[tab].filter((x) => !q || norm(TEXT[tab](x).join(' ')).includes(q));
      list.replaceChildren(...(items.length ? items.map(RENDER[tab]) : [el('p', { class: 'empty' }, bi('No hay nada con eso.', 'Nothing matches that.'))]));
    }

    tabs.addEventListener('click', (e) => {
      const id = e.target.closest('[data-tab]')?.dataset.tab;
      if (!id) return;
      tab = id;
      history.replaceState(null, '', `#${id}`);
      render();
    });
    search.addEventListener('input', render);
    document.addEventListener('tata:lang', render);
    render();
  }

  // ───────────── Arranque ─────────────
  document.body.prepend(header());
  document.body.append(footer());
  fillLinks();
  setLang(lang());
  window.TATA = { commandsPage, guidePage, CONFIG };
})();
