"use strict";
/* =====================================================================
   5. RENDU
   ===================================================================== */
/* ---------- IMAGES : pixel art des 5 tables (12 × 12) ---------- */
const PIX_PAL = { k: "#1a1630", o: "#f0a43a", y: "#f7d36b", g: "#a7adc4", d: "#6f7590", w: "#ece7da", b: "#66c9ff", B: "#3a7fc4",
  r: "#e2574c", G: "#6fd3b0", D: "#2f9b78", p: "#c792ea", n: "#b07440", N: "#7a4a24", s: "#f2c79b" };
const PIX = {
  heros: [      // un chevalier casqué
    ".....rr.....", "....rrr.....", "...gggggg...", "..gggggggg..", "..gkkggkkg..", "..gggggggg..",
    "...dsssssd..", "....dddd....", "..bbbbbbbb..", ".bbbbbybbbb.", ".BbbbbbbbbB.", "..NN....NN.."],
  monstres: [    // un slime à crocs
    "............", "....GGGG....", "...GGGGGG...", "..GGGGGGGG..", ".GGwkGGwkGG.", ".GGwkGGwkGG.",
    "GGGGGGGGGGGG", "GGkkkkkkkkGG", "GGkwkkkkwkGG", "DGGGGGGGGGGD", ".DGGGGGGGGD.", "..D..DD..D.."],
  sorts: [      // une baguette et ses étincelles
    "........y...", "........y...", "......yyyyy.", "........y...", ".......py.b.", "......p.....",
    ".....p..b...", "....p.......", "...p........", "..p......b..", ".w..........", "............"],
  inventaire: [   // un sac avec une pièce d'or
    "............", "....NNNN....", ".....NN.....", "....kkkk....", "...nnnnnn...", "..nnnnnnnn..",
    ".nnnnyynnnn.", ".nnnyyyynnn.", ".nnnnyynnnn.", ".nnnnnnnnnn.", "..nnnnnnnn..", "...NNNNNN..."],
  visites: [     // le sablier du registre des gardes
    "..NNNNNNNN..", "...wyyyyw...", "...wyyyyw...", "....wyyw....", ".....yy.....", ".....yy.....",
    "....w.yw....", "...w..y.w...", "...w.yyyw...", "...wyyyyw...", "..NNNNNNNN..", "............"],
  chateaux: [     // un château et ses drapeaux
    ".rr......rr.", ".d.......d..", "g.g......g.g", "ggg.g..g.ggg", "gggggggggggg", "gkggggggggkg",
    "gggggggggggg", "ggggNNNNgggg", "gggNnnnnNggg", "gggNnnnnNggg", "gggNnnnnNggg", "dddddddddddd"]
};
const TABLE_ICON_FR = { visites: "le registre des gardes", heros: "les héros", monstres: "les monstres", sorts: "les sorts", inventaire: "les objets des héros", chateaux: "les châteaux" };
const TABLE_MEMO = { visites: "visites : qui est entré où, quel jour, à quelle heure", heros: "heros, sans accent : les héros", monstres: "monstres : les monstres",
  sorts: "sorts : les sortilèges que connaissent les héros", inventaire: "inventaire : le sac du héros, ses objets",
  chateaux: "chateaux, sans accent circonflexe : les châteaux" };
function pixIcon(t, size = 24, cls = "pix") {
  const g = PIX[t]; if (!g) return "";
  let r = "";
  g.forEach((row, y) => [...row].forEach((c, x) => { if (PIX_PAL[c]) r += `<rect x="${x}" y="${y}" width="1" height="1" fill="${PIX_PAL[c]}"/>`; }));
  return `<svg class="${cls}" viewBox="0 0 12 12" width="${size}" height="${size}" shape-rendering="crispEdges" aria-hidden="true">${r}</svg>`;
}

