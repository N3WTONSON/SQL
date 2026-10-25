"use strict";
/* =====================================================================
   4. MOTEUR : exécution isolée + validation
   ===================================================================== */
function run(query, setup = "") {
  const db = new SQL.Database();       // base neuve à chaque sort
  try {
    db.run(SCHEMA_SQL); if (setup) db.run(setup);
    const res = db.exec(query);
    const last = res[res.length - 1];
    return last ? { columns: last.columns, values: last.values } : { columns: [], values: [] };
  } finally { db.close(); }
}

/* --- Chapitre 4 : exécution sur un « monde » et photo des tables avant/après --- */
function worldSetup(L) {          // sorts attendus des niveaux précédents du même chapitre
  return LEVELS.filter((x) => x.mode === "write" && x.chapter === L.chapter && x.id < L.id).map((x) => x.expected).join("\n");
}
function snapshot(db, tables) {
  return tables.map((t) => {
    try {
      const cols = db.exec(`PRAGMA table_info(${t})`);
      if (!cols.length) return { table: t, missing: true };
      const r = db.exec(`SELECT * FROM ${t} ORDER BY 1`)[0];
      const plan = cols[0].values.map((c) => `${c[1]} ${String(c[2] || "").toUpperCase()}${c[5] ? " PRIMARY KEY" : ""}`);
      return { table: t, columns: cols[0].values.map((c) => c[1]), plan, sig: plan.join("|").toLowerCase(), values: r ? r.values : [] };
    } catch (e) { return { table: t, missing: true }; }
  });
}
function runWorld(L, query) {
  const db = new SQL.Database();
  try {
    db.run(SCHEMA_SQL);
    const setup = worldSetup(L); if (setup) db.run(setup);
    const before = snapshot(db, L.tables);
    const res = db.exec(query);
    const last = res[res.length - 1];
    return { before, after: snapshot(db, L.tables), res: last ? { columns: last.columns, values: last.values } : null };
  } finally { db.close(); }
}

/* --- TRADUCTEUR EN DIRECT : chaque morceau du sort expliqué en français pendant la frappe --- */
const TABLE_FR = { visites: "le registre des gardes", heros: "les héros", monstres: "les monstres", sorts: "les sorts", inventaire: "les objets des héros", chateaux: "les châteaux" };
let COLS = {}, COUNTS = {};            // remplis au démarrage depuis la base
const SQL_WORDS = new Set(("SELECT FROM WHERE AND OR NOT NULL IS IN LIKE AS ON JOIN LEFT INNER OUTER GROUP BY HAVING ORDER ASC DESC " +
  "LIMIT DISTINCT CASE WHEN THEN ELSE END COUNT SUM AVG MIN MAX ROUND UPPER LOWER LENGTH INSERT INTO VALUES UPDATE SET DELETE BETWEEN " +
  "CREATE TABLE ALTER DROP ADD COLUMN PRIMARY KEY INTEGER TEXT REAL REFERENCES WITH OVER PARTITION RANK DENSE_RANK ROW_NUMBER COALESCE IF EXISTS").split(" "));
const KW_SUGGEST = ["SELECT", "FROM", "WHERE", "JOIN", "LEFT", "GROUP", "BY", "HAVING", "ORDER", "LIMIT", "INSERT", "INTO", "VALUES", "UPDATE",
  "SET", "DELETE", "DISTINCT", "AND", "OR", "NOT", "LIKE", "NULL", "CASE", "WHEN", "THEN", "ELSE", "END", "DESC", "ASC", "COUNT", "SUM", "AVG", "AS", "ON", "IN", "IS",
  "CREATE", "TABLE", "ALTER", "DROP", "BETWEEN", "WITH", "COALESCE", "PRIMARY", "INTEGER", "TEXT", "MIN", "MAX", "UPPER", "LENGTH", "RANK", "OVER", "PARTITION"];
const FUNCS = { COUNT: "le nombre de", SUM: "la somme de", AVG: "la moyenne de", MIN: "la plus petite valeur de", MAX: "la plus grande valeur de" };
const OPS = { "=": "vaut", "<>": "ne vaut pas", "!=": "ne vaut pas", ">": "dépasse", "<": "vaut moins que", ">=": "vaut au moins", "<=": "vaut au plus" };
// Mots qu'un joueur peut taper par habitude (anglais, accents, singulier) → le vrai nom français du royaume
const FR_WORDS = { name: "nom", names: "nom", noms: "nom", class: "classe", level: "niveau", hp: "pv", vie: "pv", school: "ecole",
  power: "puissance", mana_cost: "mana", item: "objet", objets: "inventaire", rarity: "rarete", value: "valeur", prix: "valeur", lord: "seigneur",
  gold: "fortune", argent: "fortune", gold_reserve: "tresor", loot: "butin", castle_id: "num_chateau", chateau_id: "num_chateau", id_chateau: "num_chateau",
  hero_id: "num_heros", heros_id: "num_heros", id_heros: "num_heros", heroes: "heros", hero: "heros", monsters: "monstres", monster: "monstres", monstre: "monstres",
  spells: "sorts", spell: "sorts", sort: "sorts", inventory: "inventaire", castles: "chateaux", castle: "chateaux", chateau: "chateaux",
  "héros": "heros", "château": "chateaux", "châteaux": "chateaux", "chateau": "chateaux", "école": "ecole", "rareté": "rarete", "trésor": "tresor", "classé": "classe" };

let BASE_COLS = {}, BASE_COUNTS = {};
function buildDictionary(L) {      // tables du royaume, plus celles créées plus tôt dans le chapitre
  const db = new SQL.Database(); db.run(SCHEMA_SQL);
  try { const setup = L ? worldSetup(L) : ""; if (setup) db.run(setup); } catch (e) {}
  BASE_COLS = {}; BASE_COUNTS = {};
  (db.exec("SELECT name FROM sqlite_master WHERE type = 'table'")[0] || { values: [] }).values.forEach(([t]) => {
    BASE_COLS[t] = db.exec(`PRAGMA table_info(${t})`)[0].values.map((c) => c[1]);
    BASE_COUNTS[t] = db.exec(`SELECT COUNT(*) FROM ${t}`)[0].values[0][0];
  });
  db.close();
  COLS = { ...BASE_COLS }; COUNTS = { ...BASE_COUNTS };
}
function cteColumns(inner) {       // colonnes d'une liste préparée avec WITH
  const db = new SQL.Database();
  try { db.run(SCHEMA_SQL); const st = LEVELS[state.current]; const setup = worldSetup(st); if (setup) db.run(setup);
    const stmt = db.prepare(inner); const names = stmt.getColumnNames(); stmt.free(); return names; }
  catch (e) { return null; } finally { db.close(); }
}

function lev(a, b) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++)
    d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}
