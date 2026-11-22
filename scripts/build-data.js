/*
 * Genera data/es/*.json y data/en/*.json a partir del código del bot (../TataBot).
 * Correr cada vez que cambien los comandos o el contenido del juego:
 *
 *   node scripts/build-data.js            (busca el bot en ../TataBot)
 *   node scripts/build-data.js C:/ruta/al/TataBot
 *
 * No arranca el bot (no carga src/index.js) ni escribe nada en su carpeta.
 */
const fs = require('fs');
const path = require('path');

const BOT = path.resolve(process.argv[2] ?? path.join(__dirname, '..', '..', 'TataBot'));
const OUT = path.join(__dirname, '..', 'data');
const req = (p) => require(path.join(BOT, p));

process.env.DISCORD_TOKEN ??= 'no-se-usa'; // algunos módulos lo miran al cargar; nunca se conecta

const runtime = req('src/i18n/runtime.js');
const { commandList } = req('src/commands.js');
const { CATEGORIES } = req('src/help.js');
const EN_COMMANDS = req('src/i18n/en.js').commands ?? {};
const { TECHNIQUES, RARITIES, describe: describeAbility } = req('src/games/techniques.js');
const { SHIKIGAMIS } = req('src/games/shikigamis.js');
const { ZONE_ORDER } = req('src/games/zones.js');
const { GRADES, CURSES } = req('src/games/curses.js');
const { ITEMS, SLOTS, describeStats } = req('src/games/items.js');
const { RANKS } = req('src/games/ranks.js');

// Abreviaciones del prefijo (no se exportan: se leen del código)
const commandsSrc = fs.readFileSync(path.join(BOT, 'src/commands.js'), 'utf8');
const ALIASES = Function(`return ${commandsSrc.match(/const ALIASES = (\{[\s\S]*?\n\});/)[1]}`)();

// Idioma "falso" para traducir con el mismo sistema del bot
const EN_GUILD = { id: 'tataweb-en', preferredLocale: 'en-US' };
const ES_GUILD = { id: 'tataweb-es', preferredLocale: 'es-ES' };
const inLang = (lang, fn) => runtime.withLang(lang === 'en' ? EN_GUILD : ES_GUILD, fn);
const tr = (lang, text) => (lang === 'en' && text ? (runtime.DICT.get(text) ?? text) : text);