/* ---------- BRUITAGES : synthétisés par le navigateur (Web Audio), aucun fichier ---------- */
const FX = (() => {
  let ctx = null, on = true;
  try { on = localStorage.getItem("grimoire-son") !== "off"; } catch (e) {}
  const ac = () => {
    if (!ctx) { const C = window.AudioContext || window.webkitAudioContext; if (!C) return null; ctx = new C(); }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  };
  function tone(freq, t0, dur, type = "square", vol = 0.06, freqEnd) {
    const a = ac(); if (!a) return;
    const t = a.currentTime + t0, o = a.createOscillator(), g = a.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    if (freqEnd) o.frequency.exponentialRampToValueAtTime(freqEnd, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(a.destination); o.start(t); o.stop(t + dur + 0.03);
  }
  function noise(t0, dur, vol = 0.05, freq = 1500) {
    const a = ac(); if (!a) return;
    const t = a.currentTime + t0, len = Math.floor(a.sampleRate * dur), buf = a.createBuffer(1, len, a.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain();
    src.buffer = buf; f.type = "bandpass"; f.frequency.value = freq; f.Q.value = 0.8; g.gain.value = vol;
    src.connect(f); f.connect(g); g.connect(a.destination); src.start(t);
  }
  // iPad / Android : le son ne peut démarrer qu'après un premier toucher ; on « réveille » l'audio à chaque toucher
  ["pointerdown", "touchend", "keydown"].forEach((ev) => document.addEventListener(ev, () => { if (on) { const a = ac(); if (a && a.state === "suspended") a.resume(); } }, { passive: true, once: false }));
  const S = {
    click:   () => tone(880, 0, 0.05, "square", 0.035),
    unclick: () => tone(440, 0, 0.06, "square", 0.03),
    page:    () => noise(0, 0.16, 0.035, 2600),
    good:    () => { tone(523, 0, 0.12, "triangle", 0.09); tone(784, 0.1, 0.22, "triangle", 0.09); },
    bad:     () => tone(250, 0, 0.24, "sine", 0.11, 150),
    win:     () => [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.09, 0.24, "triangle", 0.08)),
    cast:    () => { noise(0, 0.28, 0.05, 3200); tone(900, 0.04, 0.28, "sine", 0.05, 2200); },
    hit:     () => { noise(0, 0.16, 0.1, 500); tone(170, 0, 0.22, "square", 0.05, 70); },
    levelup: () => [392, 523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.07, 0.2, "square", 0.045)),
    ko:      () => [392, 330, 262, 196].forEach((f, i) => tone(f, i * 0.16, 0.26, "triangle", 0.08)),
    scroll:  () => { noise(0, 0.22, 0.03, 1800); tone(1320, 0.12, 0.15, "sine", 0.03); }
  };
  return {
    play(n) { if (on && S[n]) { try { S[n](); } catch (e) {} } },
    get on() { return on; },
    toggle() { on = !on; try { localStorage.setItem("grimoire-son", on ? "on" : "off"); } catch (e) {} if (on) S.click(); return on; }
  };
})();

/* ---------- ANIMATIONS : étincelles et secousse ---------- */
const reducedMotion = () => window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
function burst(el, n = 14) {
  if (!el || reducedMotion()) return;
  const colors = ["#f0a43a", "#f7d36b", "#66c9ff", "#6fd3b0", "#c792ea"];
  for (let i = 0; i < n; i++) {
    const s = document.createElement("span"), a = (Math.PI * 2 * i) / n + Math.random() * 0.4, d = 40 + Math.random() * 50;
    s.className = "spark";
    s.style.cssText = `--dx:${Math.cos(a) * d}px;--dy:${Math.sin(a) * d}px;background:${colors[i % colors.length]}`;
    el.appendChild(s); setTimeout(() => s.remove(), 900);
  }
}
function shake(el) { if (!el || reducedMotion()) return; el.classList.remove("shake"); void el.offsetWidth; el.classList.add("shake"); }
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const playerLevel = () => Math.floor(state.xp / 150) + 1;

function renderHUD(hit) {
  $("hearts").innerHTML = Array.from({ length: MAX_HP }, (_, i) =>
    `<span class="heart ${i >= state.hp ? "lost" : ""} ${hit && i === state.hp ? "hit" : ""}"></span>`).join("");
  $("hearts").setAttribute("aria-label", `${state.hp} points de vie sur ${MAX_HP}`);
  $("xp").textContent = state.xp;
  $("plevel").textContent = playerLevel();
  $("xpfill").style.width = ((state.xp % 150) / 150 * 100) + "%";
  $("scrolls").textContent = state.scrolls;
  $("mapInfo").textContent = `${state.completed.length}/${LEVELS.length}`;
  $("lootInfo").textContent = `${state.loot.filter((l) => l.kind === "item").length} objets · ${state.loot.filter((l) => l.kind === "badge").length} badges`;
  $("tablesInfo").textContent = LEVELS[state.current].id >= 25 ? "6 tables" : "5 tables";
  $("hintBtn").disabled = state.scrolls <= 0;
}