function closest(word, candidates) {
  let best = null, bd = 99;
  candidates.forEach((c) => { const d = lev(word.toLowerCase(), c.toLowerCase()); if (d < bd) { bd = d; best = c; } });
  return bd > 0 && bd <= Math.max(1, Math.min(2, Math.floor(word.length / 3))) ? best : null;
}

// Masque le contenu des textes '…' et des parenthèses, en gardant la même longueur, pour repérer la structure.
function maskSQL(s, fill = "_") {
  let out = "", q = null, d = 0;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (q) { out += ch === q ? ch : fill; if (ch === q) q = null; continue; }
    if (ch === "'" || ch === '"') { q = ch; out += d > 0 ? fill : ch; continue; }
    if (ch === "(") { d++; out += d === 1 ? "(" : fill; continue; }
    if (ch === ")") { d = Math.max(0, d - 1); out += d === 0 ? ")" : fill; continue; }
    out += d > 0 ? fill : ch;
  }
  return out;
}
function splitTop(t, re) {
  const m = maskSQL(t), parts = []; let last = 0, op = null; const r = new RegExp(re.source, "gi"); let x;
  while ((x = r.exec(m))) { parts.push({ op, text: t.slice(last, x.index).trim() }); op = x[0].toUpperCase().trim(); last = x.index + x[0].length; }
  parts.push({ op, text: t.slice(last).trim() });
  return parts.filter((p) => p.text);
}
const splitComma = (t) => splitTop(t, /,/).map((p) => p.text);
const code = (x) => `<code>${esc(x.trim())}</code>`;
const frList = (arr) => arr.length < 2 ? arr.join("") : arr.slice(0, -1).join(", ") + " et " + arr[arr.length - 1];

function clausesOf(stmt) {
  const m = maskSQL(stmt), re = /\b(WITH|CREATE\s+TABLE|ALTER\s+TABLE|ADD\s+COLUMN|DROP\s+TABLE|SELECT|FROM|LEFT\s+JOIN|INNER\s+JOIN|JOIN|ON|WHERE|GROUP\s+BY|HAVING|ORDER\s+BY|LIMIT|INSERT\s+INTO|VALUES|UPDATE|SET|DELETE\s+FROM)\b/gi;
  const hits = []; let x;
  while ((x = re.exec(m))) hits.push({ kw: x[1].toUpperCase().replace(/\s+/g, " "), start: x.index, end: x.index + x[0].length });
  return { before: stmt.slice(0, hits.length ? hits[0].start : stmt.length).trim(),
    list: hits.map((h, i) => ({ kw: h.kw, text: stmt.slice(h.end, i + 1 < hits.length ? hits[i + 1].start : stmt.length).trim() })) };
}