function build(lang) {
  const L = (text) => tr(lang, text);

  // ───────────── Comandos ─────────────
  const all = commandList();
  const byName = new Map(all.map((c) => [c.name, c]));
  const shown = (c) => (lang === 'en' ? c.name_localizations?.['en-US'] ?? c.name : c.name);
  const descOf = (c) => (lang === 'en' ? c.description_localizations?.['en-US'] ?? c.description : c.description);
  const command = (name) => {
    const c = byName.get(name);
    if (!c) return null;
    const options = (c.options ?? []).map((o) => ({
      name: shown(o),
      desc: descOf(o),
      required: Boolean(o.required),
      choices: (o.choices ?? []).map((ch) => (lang === 'en' ? ch.name_localizations?.['en-US'] ?? ch.name : ch.name)),
    }));
    return {
      name: shown(c),
      // con prefijo andan los dos nombres
      also: lang === 'en' && shown(c) !== c.name ? c.name : EN_COMMANDS[c.name]?.name && EN_COMMANDS[c.name].name !== c.name ? EN_COMMANDS[c.name].name : null,
      desc: descOf(c),
      usage: options.map((o) => (o.required ? `<${o.name}>` : `[${o.name}]`)).join(' '),
      options,
      aliases: ALIASES[c.name] ?? [],
      mod: Boolean(c.default_member_permissions),
    };
  };
  const used = new Set();
  const categories = CATEGORIES.map((cat) => {
    const names = cat.mod ? all.filter((c) => c.default_member_permissions && !CATEGORIES.some((k) => k.commands?.includes(c.name))).map((c) => c.name) : cat.commands;
    names.forEach((n) => used.add(n));
    return { id: cat.id, emoji: cat.emoji, name: L(cat.name), desc: L(cat.desc), commands: names.map(command).filter(Boolean) };
  });
  const others = all.filter((c) => !used.has(c.name)).map((c) => command(c.name));
  if (others.length) categories.push({ id: 'otros', emoji: '📦', name: L('📦 Otros').replace(/^📦 /, ''), desc: '', commands: others });

  // ───────────── Guía ─────────────
  const rarity = (id) => ({ id, emoji: RARITIES[id]?.emoji ?? '', name: L(RARITIES[id]?.name ?? id) });
  const gifts = inLang(lang, () =>
    Object.entries(TECHNIQUES)
      .filter(([id]) => id !== 'supay') // el don de Supay no sale en la ruleta
      .map(([id, t]) => ({
        id,
        emoji: t.emoji,
        name: L(t.name),
        origin: L(t.user),
        rarity: rarity(t.rarity),
        skills: t.abilities.map((a) => ({ name: L(a.name), level: a.level, cost: a.cost, effect: describeAbility(a) })),
        greatSpell: t.domain ? { name: L(t.domain.name), effect: describeAbility(t.domain) } : null,
      })),
  );
  const rarityOrder = ['legendario', 'epico', 'raro', 'comun'];
  gifts.sort((a, b) => rarityOrder.indexOf(a.rarity.id) - rarityOrder.indexOf(b.rarity.id));

  const nahuales = Object.entries(SHIKIGAMIS).map(([id, s]) => ({ id, emoji: s.emoji, name: L(s.name), rarity: rarity(s.rarity), passive: L(s.desc) }));
  nahuales.sort((a, b) => rarityOrder.indexOf(a.rarity.id) - rarityOrder.indexOf(b.rarity.id));

  const zones = ZONE_ORDER.map(([id, z]) => ({
    id,
    emoji: z.emoji,
    name: L(z.name),
    level: z.minLevel,
    safe: Boolean(z.safe),
    desc: L(z.desc),
    boss: z.boss ? L(z.boss) : null,
    grades: z.grades.map((g) => ({ emoji: GRADES[g].emoji, name: L(GRADES[g].name) })),
  }));

  const creatures = Object.entries(CURSES)
    .map(([grade, list]) => ({
      grade: { id: grade, emoji: GRADES[grade]?.emoji, name: L(GRADES[grade]?.name ?? grade) },
      creatures: list.filter((c) => c.latam).map((c) => ({ emoji: c.emoji, name: L(c.name), skills: (c.abilities ?? []).map((a) => L(a[0])) })),
    }))
    .filter((g) => g.creatures.length);
  const gradeOrder = ['4', '3', '2', '1', 'especial', 'calamidad', 'primordial', 'heian'];
  creatures.sort((a, b) => gradeOrder.indexOf(a.grade.id) - gradeOrder.indexOf(b.grade.id));

  const relics = inLang(lang, () =>
    Object.entries(ITEMS).map(([id, it]) => ({
      id,
      emoji: it.emoji,
      name: L(it.name),
      slot: L(SLOTS[it.slot]?.name ?? it.slot),
      rarity: rarity(it.rarity),
      desc: L(it.desc),
      stats: describeStats(it.stats ?? {}),
      craftOnly: Boolean(it.craftOnly),
    })),
  );
  relics.sort((a, b) => rarityOrder.indexOf(a.rarity.id) - rarityOrder.indexOf(b.rarity.id));

  const ranks = RANKS.map((r) => ({ emoji: r.emoji, name: L(r.name), level: r.level, desc: L(r.desc) }));

  return { commands: { categories }, guide: { gifts, nahuales, zones, creatures, relics, ranks } };
}

for (const lang of ['es', 'en']) {
  const { commands, guide } = build(lang);
  const dir = path.join(OUT, lang);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'commands.json'), JSON.stringify(commands, null, 1));
  fs.writeFileSync(path.join(dir, 'guide.json'), JSON.stringify(guide, null, 1));
  const n = commands.categories.reduce((s, c) => s + c.commands.length, 0);
  console.log(`✅ ${lang}: ${n} comandos · ${guide.gifts.length} dones · ${guide.nahuales.length} nahuales · ${guide.zones.length} zonas · ${guide.relics.length} reliquias`);
}