function renderTranslate() {
  if (!Object.keys(COLS).length) return;
  const res = translateQuery($("sql").value);
  if (!res) { $("translate").innerHTML = `<div class="thead"><span class="label">Ce que ton sort veut dire</span></div><p class="empty">Commence à écrire : chaque mot sera traduit en français ici, au fur et à mesure.</p>`; return; }
  $("translate").innerHTML = `<div class="thead"><span class="label">Ce que ton sort veut dire</span><span class="label">mot à mot, en direct</span></div>` +
    res.map((r, i) => `${res.length > 1 ? `<span class="stmt">INSTRUCTION ${i + 1}</span>` : ""}
      <ol>${r.lines.map((l) => `<li><span class="k">${esc(l.kw)}</span><span>${l.say}</span></li>`).join("")}</ol>
      ${r.warns.length ? `<ul class="warns">${r.warns.map((w) => `<li>${esc(w)}</li>`).join("")}</ul>` : ""}`).join("") +
    (res.every((r) => !r.warns.length) && res.some((r) => r.lines.length) ? `<p class="ok">Je comprends chaque mot de ce sort. Est-ce bien ce que demande la mission ?</p>` : "");
}

function orderHTML(L) {
  const stmts = L.expected.split(";").map((x) => x.trim()).filter(Boolean);
  return `<div class="order"><span class="label">Ce que la base fait vraiment, dans l'ordre</span>
    ${stmts.map((st) => `<div class="chain">${executionOrder(st).map((k) => `<b>${esc(k)}</b>`).join("<i>→</i>")}</div>`).join("")}
    ${stmts.length === 1 && /^\s*SELECT/i.test(stmts[0]) && /\bWHERE|GROUP|ORDER\b/i.test(stmts[0]) ? `<small>On écrit SELECT en premier, mais la base l'exécute presque en dernier. C'est la clé de nombreuses erreurs.</small>` : ""}</div>`;
}

/* Emoji des sorts et des objets : décor seulement, ajouté à l'affichage des tableaux (jamais dans le SQL ni dans les données) */
const SPELL_EMOJI = { "Boule de Feu": "🔥", "Lumière Sacrée": "✨", "Ronces Vivantes": "🌿", "Pas de l'Ombre": "🌑",
  "Tempête de Givre": "❄️", "Étincelle Ratée": "💨", "Jugement Divin": "⚡", "Peau d'Écorce": "🪵",
  // objets de l'inventaire (et ceux forgés au chapitre 4)
  "Épée Solaire": "🗡️", "Hache à Double Tranchant": "🪓", "Bâton de Cristal": "🔮", "Crochets de Serrure": "🗝️",
  "Bourse Trouée": "👛", "Graine d'Yggdrasil": "🌱", "Potion Douteuse": "🧪", "Cape d'Invisibilité (presque)": "🧥",
  "Marteau Runique": "🔨", "Enclume de Poche": "⚒️", "Lame des Alliances": "⚔️" };