function checkWord(w, qual, ctx) {     // vérifie qu'un nom désigne bien une colonne connue
  const all = [...KW_SUGGEST, ...Object.keys(COLS), ...new Set(Object.values(COLS).flat())];
  if (qual) {
    const t = ctx.alias[qual.toLowerCase()];
    if (!t) { ctx.warn(`« ${qual} » n'est ni une table ni un surnom de table de ce sort.`); return; }
    if (COLS[t] && !COLS[t].includes(w)) {
      const s = closest(w, COLS[t]);
      ctx.warn(`« ${w} » n'est pas une colonne de ${t}.${s ? ` Voulais-tu écrire « ${s} » ?` : ` Ses colonnes : ${COLS[t].join(", ")}.`}`);
    }
    return;
  }
  if (ctx.selectAliases.has(w.toLowerCase()) || ctx.badTable) return;
  const tabs = ctx.tables.filter((t) => COLS[t] && COLS[t].includes(w));
  if (tabs.length === 1) return;
  if (tabs.length > 1) { ctx.warn(`« ${w} » existe dans ${frList(tabs)}. Précise laquelle : ${tabs.map((t) => t + "." + w).join(" ou ")}.`); return; }
  if (COLS[w.toLowerCase()]) { ctx.warn(`« ${w} » est une table, pas une colonne.${ctx.tables.length ? "" : " Il manque sans doute FROM devant elle."}`); return; }
  const fr = FR_WORDS[w.toLowerCase()];
  if (fr && fr !== w.toLowerCase()) { ctx.warn(/[À-ÿ]/.test(w) ? `« ${w} » : les noms s'écrivent sans accents. Écris « ${fr} ».` : `« ${w} » : dans ce royaume, les noms sont en français et sans accents. Tu cherches sans doute « ${fr} ».`); return; }
  const ctxCols = [...new Set(ctx.tables.flatMap((t) => COLS[t] || []))];
  const sc = ctxCols.length ? closest(w, ctxCols) : null;
  if (sc) { ctx.warn(`« ${w} » n'est pas une colonne de ${frList(ctx.tables)}. Voulais-tu écrire « ${sc} » ?`); return; }
  const s = closest(w, all);
  if (s && KW_SUGGEST.includes(s)) ctx.warn(`« ${w} » : voulais-tu écrire le mot-clé ${s} ?`);
  else if (!ctx.tables.length) ctx.warn(`« ${w} » : je ne sais pas encore dans quelle table chercher cette colonne (il manque FROM).`);
  else {
    const cols = [...new Set(ctx.tables.flatMap((t) => COLS[t] || []))];
    const c = closest(w, cols);
    ctx.warn(`« ${w} » n'est pas une colonne de ${frList(ctx.tables)}.${c ? ` Voulais-tu écrire « ${c} » ?` : ` Si c'est un texte, mets-le entre apostrophes : '${w}'.`}`);
  }
}
function scanWords(e, ctx) {
  const m = maskSQL(e, " ").replace(/'[^']*'/g, (s) => " ".repeat(s.length));
  const re = /([A-Za-z_À-ÿ][\wÀ-ÿ]*)(\s*\.\s*([A-Za-z_À-ÿ][\wÀ-ÿ]*))?(\s*\()?/g; let x;
  while ((x = re.exec(m))) {
    if (/^\d/.test(x[1])) continue;
    if (x[4]) { if (!SQL_WORDS.has(x[1].toUpperCase())) ctx.warn(`« ${x[1]}(…) » : je ne connais pas cette fonction.`); continue; }
    if (x[2]) { checkWord(x[3], x[1], ctx); continue; }
    if (!SQL_WORDS.has(x[1].toUpperCase())) checkWord(x[1], null, ctx);
  }
}

function subquerySummary(inner) {
  const ctx = makeCtx(); const cl = clausesOf(inner).list;
  const get = (k) => (cl.find((c) => c.kw === k) || {}).text;
  const from = get("FROM"); if (from) registerTable(from, ctx, true);
  const sel = get("SELECT") || "?", where = get("WHERE");
  return `${frList(splitComma(sel).map((x) => describeExpr(x, ctx, true)))}${from ? ` dans ${code(from)}` : ""}${where ? `, seulement là où ${describeConds(where, ctx, true)}` : ""}`;
}

function describeExpr(e, ctx, quiet) {
  e = e.trim(); if (!e) return "…";
  const m = maskSQL(e).match(/^(.*\S)\s+AS\s+([A-Za-z_]\w*)\s*$/i);
  if (m) { const alias = m[2]; ctx.selectAliases.add(alias.toLowerCase()); return `${describeExpr(e.slice(0, m[1].length), ctx, quiet)} (nommé ${code(alias)})`; }
  if (/\?\?\?|___/.test(e)) return `<span class="todo">${esc(e)}</span> (à compléter)`;
  if (e === "*") return "toutes les colonnes";
  let x;
  if ((x = e.match(/^COUNT\s*\(\s*\*\s*\)$/i))) return "le nombre de lignes";
  if ((x = e.match(/^(RANK|DENSE_RANK|ROW_NUMBER)\s*\(\s*\)\s*OVER\s*\(([\s\S]*)\)$/i))) {
    const part = x[2].match(/PARTITION\s+BY\s+([\s\S]+?)(?=\s+ORDER\s+BY|$)/i), ord = x[2].match(/ORDER\s+BY\s+([\s\S]+)$/i);
    const ordTxt = ord ? splitComma(ord[1]).map((o) => `${describeExpr(o.replace(/\s+(DESC|ASC)\s*$/i, ""), ctx, quiet)} ${/\s+DESC\s*$/i.test(o) ? "du plus grand au plus petit" : "du plus petit au plus grand"}`).join(", ") : "";
    return `le rang de chaque ligne sur le podium${part ? `, avec un podium par ${describeExpr(part[1], ctx, quiet)}` : ""}${ord ? `, classé par ${ordTxt}` : ""}`;
  }
  if ((x = e.match(/^COALESCE\s*\(([\s\S]*)\)$/i))) { const a = splitComma(x[1]); return `${describeExpr(a[0] || "", ctx, quiet)}, ou bien ${frList(a.slice(1).map((v) => describeExpr(v, ctx, quiet)))} si elle est vide`; }
  if ((x = e.match(/^(UPPER|LOWER|LENGTH|ROUND)\s*\(([\s\S]*)\)$/i))) {
    const a = splitComma(x[2]), d = describeExpr(a[0] || "", ctx, quiet);
    return { UPPER: `${d} en majuscules`, LOWER: `${d} en minuscules`, LENGTH: `le nombre de lettres de ${d}`, ROUND: `${d} arrondi` }[x[1].toUpperCase()];
  }
  if ((x = e.match(/^(COUNT|SUM|AVG|MIN|MAX)\s*\(([\s\S]*)\)$/i))) return `${FUNCS[x[1].toUpperCase()]} ${describeExpr(x[2], ctx, quiet)}`;
  if ((x = e.match(/^CASE\b([\s\S]*)\bEND$/i))) {
    const body = x[1], parts = [];
    for (const w of body.matchAll(/WHEN\s+([\s\S]+?)\s+THEN\s+([\s\S]+?)(?=\s+WHEN\s|\s+ELSE\s|\s*$)/gi))
      parts.push(`${parts.length ? "sinon, si" : "si"} ${describeConds(w[1], ctx, quiet)} → ${describeExpr(w[2], ctx, quiet)}`);
    const el = body.match(/\bELSE\s+([\s\S]+)$/i);
    if (el) parts.push(`sinon → ${describeExpr(el[1], ctx, quiet)}`);
    return `une étiquette calculée pour chaque ligne (${parts.join(" ; ")})`;
  }
  if (/^CASE\b/i.test(e)) { if (!quiet) ctx.warn("Ce CASE n'est pas terminé : il doit finir par END."); return "une étiquette calculée (CASE…) inachevée"; }
  if ((x = e.match(/^\(\s*(SELECT[\s\S]*)\)$/i))) return `le résultat de la petite requête entre parenthèses (${subquerySummary(x[1])}), calculée en premier`;
  if ((x = e.match(/^'([\s\S]*)'$/))) return `le texte « ${esc(x[1])} »`;
  if (/^-?\d+(\.\d+)?$/.test(e)) return `le nombre ${esc(e)}`;
  if (/^NULL$/i.test(e)) return "rien (NULL)";
  if ((x = e.match(/^([A-Za-z_]\w*)\s*\.\s*([A-Za-z_]\w*)$/))) { if (!quiet) checkWord(x[2], x[1], ctx); return `la colonne ${code(x[2])} de ${code(x[1])}`; }
  if ((x = e.match(/^([A-Za-z_À-ÿ][\wÀ-ÿ]*)$/))) {
    if (e.toUpperCase() === "OR") { if (!quiet) ctx.warn("OR est un mot-clé SQL (il veut dire « ou ») : il ne peut pas servir de nom. L'or des héros est dans la colonne fortune."); return code(e); }
    if (SQL_WORDS.has(e.toUpperCase())) { if (!quiet) ctx.warn(`« ${e} » est un mot-clé, il n'est pas à sa place ici.`); return code(e); }
    if (!quiet) checkWord(e, null, ctx);
    return ctx.selectAliases.has(e.toLowerCase()) ? `le résultat nommé ${code(e)}` : `la colonne ${code(e)}`;
  }
  if (!quiet) scanWords(e, ctx);
  return `le calcul ${code(e)}`;
}

function likeDesc(p, not) {
  const inner = p.replace(/^%|%$/g, "");
  if (!/[%_]/.test(p)) return `${not ? "n'est pas" : "est"} exactement « ${esc(p)} » <i>(sans %, LIKE cherche le texte exact)</i>`;
  if (/^%[^%_]*%$/.test(p)) return `${not ? "ne contient pas" : "contient"} « ${esc(inner)} » quelque part`;
  if (/^[^%_]+%$/.test(p)) return `${not ? "ne commence pas" : "commence"} par « ${esc(inner)} »`;
  if (/^%[^%_]+$/.test(p)) return `${not ? "ne finit pas" : "finit"} par « ${esc(inner)} »`;
  return `${not ? "ne correspond pas" : "correspond"} au motif « ${esc(p)} » <i>(% = n'importe quelle suite de lettres, _ = une seule lettre)</i>`;
}
function describeCond(c, ctx, quiet) {
  c = c.trim(); let x;
  if (/^\(.*\)$/.test(maskSQL(c)) && !/^\(\s*SELECT/i.test(c)) return `(${describeConds(c.slice(1, -1), ctx, quiet)})`;
  if ((x = c.match(/^(.*?)\s+(NOT\s+)?BETWEEN\s+(.+?)\s+AND\s+(.+)$/i))) return `${describeExpr(x[1], ctx, quiet)} ${x[2] ? "n'est pas" : "est"} entre ${describeExpr(x[3], ctx, quiet)} et ${describeExpr(x[4], ctx, quiet)} <i>(bornes comprises)</i>`;
  if ((x = c.match(/^(.*?)\s+IS\s+(NOT\s+)?NULL$/i))) return `${describeExpr(x[1], ctx, quiet)} ${x[2] ? "a une valeur (n'est pas NULL)" : "est vide (NULL, aucune valeur)"}`;
  if ((x = c.match(/^(.*?)\s+(NOT\s+)?LIKE\s+'([\s\S]*)'$/i))) return `${describeExpr(x[1], ctx, quiet)} ${likeDesc(x[3], !!x[2])}`;
  if ((x = c.match(/^(.*?)\s+(NOT\s+)?IN\s*\(([\s\S]*)\)$/i))) {
    const list = /^\s*SELECT/i.test(x[3]) ? `des valeurs renvoyées par la petite requête (${subquerySummary(x[3])})` : `de la liste ${frList(splitComma(x[3]).map((v) => describeExpr(v, ctx, quiet)))}`;
    return `${describeExpr(x[1], ctx, quiet)} ${x[2] ? "ne fait pas partie" : "fait partie"} ${list}`;
  }
  const m = maskSQL(c).match(/(>=|<=|<>|!=|=|>|<)/);
  if (m) {
    const a = c.slice(0, m.index), b = c.slice(m.index + m[1].length);
    if (/^\s*NULL\s*$/i.test(b)) { if (!quiet) ctx.warn("« = NULL » ne trouve jamais rien : NULL n'est égal à rien. Écris « IS NULL »."); }
    if (!b.trim()) return `${describeExpr(a, ctx, quiet)} ${OPS[m[1]]} … <span class="todo">(il manque la valeur à comparer)</span>`;
    if (/^\s*[A-Za-zÀ-ÿ][\wÀ-ÿ-]*(\s+[A-Za-zÀ-ÿ][\wÀ-ÿ-]*)+\s*$/.test(b) && !/\bAND\b|\bOR\b/i.test(b)) {
      if (!quiet) ctx.warn(`« ${b.trim()} » : un texte doit être entre apostrophes, sinon la base croit lire des noms de colonnes. Écris '${b.trim()}'.`);
      return `${describeExpr(a, ctx, quiet)} ${OPS[m[1]]} ${code(b)} <span class="todo">(apostrophes manquantes)</span>`;
    }
    return `${describeExpr(a, ctx, quiet)} ${OPS[m[1]]} ${describeExpr(b, ctx, quiet)}`;
  }
  if (!quiet) scanWords(c, ctx);
  return code(c);
}
function describeConds(t, ctx, quiet) {
  const raw = splitTop(t, /\b(AND|OR)\b/), parts = [];
  raw.forEach((p) => {            // « BETWEEN 20 AND 23 » : ce AND appartient au BETWEEN
    const prev = parts[parts.length - 1];
    if (prev && p.op === "AND" && /\bBETWEEN\s+\S+\s*$/i.test(prev.text)) prev.text += " AND " + p.text; else parts.push({ ...p });
  });
  return parts.map((p, i) => (i ? (p.op === "AND" ? " <b>et</b> " : " <b>ou</b> ") : "") + describeCond(p.text, ctx, quiet)).join("");
}

function makeCtx() { const w = []; return { tables: [], alias: {}, selectAliases: new Set(), warns: w, warn: (m) => { if (!w.includes(m)) w.push(m); } }; }
function registerTable(txt, ctx, quiet) {
  const m = txt.trim().match(/^([A-Za-z_À-ÿ][\wÀ-ÿ]*)(?:\s+(?:AS\s+)?([A-Za-z_À-ÿ][\wÀ-ÿ]*))?/i);
  if (!m) return null;
  const t = m[1].toLowerCase();
  if (!COLS[t]) {
    ctx.badTable = true;
    const fr = FR_WORDS[m[1].toLowerCase()];
    if (!quiet && fr && COLS[fr]) { ctx.warn(/[À-ÿ]/.test(m[1]) ? `La table « ${m[1]} » n'existe pas : les noms s'écrivent sans accents. Écris « ${fr} ».` : `La table « ${m[1]} » n'existe pas. Les noms sont en français, au pluriel et sans accents : tu cherches sans doute « ${fr} ».`); return { t: m[1], alias: m[2] }; }
    if (!quiet) { const s = closest(m[1], Object.keys(COLS)); ctx.warn(`La table « ${m[1]} » n'existe pas.${s ? ` Voulais-tu écrire « ${s} » ?` : ` Tables : ${Object.keys(COLS).join(", ")}.`}`); }
    return { t: m[1], alias: m[2] };
  }
  ctx.tables.push(t); ctx.alias[t] = t;
  if (m[2] && !SQL_WORDS.has(m[2].toUpperCase())) ctx.alias[m[2].toLowerCase()] = t;
  return { t, alias: m[2] && !SQL_WORDS.has(m[2].toUpperCase()) ? m[2] : null };
}
const tableFR = (t) => COLS[t] ? `${code(t)} (${TABLE_FR[t] || "ta table"}${COUNTS[t] !== undefined ? `, ${COUNTS[t]} lignes au départ` : ""})` : code(t);
const TYPE_FR = { INTEGER: "nombre entier", INT: "nombre entier", TEXT: "texte", REAL: "nombre à virgule" };
function describeColumnDef(def, ctx) {
  const m = def.trim().match(/^([A-Za-z_À-ÿ][\wÀ-ÿ]*)\s*([A-Za-z]*)([\s\S]*)$/);
  if (!m) return code(def);
  const [, name, type, rest] = m, bits = [];
  if (/[À-ÿ]/.test(name)) ctx.warn(`« ${name} » : les noms de colonnes s'écrivent sans accents.`);
  if (type && !TYPE_FR[type.toUpperCase()]) ctx.warn(`« ${type} » : type inconnu. Utilise INTEGER (nombre) ou TEXT (texte).`);
  bits.push(type ? TYPE_FR[type.toUpperCase()] || type : "type non précisé");
  if (/PRIMARY\s+KEY/i.test(rest)) bits.push("identité unique de la ligne");
  if (/NOT\s+NULL/i.test(rest)) bits.push("obligatoire");
  const ref = rest.match(/REFERENCES\s+(\w+)/i); if (ref) bits.push(`renvoie vers ${ref[1]}`);
  return `${code(name)} (${bits.join(", ")})`;
}

function translateStatement(stmt) {
  const ctx = makeCtx(), lines = [], { before, list } = clausesOf(stmt);
  const kws = list.map((c) => c.kw);
  if (!list.length || before) {
    const first = (before || stmt).split(/\s+/)[0];
    const s = closest(first, ["SELECT", "INSERT", "UPDATE", "DELETE", "CREATE", "ALTER", "DROP", "WITH"]);
    ctx.warn(s ? `« ${first} » : voulais-tu écrire ${s} ?` : `Je ne reconnais pas « ${first} ». Un sort commence par SELECT (lire), INSERT INTO (ajouter), UPDATE (modifier), DELETE FROM (supprimer), CREATE TABLE (créer une table) ou WITH (préparer une liste).`);
    if (!list.length) return { lines, warns: ctx.warns };
  }
  // 1. on repère d'abord les tables, pour pouvoir vérifier les colonnes partout
  list.forEach((c) => {
    if (c.kw === "WITH") {
      c.ctes = splitComma(c.text).map((def) => {
        const m = def.match(/^([A-Za-z_À-ÿ][\wÀ-ÿ]*)\s+AS\s*\(([\s\S]*)\)\s*$/i);
        if (!m) { ctx.warn("Une liste préparée s'écrit : WITH nom AS ( SELECT … )."); return null; }
        const cols = cteColumns(m[2]); COLS[m[1].toLowerCase()] = cols || []; if (!cols) ctx.badTable = true;
        TABLE_FR[m[1].toLowerCase()] = TABLE_FR[m[1].toLowerCase()] || "ta liste préparée";
        return { name: m[1], inner: m[2] };
      }).filter(Boolean);
    }
    if (["FROM", "JOIN", "LEFT JOIN", "INNER JOIN", "UPDATE", "DELETE FROM"].includes(c.kw)) c.ref = registerTable(c.text, ctx);
    if (c.kw === "INSERT INTO") c.ref = registerTable(c.text.split("(")[0], ctx);
  });
  list.filter((c) => c.kw === "SELECT").forEach((c) => {   // les surnoms (AS) servent dans ORDER BY
    splitComma(c.text).forEach((it) => { const m = maskSQL(it).match(/\sAS\s+([A-Za-z_]\w*)\s*$/i); if (m) ctx.selectAliases.add(m[1].toLowerCase()); });
  });
  const isSelect = kws[0] === "SELECT";
  // 2. chaque clause, dans l'ordre où elle est écrite
  list.forEach((c) => {
    const t = c.text; let say = "";
    switch (c.kw) {
      case "WITH": say = (c.ctes || []).map((x) => `Prépare une liste nommée ${code(x.name)} (${subquerySummary(x.inner)}). On peut ensuite l'utiliser comme une table.`).join("<br>") || `<span class="todo">WITH nom AS ( SELECT … )</span>`; break;
      case "CREATE TABLE": {
        const m = t.match(/^([A-Za-z_À-ÿ][\wÀ-ÿ]*)\s*(?:\(([\s\S]*)\))?/);
        if (!m) { say = `<span class="todo">Quel nom pour la nouvelle table ?</span>`; break; }
        if (BASE_COLS[m[1].toLowerCase()]) ctx.warn(`La table ${m[1]} existe déjà. Pour la recréer, il faudrait d'abord la supprimer (DROP TABLE).`);
        if (/[À-ÿ]/.test(m[1])) ctx.warn(`« ${m[1]} » : les noms de tables s'écrivent sans accents.`);
        const defs = m[2] ? splitComma(m[2]) : [];
        say = defs.length ? `Crée une nouvelle table ${code(m[1])}, vide, avec ce plan : ${frList(defs.map((d) => describeColumnDef(d, ctx)))}.` : `Crée une nouvelle table ${code(m[1])}. <span class="todo">Il manque le plan entre parenthèses : ( colonne TYPE, … )</span>`;
        COLS[m[1].toLowerCase()] = defs.map((d) => d.trim().split(/\s+/)[0]); TABLE_FR[m[1].toLowerCase()] = TABLE_FR[m[1].toLowerCase()] || "ta nouvelle table";
        break; }
      case "ALTER TABLE": c.ref = registerTable(t, ctx); say = c.ref ? `Modifie le plan de la table ${tableFR(c.ref.t)}.` : `<span class="todo">Quelle table modifier ?</span>`; break;
      case "ADD COLUMN": {
        const alt = list.find((x) => x.kw === "ALTER TABLE");
        say = `Ajoute la colonne ${describeColumnDef(t, ctx)}. Les lignes déjà présentes auront une case vide (NULL) dans cette colonne.`;
        if (alt && alt.ref && COLS[alt.ref.t]) COLS[alt.ref.t].push(t.trim().split(/\s+/)[0]);
        break; }
      case "DROP TABLE": {
        const ref = registerTable(t.replace(/^IF\s+EXISTS\s+/i, ""), ctx);
        say = ref ? `Supprime la table ${tableFR(ref.t)} <b>entière</b> : son plan et toutes ses lignes. Il n'y a pas de corbeille.` : `<span class="todo">Quelle table supprimer ?</span>`;
        if (ref) delete COLS[ref.t];
        break; }
      case "SELECT": {
        const dist = /^DISTINCT\s+/i.test(t), rest = t.replace(/^DISTINCT\s+/i, "");
        const items = splitComma(rest);
        say = items.length ? `Montre ${frList(items.map((x) => describeExpr(x, ctx)))}${dist ? ", <b>sans doublons</b>" : ""}.` : `<span class="todo">Que faut-il montrer ? (* pour tout, ou des noms de colonnes)</span>`;
        break; }
      case "FROM": say = c.ref ? `… en lisant la table ${tableFR(c.ref.t)}${c.ref.alias ? `, surnommée ${code(c.ref.alias)}` : ""}.` : `<span class="todo">Dans quelle table ?</span>`; break;
      case "JOIN": case "INNER JOIN": say = c.ref ? `Relie chaque ligne à une ligne de ${tableFR(c.ref.t)}${c.ref.alias ? ` (surnommée ${code(c.ref.alias)})` : ""}. Les lignes sans partenaire disparaissent.` : `<span class="todo">Relier à quelle table ?</span>`; break;
      case "LEFT JOIN": say = c.ref ? `Relie chaque ligne à une ligne de ${tableFR(c.ref.t)}, <b>en gardant aussi les lignes sans partenaire</b> (leurs trous vaudront NULL).` : `<span class="todo">Relier à quelle table ?</span>`; break;
      case "ON": say = t ? `Deux lignes vont ensemble quand ${describeConds(t, ctx)}.` : `<span class="todo">Comment associer les lignes ? (colonne = colonne)</span>`; break;
      case "WHERE": say = t ? `${["UPDATE", "DELETE FROM"].includes(kws[0]) ? "Mais seulement pour les lignes où" : "Garde seulement les lignes où"} ${describeConds(t, ctx)}.` : `<span class="todo">Quelle condition ?</span>`; break;
      case "GROUP BY": say = `Range les lignes en paquets : un paquet pour chaque valeur différente de ${frList(splitComma(t).map((x) => describeExpr(x, ctx)))}. Les COUNT, SUM, AVG se calculent ensuite paquet par paquet.`; break;
      case "HAVING": say = `Garde seulement les <b>paquets</b> où ${describeConds(t, ctx)}.`; break;
      case "ORDER BY": say = `Trie le résultat par ${frList(splitComma(t).map((x) => { const d = /\s+DESC\s*$/i.test(x); return `${describeExpr(x.replace(/\s+(DESC|ASC)\s*$/i, ""), ctx)}, ${d ? "du plus grand au plus petit (DESC)" : "du plus petit au plus grand (ou de A à Z)"}`; }))}.`; break;
      case "LIMIT": say = /^\d+$/.test(t) ? (t === "1" ? "Garde seulement la première ligne." : `Garde seulement les ${t} premières lignes.`) : `<span class="todo">LIMIT attend un nombre.</span>`; break;
      case "INSERT INTO": {
        const cm = t.match(/\(([\s\S]*)\)/); c.cols = cm ? splitComma(cm[1]) : (c.ref && COLS[c.ref.t]) || [];
        say = c.ref ? `Ajoute une ou plusieurs lignes dans ${tableFR(c.ref.t)}${cm ? `, en remplissant les colonnes ${frList(c.cols.map(code))}` : ", en remplissant toutes les colonnes dans l'ordre"}.` : `<span class="todo">Dans quelle table ajouter ?</span>`;
        c.cols.forEach((col) => checkWord(col.trim(), null, ctx));
        break; }
      case "VALUES": {
        const ins = list.find((x) => x.kw === "INSERT INTO"); const cols = (ins && ins.cols) || [];
        const tuples = splitComma(t).map((tp) => tp.replace(/^\(|\)$/g, ""));
        say = tuples.map((tp, n) => {
          const vals = splitComma(tp);
          if (cols.length && vals.length !== cols.length) ctx.warn(`Ligne ${n + 1} : ${cols.length} colonnes mais ${vals.length} valeurs. Il en faut exactement autant, dans le même ordre.`);
          return `Ligne ${n + 1} : ${vals.map((v, i) => `${cols[i] ? code(cols[i]) : "<i>colonne ?</i>"} ← ${describeExpr(v, ctx)}`).join(" · ")}`;
        }).join("<br>");
        break; }
      case "UPDATE": say = c.ref ? `Modifie des lignes existantes de ${tableFR(c.ref.t)}.` : `<span class="todo">Quelle table modifier ?</span>`; break;
      case "SET": say = splitComma(t).map((a) => {
          const m = maskSQL(a).match(/=/); if (!m) return `<span class="todo">${esc(a)} : il faut colonne = nouvelle valeur</span>`;
          const col = a.slice(0, m.index).trim(), val = a.slice(m.index + 1).trim();
          const self = new RegExp(`\\b${col.replace(/\W/g, "")}\\b`, "i").test(val.replace(/'[^']*'/g, ""));
          const ar = val.match(new RegExp(`^${col.replace(/[^\w.]/g, "").replace(".", "\\.")}\\s*([+\\-*/])\\s*(.+)$`, "i"));
          if (ar) { scanWords(val, ctx); return `${describeExpr(col, ctx)} devient ${code(val)}, c'est-à-dire <b>son ancienne valeur ${{ "+": "plus", "-": "moins", "*": "fois", "/": "divisée par" }[ar[1]]} ${esc(ar[2])}</b>`; }
          return `${describeExpr(col, ctx)} devient ${describeExpr(val, ctx)}${self ? " <i>(calculé à partir de son ancienne valeur)</i>" : ""}`;
        }).join(" ; ") + "."; break;
      case "DELETE FROM": say = c.ref ? `Supprime des lignes <b>entières</b> de ${tableFR(c.ref.t)}. Il n'y a pas de corbeille.` : `<span class="todo">Supprimer dans quelle table ?</span>`; break;
    }
    lines.push({ kw: c.kw, say: say.replace(/\bà le /g, "au ").replace(/\bde le /g, "du ").replace(/\bà les /g, "aux ").replace(/\bde les /g, "des ") });
  });
  // 3. ce qui manque ou n'est pas à sa place
  if (isSelect && !kws.includes("FROM") && /[A-Za-z_]/.test(maskSQL((list[0] || {}).text || "", " ").replace(/\b(COUNT|SUM|AVG|MIN|MAX)\b/gi, "")))
    ctx.warn("Il manque FROM : dans quelle table faut-il chercher ?");
  if (["UPDATE", "DELETE FROM"].includes(kws[0]) && !kws.includes("WHERE"))
    ctx.warn(`Il n'y a pas de WHERE : ${kws[0] === "UPDATE" ? "TOUTES les lignes de la table seront modifiées" : "TOUTES les lignes de la table seront supprimées"}. C'est rarement ce qu'on veut.`);
  if (kws[0] === "UPDATE" && !kws.includes("SET")) ctx.warn("Un UPDATE a besoin de SET pour dire quoi changer : SET colonne = valeur.");
  if (kws[0] === "INSERT INTO" && !kws.includes("VALUES")) ctx.warn("Un INSERT a besoin de VALUES ( … ) pour donner les valeurs.");
  if (kws.some((k) => /JOIN/.test(k)) && !kws.includes("ON")) ctx.warn("Un JOIN a besoin de ON pour dire comment associer les lignes (ex. : ON heros.num_chateau = chateaux.id).");
  if (kws.includes("HAVING") && !kws.includes("GROUP BY")) ctx.warn("HAVING filtre des paquets : il faut un GROUP BY avant lui.");
  if (isSelect) {
    const order = ["SELECT", "FROM", "JOIN", "ON", "WHERE", "GROUP BY", "HAVING", "ORDER BY", "LIMIT"];
    const rank = (k) => order.indexOf(/JOIN/.test(k) ? "JOIN" : k);
    for (let i = 1; i < kws.length; i++) {
      if (rank(kws[i]) >= 0 && rank(kws[i - 1]) > rank(kws[i]) && !(kws[i - 1] === "ON" && /JOIN/.test(kws[i])))
        ctx.warn(`${kws[i]} est écrit après ${kws[i - 1]}, mais il doit venir avant. Ordre d'écriture : SELECT → FROM → JOIN … ON → WHERE → GROUP BY → HAVING → ORDER BY → LIMIT.`);
    }
  }
  return { lines, warns: ctx.warns };
}

function translateQuery(q) {
  const clean = q.replace(/--.*$/gm, "").trim();
  if (!clean) return null;
  const m = maskSQL(clean), stmts = []; let last = 0;
  for (let i = 0; i < m.length; i++) if (m[i] === ";") { stmts.push(clean.slice(last, i)); last = i + 1; }
  stmts.push(clean.slice(last));
  COLS = { ...Object.fromEntries(Object.entries(BASE_COLS).map(([k, v]) => [k, v.slice()])) }; COUNTS = { ...BASE_COUNTS };
  return stmts.map((s) => s.trim()).filter(Boolean).map(translateStatement);
}

// Squelette d'une requête : les mots-clés restent, les noms et les valeurs deviennent des ___
function skeleton(sql) {
  return sql.replace(/'[^']*'/g, "'___'").replace(/\b\d+(\.\d+)?\b/g, "___")
    .replace(/\b[A-Za-z_]\w*\b/g, (w) => SQL_WORDS.has(w.toUpperCase()) ? w : "___");
}

/* --- Comprendre : l'ordre réel d'exécution d'une instruction --- */
function executionOrder(stmt) {
  let s = stmt; while (/\([^()]*\)/.test(s)) s = s.replace(/\([^()]*\)/g, " … ");   // on ignore les sous-requêtes
  const has = (re) => re.test(s);
  if (/^\s*CREATE/i.test(s)) return ["CREATE TABLE"];
  if (/^\s*ALTER/i.test(s)) return ["ALTER TABLE", "ADD COLUMN"];
  if (/^\s*DROP/i.test(s)) return ["DROP TABLE"];
  if (/^\s*WITH/i.test(s)) return ["WITH (préparer la liste)", ...executionOrder(s.replace(/^\s*WITH[\s\S]*?\bAS\s*…\s*/i, ""))];
  if (/^\s*INSERT/i.test(s)) return ["INSERT INTO", "VALUES"];
  if (/^\s*UPDATE/i.test(s)) return ["UPDATE", ...(has(/\bWHERE\b/i) ? ["WHERE"] : []), "SET"];
  if (/^\s*DELETE/i.test(s)) return ["FROM", ...(has(/\bWHERE\b/i) ? ["WHERE"] : []), "DELETE"];
  return [
    ["FROM", /\bFROM\b/i], [has(/\bLEFT\s+JOIN\b/i) ? "LEFT JOIN" : "JOIN", /\bJOIN\b/i], ["WHERE", /\bWHERE\b/i],
    ["GROUP BY", /\bGROUP\s+BY\b/i], ["HAVING", /\bHAVING\b/i], ["SELECT", /\bSELECT\b/i],
    ["DISTINCT", /\bDISTINCT\b/i], ["ORDER BY", /\bORDER\s+BY\b/i], ["LIMIT", /\bLIMIT\b/i]
  ].filter(([, re]) => has(re)).map(([k]) => k);
}
function stepResult(L, sql) {
  if (L.mode === "write") { const w = runWorld(L, sql); return w.res || { columns: [], values: [] }; }
  return run(sql, worldSetup(L));
}
function diffRows(got, want) {     // lignes en trop / absentes, comptées comme des multiensembles
  const count = (vals) => vals.reduce((m, r) => m.set(rowKey(r), (m.get(rowKey(r)) || 0) + 1), new Map());
  const G = count(got.values), W = count(want.values), extra = [], missing = [];
  got.values.forEach((r) => { const k = rowKey(r); if ((W.get(k) || 0) > 0) W.set(k, W.get(k) - 1); else extra.push(r); });
  want.values.forEach((r) => { const k = rowKey(r); if ((G.get(k) || 0) > 0) G.set(k, G.get(k) - 1); else missing.push(r); });
  return { extra, missing };
}

const norm = (v) => (typeof v === "string" ? v.trim() : v);
const rowKey = (r) => JSON.stringify(r.map(norm));

function compare(got, want, ordered) {
  if (!got.columns.length)            // sql.js ne renvoie rien du tout quand aucune ligne ne correspond
    return `Ton sort ne renvoie aucune ligne, l'oracle en attend ${want.values.length}. Ton filtre est trop strict ou mal orthographié (majuscules, accents, apostrophes).`;
  if (got.columns.length !== want.columns.length)
    return `Ton sort renvoie ${got.columns.length} colonne(s), l'oracle en attend ${want.columns.length} (${want.columns.join(", ")}).`;
  if (got.values.length !== want.values.length)
    return `Ton sort renvoie ${got.values.length} ligne(s), l'oracle en attend ${want.values.length}. Vérifie ton filtre${ordered ? " ou ta limite" : ""}.`;
  const a = got.values.map(rowKey), b = want.values.map(rowKey);
  if (!ordered) { a.sort(); b.sort(); }
  if (a.join("|") === b.join("|")) return null;
  if (ordered && [...a].sort().join("|") === [...b].sort().join("|"))
    return "Les bonnes données sont là, mais dans le mauvais ordre. Revois ton ORDER BY.";
  return "Le nombre de lignes est bon, mais pas leur contenu. Vérifie les colonnes choisies et leur ordre.";
}

const byId = (snap) => new Map(snap.values.map((r) => [r[0], r]));
function changedIds(a, b) {       // ids créés, supprimés ou modifiés entre deux photos
  const A = byId(a), B = byId(b);
  return [...new Set([...A.keys(), ...B.keys()])].filter((id) => !A.has(id) || !B.has(id) || rowKey(A.get(id)) !== rowKey(B.get(id)));
}
const rowsOf = (snap) => (snap.missing ? [] : snap.values);
function compareWorld(got, want, query) {
  const same = (x, y) => (x.missing && y.missing) || (!x.missing && !y.missing && x.sig === y.sig && rowKey(x.values.map(rowKey)) === rowKey(y.values.map(rowKey)));
  if (got.after.every((g, i) => same(g, want.after[i]))) return null;
  for (let i = 0; i < got.after.length; i++) {      // d'abord le plan des tables (CREATE, ALTER, DROP)
    const g = got.after[i], w = want.after[i], b = got.before[i], t = g.table;
    if (g.missing && !w.missing) return b.missing ? `La table ${t} n'existe pas encore : il faut la créer avec CREATE TABLE.` : `La table ${t} a disparu ! Heureusement, chaque sort se joue sur une copie du royaume. Ce n'était pas la mission.`;
    if (!g.missing && w.missing) return `La table ${t} existe encore. Pour la faire disparaître entièrement, plan compris, il faut DROP TABLE ${t}.`;
    if (!g.missing && g.sig !== w.sig) return `Le plan de la table ${t} ne correspond pas. Ta table : ${g.plan.join(", ")}. Attendu : ${w.plan.join(", ")}.`;
  }
  const snap = (x) => ({ values: rowsOf(x) });
  if (got.after.every((g, i) => changedIds(snap(got.before[i]), snap(g)).length === 0))
    return "Rien n'a changé dans le royaume. Un SELECT regarde sans toucher : pour modifier, utilise INSERT, UPDATE ou DELETE.";
  for (let i = 0; i < got.after.length; i++) {
    const g = snap(got.after[i]), w = snap(want.after[i]), b = snap(got.before[i]), t = got.after[i].table, cols = got.after[i].columns || [];
    if (same(got.after[i], want.after[i])) continue;
    const pc = changedIds(b, g), ec = changedIds(b, w);
    const extra = pc.filter((id) => !ec.includes(id)), missing = ec.filter((id) => !pc.includes(id));
    if (extra.length) {
      const del = extra.filter((id) => byId(b).has(id) && !byId(g).has(id)).length;
      return `Ton sort a touché ${pc.length} ligne(s) dans la table ${t} au lieu de ${ec.length}${del ? `, dont ${del} supprimée(s) par erreur` : ""}. ` +
        (/\bWHERE\b/i.test(query) ? "Ton WHERE est trop large : resserre la condition." : "As-tu oublié le WHERE ? Sans lui, l'ordre s'applique à toute la table.");
    }
    if (missing.length) return `Il manque des changements dans ${t} : ${missing.length} ligne(s) qui devaient être créées, modifiées ou supprimées ne l'ont pas été.`;
    for (const id of pc) {        // mêmes lignes touchées, mais pas les bonnes valeurs
      const G = byId(g).get(id), W = byId(w).get(id);
      if (!G) return `Dans ${t}, la ligne d'id ${id} ne devait pas disparaître.`;
      if (!W) return `Dans ${t}, la ligne d'id ${id} ne devait pas exister.`;
      const j = G.findIndex((v, k) => rowKey([v]) !== rowKey([W[k]]));
      if (j >= 0) return `Dans ${t}, la ligne d'id ${id} a une valeur inattendue dans la colonne « ${cols[j]} » (${G[j] === null ? "NULL" : G[j]}). Vérifie l'orthographe, les majuscules ou ton calcul.`;
    }
  }
  return "Le royaume n'est pas dans l'état attendu. Relis la mission.";
}

function queryTips(q, problem) {           // conseils déduits de la formule, quand le résultat est faux
  const tips = [];
  if (/(=|<>|!=)\s*NULL\b/i.test(q)) tips.push("« = NULL » ne trouve jamais rien. Écris « IS NULL ».");
  if (/\bLIKE\s*'[^%_']*'/i.test(q)) tips.push("Un LIKE sans % cherche le texte exact. Ajoute % là où d'autres lettres peuvent suivre ou précéder.");
  if (/\bname\s*=\s*'[^']*%/i.test(q) || /=\s*'[^']*%[^']*'/.test(q)) tips.push("Le % n'est un joker qu'avec LIKE. Avec =, il est cherché tel quel.");
  { const m = maskSQL(q).replace(/\bBETWEEN\s+\S+\s+AND\b/gi, "BETWEEN x");
    if (/\bOR\b/i.test(m) && /\bAND\b/i.test(m)) tips.push("AND passe avant OR, comme × avant + en calcul : la base a lu (… AND …) OR …. Entoure les conditions reliées par OR de parenthèses : (A OR B) AND C."); }
  if (/\bCASE\b/i.test(q) && /contenu/.test(problem)) tips.push("Les WHEN d'un CASE sont testés dans l'ordre et le premier vrai l'emporte : place la condition la plus stricte en premier. Vérifie aussi l'orthographe exacte des étiquettes.");
  return tips.length ? " " + tips.join(" ") : "";
}

function translateError(msg) {
  let m;
  if ((m = msg.match(/table (\S+) already exists/))) return `La table ${m[1]} existe déjà. Pour la recréer, il faudrait d'abord la supprimer avec DROP TABLE.`;
  if ((m = msg.match(/duplicate column name: (\S+)/))) return `La colonne ${m[1]} existe déjà dans cette table : chaque colonne doit avoir un nom différent.`;
  if (/misuse of window function|misuse of aliased window function/.test(msg)) return "Le rang (RANK) se calcule après le WHERE : on ne peut pas filtrer dessus directement. Prépare d'abord le classement avec WITH, puis filtre la liste préparée.";
  if ((m = msg.match(/no such table: (\S+)/)))
    return `La table « ${m[1]} » n'existe pas dans ce royaume. Les tables connues : chateaux, heros, monstres, sorts, inventaire.`;
  if ((m = msg.match(/no such column: (\S+)/)))
    return m[1].toUpperCase() === "NULL" ? "Pour tester l'absence de valeur, écris « IS NULL » et non « = NULL »." : `La colonne « ${m[1]} » est introuvable. Ouvre la table dans le panneau « Tables du royaume » pour voir ses colonnes. (Un texte doit être entre apostrophes : 'texte'.)`;
  if ((m = msg.match(/near "([^"]*)": syntax error/)))
    return `Le sort se brise près de « ${m[1]} ». Vérifie l'orthographe des mots-clés et l'ordre SELECT → FROM → WHERE → ORDER BY → LIMIT.`;
  if ((m = msg.match(/ambiguous column name: (\S+)/)))
    return `Deux tables ont une colonne « ${m[1]} » et le grimoire ne sait pas laquelle choisir. Préfixe-la avec le nom de la table, par exemple heros.${m[1]}.`;
  if (/misuse of aggregate/.test(msg))
    return "COUNT ou SUM ne peuvent pas s'utiliser dans un WHERE. Pour trier ou filtrer sur un total, donne-lui un nom avec AS et utilise ce nom dans ORDER BY.";
  if (/HAVING clause on a non-aggregate|a GROUP BY clause is required before HAVING/.test(msg))
    return "HAVING filtre des groupes : il lui faut un GROUP BY juste avant, et une fonction comme COUNT, SUM ou AVG.";
  if ((m = msg.match(/sub-select returns (\d+) columns/)))
    return `Ta sous-requête renvoie ${m[1]} colonnes. Entre parenthèses, après IN ou un >, elle ne doit en renvoyer qu'une seule.`;
  if (/row valeur misused/.test(msg))
    return "Une sous-requête utilisée comme valeur ne doit renvoyer qu'une seule colonne.";
  if ((m = msg.match(/UNIQUE constraint failed: (\w+)\.(\w+)/)))
    return `Une ligne de ${m[1]} porte déjà cette valeur de ${m[2]}. Chaque ${m[2]} doit être unique : vérifie le nombre que tu as choisi.`;
  if ((m = msg.match(/NOT NULL constraint failed: (\w+)\.(\w+)/)))
    return `La colonne ${m[2]} de ${m[1]} est obligatoire : donne-lui une valeur.`;
  if ((m = msg.match(/table (\w+) has (\d+) columns but (\d+) values were supplied/)))
    return `La table ${m[1]} a ${m[2]} colonnes mais tu as fourni ${m[3]} valeurs. Liste les colonnes entre parenthèses, ou donne une valeur pour chacune.`;
  if ((m = msg.match(/(\d+) values for (\d+) columns/)))
    return `Tu as listé ${m[2]} colonnes mais fourni ${m[1]} valeurs : il en faut autant de chaque côté.`;
  if (/incomplete input/.test(msg)) return "La formule est incomplète : il manque une fin (un nom de table, une apostrophe fermante…).";
  if (/unrecognized token/.test(msg)) return "Un symbole inconnu traîne dans la formule. Souvent : une apostrophe ou un guillemet non fermé.";
  return msg;
}