const emo = (v) => typeof v === "string" && SPELL_EMOJI[v] ? `<span class="emo" aria-hidden="true">${SPELL_EMOJI[v]}</span>` : "";
function miniTable(res) {
  if (!res.columns.length) return `<div class="rowcount">Résultat vide : aucune ligne.</div>`;
  const shown = res.values.slice(0, 10);
  return `<div class="tablewrap"><table class="res"><thead><tr>${res.columns.map((c) => `<th>${esc(c)}</th>`).join("")}</tr></thead>
    <tbody>${shown.map((r) => `<tr>${r.map((v) => `<td>${v === null ? "<i>NULL</i>" : emo(v) + esc(typeof v === "number" && !Number.isInteger(v) ? v.toFixed(2) : v)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>
    <div class="rowcount">${res.values.length} ligne(s)${res.values.length > shown.length ? ` · ${shown.length} affichées` : ""}</div>`;
}

function decomposition(L) {
  const P = PEDAGOGY[L.id]; if (!P) return "";
  const next = LEVELS[L.id + 1];
  return `<section class="why" id="whySection" aria-label="Pourquoi ça marche">
    <h4>Pourquoi ça marche</h4>
    <p class="sub">Le sort décomposé dans l'ordre où la base l'exécute. Chaque étape est une vraie requête, lancée à l'instant.</p>
    <ol class="steps">${P.steps.map((st, i) => {
      let res; try { res = stepResult(L, st.sql); } catch (e) { res = { columns: [], values: [] }; }
      return `<li class="step"><span class="n">${i + 1}</span><div class="c"><span class="clause">${esc(st.clause)}</span>
        <p>${st.why}</p><code class="q">${esc(st.sql)}</code>${miniTable(res)}</div></li>`;
    }).join("")}</ol>
    <div class="takeaway"><b>À RETENIR</b>${esc(P.takeaway)}</div>
    ${next ? `<button class="btn btn-cast" id="whyNext" style="align-self:flex-start">Mission suivante</button>` : ""}
  </section>`;
}

function showWhy(L) {
  const box = document.getElementById("whySection");
  if (!box) $("out").insertAdjacentHTML("beforeend", decomposition(L));
  const sec = document.getElementById("whySection");
  if (sec) sec.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
}

function renderLevel() {
  const L = LEVELS[state.current];
  $("lvlTag").textContent = L.chapter;
  $("lvlTitle").textContent = L.title;
  $("lvlPitch").innerHTML = L.pitch;
  $("lvlArt").innerHTML = (() => {      // illustrations : "heros", "h:2" (un héros), "m:5" (un monstre), "r:Région", "visites", ou un n° de château
    const a = LEVEL_ART[L.id]; if (!a) return "";
    const db = new SQL.Database();
    try {
      db.run(SCHEMA_SQL);
      const rows = (t) => (db.exec(`SELECT * FROM ${t} ORDER BY id`)[0] || { values: [] }).values;
      const pick = (pre) => a.filter((x) => typeof x === "string" && x.startsWith(pre)).map((x) => x.slice(pre.length));
      let html = "";
      if (a.includes("heros")) html += heroCards(rows("heros"));
      const h = pick("h:").map(Number); if (h.length) html += heroCards(rows("heros").filter((x) => h.includes(x[0])));
      const m = pick("m:").map(Number); if (m.length) html += monsterCards(rows("monstres").filter((x) => m.includes(x[0])));
      const r = pick("r:"); if (r.length) html += regionsFor(db, r);
      a.filter((x) => TABLE_ART[x] && x !== "heros").forEach((t) => { html += `<figure class="tblart"><img src="${TABLE_ART[t]}" alt="${ARTCAP[t]}"><figcaption><b>TABLE ${t}</b></figcaption></figure>`; });
      const c = a.filter((x) => typeof x === "number"); if (c.length) html += castleCards(db, c);
      return html;
    } finally { db.close(); }
  })();
  const usedT = Object.keys(TABLE_INFO).filter((t) => new RegExp(`\\b(FROM|JOIN|INTO|UPDATE)\\s+${t}\\b`, "i").test(L.expected));
  $("lvlTables").innerHTML = `Table${usedT.length > 1 ? "s" : ""} à utiliser : ` + usedT.map((t) => `${pixIcon(t, 22)}<code>${t}</code> <span class="tfr">(${TABLE_INFO[t].fr})</span>`).join(" et ");
  $("lvlMission").innerHTML = L.mission.replace(/<code>(heros|monstres|sorts|inventaire|chateaux)<\/code>/g, (m, t) => `${m} <span class="tfr">(${TABLE_INFO[t].fr})</span>`);
  $("lvlConcept").innerHTML = L.concept.map((c) => `<span class="chip">${esc(c)}</span>`).join("");
  const P = PEDAGOGY[L.id];
  $("lessonBody").innerHTML = P ? `<p>${P.lesson}</p>${orderHTML(L)}` : "";
  $("lesson").hidden = !P;
  $("whyBtn").hidden = !state.completed.includes(L.id);
  $("sql").value = L.starter;
  renderTranslate();
  $("kw").innerHTML = keywordsFor(L).map((k) => `<button data-ins="${k}">${k}</button>`).join("");
  const used = state.hintsUsed[L.id] || 0;
  $("out").innerHTML = used
    ? L.hints.slice(0, used).map((h, i) => `<div class="hint"><span class="label">Parchemin ${i + 1}</span><br>${h}</div>`).join("")
    : `<div class="msg info">Écris ta formule puis lance le sort. « Explorer » exécute une requête sans valider la mission et sans coûter de PV.</div>`;
  $("consoleMode").textContent = "";
}

function renderMap() {
  let html = "", lastCh = "";
  LEVELS.forEach((L) => {
    if (L.chapter !== lastCh) { html += `<div class="chapter">${esc(L.chapter.toUpperCase())}</div>`; lastCh = L.chapter; }
    const done = state.completed.includes(L.id);
    const unlocked = done || L.id <= Math.max(0, ...state.completed.map((x) => x + 1));
    const cls = ["lvl", done && "done", L.id === state.current && "current", !unlocked && "locked"].filter(Boolean).join(" ");
    html += `<button class="${cls}" data-lvl="${L.id}" ${unlocked ? "" : "disabled aria-disabled=\"true\""}>
      <span class="n">${done ? "✓" : L.id}</span><span>${esc(L.title)}</span><span class="xp">${L.xp} XP</span></button>`;
  });
  html += `<div class="chapter">PARCOURS DÉBUTANT · ${state.completed.length} / ${LEVELS.length} MISSIONS</div>`;
  $("map").innerHTML = html;
}

const TABLE_INFO = {
  heros:    { fr: "les héros", about: "Un héros par ligne : son nom, sa classe, son niveau, ses PV, son or et le numéro de son château.", memo: "heros, sans accent." },
  monstres:  { fr: "les monstres", about: "Un monstre par ligne : son nom, son type, sa région, ses PV, son danger et son butin.", memo: "monstres, au pluriel." },
  sorts:    { fr: "les sorts", about: "Un sort par ligne, avec le numéro du héros qui le connaît.", memo: "sorts : les sortilèges." },
  inventaire: { fr: "les objets des héros", about: "Un objet par ligne, avec le numéro du héros qui le porte.", memo: "inventaire : le sac du héros." },
  visites:   { fr: "le registre des gardes", about: "Une visite par ligne : quel héros (num_heros) est entré dans quel château (num_chateau), quel jour et à quelle heure.", memo: "visites : le registre que tiennent les gardes." },
  chateaux:   { fr: "les châteaux", about: "Un château par ligne : son nom, sa région, son seigneur et son trésor.", memo: "chateaux, sans accent circonflexe." }
};
const COL_INFO = { id: "numéro unique", pv: "points de vie", fortune: "l'or du héros", num_chateau: "n° du château", num_heros: "n° du héros",
  mana: "coût en mana", tresor: "l'or du château", ecole: "école de magie", butin: "ce qu'il laisse", jour: "jour de la visite", heure: "heure d'entrée" };
const LINKS = { num_chateau: "chateaux", num_heros: "heros" };   // colonnes qui pointent vers une autre table

const TABLE_ART = { heros: "assets/table-heros.webp", monstres: "assets/table-monstres.webp", sorts: "assets/table-sorts.webp", inventaire: "assets/table-inventaire.webp", chateaux: "assets/table-chateaux.webp", visites: "assets/table-visites.webp" };
const CASTLE_ART = { 1: "assets/chateau-1.webp", 2: "assets/chateau-2.webp", 3: "assets/chateau-3.webp" };
// illustrations au-dessus du récit de certaines missions : un nom de table, ou le numéro d'un château
const HERO_ART = { 1: "assets/heros-1.webp", 2: "assets/heros-2.webp", 3: "assets/heros-3.webp", 4: "assets/heros-4.webp", 5: "assets/heros-5.webp", 6: "assets/heros-6.webp" };   // une image par héros : ajouter les suivants ici
const MONSTER_ART = { 1: "assets/monstre-1.webp", 2: "assets/monstre-2.webp", 3: "assets/monstre-3.webp", 4: "assets/monstre-4.webp", 5: "assets/monstre-5.webp", 6: "assets/monstre-6.webp", 7: "assets/monstre-7.webp", 8: "assets/monstre-8.webp", 9: "assets/monstre-9.webp" };   // une image par monstre : ajouter les suivants ici
const REGION_ART = { "Forêt Sombre": "assets/region-foret.webp", "Marais Putride": "assets/region-marais.webp", "Crypte Oubliée": "assets/region-crypte.webp", "Pics Gelés": "assets/region-pics.webp" };
const LEVEL_ART = { 0: ["heros"], 17: ["h:2"], 31: ["h:3"], 30: ["h:6"], 33: ["h:5"], 34: ["h:6"], 2: ["r:Forêt Sombre"], 4: ["m:5"], 6: ["r:Forêt Sombre", "r:Marais Putride", "r:Crypte Oubliée", "r:Pics Gelés"], 10: ["r:Crypte Oubliée"], 14: ["m:6"], 7: [1, 2, 3], 9: [1, 2, 3], 19: [2], 24: [3], 25: ["visites"], 26: [1], 28: [1], 29: [1] };
function monsterCards(rows) {   // rows : lignes de la table monstres ; une carte par monstre qui a son image
  return `<div class="castles heroes">${rows.filter((r) => MONSTER_ART[r[0]]).map(([id, nom, type, region, pv, danger, butin], i) => `<figure class="castle hero" style="--i:${i}"><img src="${MONSTER_ART[id]}" alt="${esc(nom)}">
    <figcaption><b>${esc(nom)}</b><code>id ${id} · ${esc(type)} · region ${esc(region)} · pv ${pv} · danger ${danger} · butin ${esc(butin)}</code></figcaption></figure>`).join("")}</div>`;
}
function heroCards(rows) {    // rows : lignes de la table heros ; une carte par héros qui a son image
  return `<div class="castles heroes">${rows.filter((r) => HERO_ART[r[0]]).map(([id, nom, classe, niveau, pv, fortune, ch], i) => `<figure class="castle hero" style="--i:${i}"><img src="${HERO_ART[id]}" alt="${esc(nom)}">
    <figcaption><b>${esc(nom)}</b><code>id ${id} · ${esc(classe)} · niveau ${niveau} · pv ${pv} · fortune ${fortune} · num_chateau ${ch}</code></figcaption></figure>`).join("")}</div>`;
}
function regionCards(rows) {   // rows : [region, nombre de monstres, noms]
  return `<div class="castles">${rows.filter((r) => REGION_ART[r[0]]).map(([region, n, noms], i) => `<figure class="castle" style="--i:${i}"><img src="${REGION_ART[region]}" alt="${esc(region)}">
    <figcaption><b>${esc(region)}</b><code>region = '${esc(region)}' · ${n} monstre${n > 1 ? "s" : ""} : ${esc(noms)}</code></figcaption></figure>`).join("")}</div>`;
}
function regionsFor(db, names) {
  const r = db.exec("SELECT region, COUNT(*), GROUP_CONCAT(nom, ', ') FROM monstres GROUP BY region ORDER BY COUNT(*) DESC")[0];
  return regionCards(r ? r.values.filter((x) => !names || names.includes(x[0])) : []);
}
function castleCards(db, ids) {     // une carte par ligne de la table chateaux : une ligne = un château
  const rows = db.exec(`SELECT id, nom, region, seigneur FROM chateaux WHERE id IN (${ids.join(",")}) ORDER BY id`)[0];
  return rows ? `<div class="castles">${rows.values.map(([id, nom, region, seigneur]) => `<figure class="castle"><img src="${CASTLE_ART[id]}" alt="${esc(nom)}">
    <figcaption><b>${esc(nom)}</b><code>id ${id} · region ${esc(region)} · seigneur ${esc(seigneur)}</code></figcaption></figure>`).join("")}</div>` : "";
}
const ARTCAP = { heros: "Les héros du royaume", monstres: "Les monstres des cavernes", sorts: "La bibliothèque des sortilèges", inventaire: "Le sac des aventuriers", chateaux: "Les châteaux du royaume", visites: "Le registre des visites aux portes des châteaux" };
function renderSchema() {
  const db = new SQL.Database(); db.run(SCHEMA_SQL);
  const tables = ["heros", "monstres", "sorts", "inventaire", "chateaux", ...(LEVELS[state.current].id >= 25 ? ["visites"] : [])];
  $("schema").innerHTML = tables.map((t, i) => {
    const cols = db.exec(`PRAGMA table_info(${t})`)[0].values;
    const n = db.exec(`SELECT COUNT(*) FROM ${t}`)[0].values[0][0];
    const T = TABLE_INFO[t];
    return `<details class="tbl" ${i < 2 ? "open" : ""}><summary>${TABLE_ART[t] ? `<img class="tthumb" src="${TABLE_ART[t]}" alt="">` : ""}<span class="tname" style="color:inherit;font-size:inherit">${pixIcon(t, 20)}${t} <b>· ${T.fr}</b></span><span class="tcount">${n} lignes ▾</span></summary>
      ${TABLE_ART[t] ? `<figure class="tblart"><img src="${TABLE_ART[t]}" alt="${ARTCAP[t]}"><figcaption><b>TABLE ${t}</b></figcaption></figure>` : ""}
      <p class="about">${T.about} <i>${T.memo}</i></p>
      ${t === "heros" && Object.keys(HERO_ART).length ? `<p class="about">Chaque ligne de la table est un héros :</p>${heroCards(db.exec("SELECT * FROM heros ORDER BY id")[0].values)}` : ""}
      ${t === "monstres" && Object.keys(MONSTER_ART).length ? `<p class="about">Chaque ligne de la table est un monstre :</p>${monsterCards(db.exec("SELECT * FROM monstres ORDER BY id")[0].values)}` : ""}
      ${t === "monstres" ? `<p class="about">Les régions où vivent les monstres (colonne <code>region</code>) :</p>${regionsFor(db)}` : ""}
      ${t === "chateaux" ? `<p class="about">Chaque ligne de la table est un château :</p>${castleCards(db, [1, 2, 3])}` : ""}
      <div class="cols">${cols.map((c) => `<button data-ins="${c[1]}" title="Insérer ${c[1]}">${c[1]} <span class="t">${COL_INFO[c[1]] || ""}</span>${LINKS[c[1]] ? ` <span class="lk">→ ${LINKS[c[1]]}</span>` : ""}</button>`).join("")}</div>
      <button class="peekTbl" data-peek="${t}">Voir ses ${n} lignes</button></details>`;
  }).join("");
  db.close();
}

function renderLoot() {
  $("loot").innerHTML = state.loot.length
    ? state.loot.map((l) => `<div class="item ${l.kind === "badge" ? "badge" : ""}"><span class="k">${l.kind === "badge" ? "BADGE" : "OBJET"}</span>${esc(l.name)}</div>`).join("")
    : `<p class="empty">Ta besace est vide. Réussis une mission pour la remplir.</p>`;
}

function table(res) {
  if (!res.columns.length) return `<div class="msg info">Le sort n'a rien renvoyé.</div>`;
  return `<div class="tablewrap"><table class="res"><thead><tr>${res.columns.map((c) => `<th>${esc(c)}</th>`).join("")}</tr></thead>
    <tbody>${res.values.map((r, ri) => `<tr style="--i:${ri}">${r.map((v) => `<td>${v === null ? "<i>NULL</i>" : emo(v) + esc(v)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>
    <div class="rowcount">${res.values.length} ligne(s)</div>`;
}

function worldView(w) {
  return w.after.map((a, i) => {
    const b = w.before[i];
    if (a.missing) return b.missing ? `<div class="gone">La table ${esc(a.table)} n'existe pas.</div>` : `<div class="gone">La table ${esc(a.table)} n'existe plus : plan et lignes ont disparu.</div>`;
    const bv = { values: rowsOf(b) }, ch = new Set(changedIds(bv, a)), A = byId(a);
    const gone = bv.values.filter((r) => !A.has(r[0]));
    const planChanged = b.missing || b.sig !== a.sig;
    return `<div class="worldhead">${esc(a.table)}${b.missing ? " · NOUVELLE TABLE" : ""}<span>${ch.size - gone.length} LIGNE(S) CRÉÉE(S) OU MODIFIÉE(S) · ${gone.length} SUPPRIMÉE(S)</span></div>
      ${planChanged ? `<div class="worldplan">Plan : ${a.plan.map((x) => `<code>${esc(x)}</code>`).join(" ")}</div>` : ""}
      <div class="tablewrap"><table class="res"><thead><tr>${a.columns.map((c) => `<th>${esc(c)}</th>`).join("")}</tr></thead>
      <tbody>${a.values.map((r, ri) => `<tr style="--i:${ri}" class="${ch.has(r[0]) ? "chg" : ""}">${r.map((v) => `<td>${v === null ? "<i>NULL</i>" : emo(v) + esc(v)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>
      ${a.values.length ? "" : `<div class="rowcount">La table est vide pour l'instant.</div>`}
      ${gone.length ? `<div class="gone">Supprimé : ${gone.map((r) => esc(r[1])).join(", ")}</div>` : ""}`;
  }).join("");
}
