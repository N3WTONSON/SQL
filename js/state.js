"use strict";
/* =====================================================================
   3. ÉTAT DU JOUEUR (sauvé dans le navigateur quand c'est possible)
   ===================================================================== */

/* ---------- JOUEURS : chaque joueur a sa propre partie, sauvée dans ce navigateur ---------- */
const Players = (() => {
  const KEY = "grimoire-joueurs-v1";
  let d = { current: null, list: [], ids: {} };
  try { const x = JSON.parse(localStorage.getItem(KEY)); if (x && Array.isArray(x.list)) d = Object.assign({ ids: {} }, x); } catch (e) {}
  const persist = () => { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) {} };
  const clean = (n) => String(n || "").replace(/[<>"`]/g, "").replace(/\s+/g, " ").trim().slice(0, 20);
  const low = (n) => String(n).toLowerCase();
  const slot = (base, name) => `${base}::${low(name)}`;
  const newId = () => (window.crypto && crypto.randomUUID ? crypto.randomUUID() : "j" + Date.now().toString(36) + Math.random().toString(36).slice(2, 10));
  return {
    get current() { return d.current; },
    get list() { return d.list.slice(); },
    clean, slot,
    key: (base) => (d.current ? slot(base, d.current) : base),
    read(base, name) { try { return JSON.parse(localStorage.getItem(slot(base, name))); } catch (e) { return null; } },
    // identifiant unique du joueur : il le suit d'un appareil à l'autre grâce au code de sauvegarde
    idOf(name) { if (!d.ids[low(name)]) { d.ids[low(name)] = newId(); persist(); } return d.ids[low(name)]; },
    has: (name) => d.list.some((n) => low(n) === low(clean(name))),
    // choisir (ou créer) un joueur ; l'ancienne partie sans nom est confiée au premier joueur de ce navigateur
    choose(name, legacyKeys) {
      name = clean(name); if (!name) return null;
      const found = d.list.find((n) => low(n) === low(name));
      if (!found) {
        d.list.push(name);
        (legacyKeys || []).forEach((k) => { try {
          const old = localStorage.getItem(k);
          if (old && !localStorage.getItem(k + "::adopte") && !localStorage.getItem(slot(k, name))) { localStorage.setItem(slot(k, name), old); localStorage.setItem(k + "::adopte", name); }
        } catch (e) {} });
      }
      d.current = found || name; this.idOf(d.current); persist(); return d.current;
    },
    forget(name, bases) {
      d.list = d.list.filter((n) => n !== name); delete d.ids[low(name)]; if (d.current === name) d.current = null; persist();
      (bases || []).forEach((b) => { try { localStorage.removeItem(slot(b, name)); } catch (e) {} });
    },
    // tout ce qui appartient à un joueur sur cet appareil (aventure, Premiers pas, entraînement)
    snapshot(name) {
      const out = { v: 1, n: name, id: this.idOf(name), k: {} }, tail = "::" + low(name);
      try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.endsWith(tail) && k.startsWith("grimoire-") && !k.startsWith("grimoire-joueurs")) out.k[k.slice(0, -tail.length)] = localStorage.getItem(k); } } catch (e) {}
      return out;
    },
    restore(data) {
      const name = clean(data.n); if (!name) return null;
      const found = d.list.find((n) => low(n) === low(name)) || name;
      if (!d.list.includes(found)) d.list.push(found);
      if (data.id) d.ids[low(found)] = String(data.id).slice(0, 60);
      Object.entries(data.k || {}).forEach(([base, val]) => { if (/^grimoire-[\w-]+$/.test(base) && typeof val === "string") try { localStorage.setItem(slot(base, found), val); } catch (e) {} });
      d.current = found; persist(); return found;
    }
  };
})();

/* ---------- CODE DE SAUVEGARDE : la partie tient dans un texte à copier sur un autre appareil ---------- */
const b64u = {
  enc: (bytes) => { let s = ""; bytes.forEach((b) => { s += String.fromCharCode(b); }); return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); },
  dec: (str) => { const s = atob(str.replace(/-/g, "+").replace(/_/g, "/")); return Uint8Array.from(s, (c) => c.charCodeAt(0)); }
};
async function streamBytes(bytes, Stream, mode) { const r = new Blob([bytes]).stream().pipeThrough(new Stream(mode)); return new Uint8Array(await new Response(r).arrayBuffer()); }
async function packSave(name) {
  const raw = new TextEncoder().encode(JSON.stringify(Players.snapshot(name)));
  if (window.CompressionStream) { try { return "GRIM1." + b64u.enc(await streamBytes(raw, CompressionStream, "deflate-raw")); } catch (e) {} }
  return "GRIM0." + b64u.enc(raw);
}
async function unpackSave(code) {
  const m = String(code || "").replace(/\s+/g, "").match(/^GRIM([01])\.([\w-]+)$/);
  if (!m) throw new Error("Ce n'est pas un code de sauvegarde du Grimoire : il doit commencer par GRIM.");
  let bytes = b64u.dec(m[2]);
  if (m[1] === "1") { if (!window.DecompressionStream) throw new Error("Ce navigateur est trop ancien pour lire ce code. Mets-le à jour, ou essaie un autre navigateur."); bytes = await streamBytes(bytes, DecompressionStream, "deflate-raw"); }
  const data = JSON.parse(new TextDecoder().decode(bytes));
  if (!data || data.v !== 1 || !data.n || typeof data.k !== "object") throw new Error("Ce code est incomplet ou abîmé. Recopie-le en entier.");
  return data;
}

// L'écran « Qui joue ? » : au premier accès, et quand on touche le bouton du joueur en haut
function playerGate({ summary, bases, legacy, onChoose, canClose }) {
  const old = document.getElementById("playerGate"); if (old) old.remove();
  const g = document.createElement("div"); g.id = "playerGate"; g.className = "pgate";
  const list = Players.list;
  const e = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const reopen = (extra) => playerGate(Object.assign({ summary, bases, legacy, onChoose, canClose }, extra || {}));
  g.innerHTML = `<div class="pcard" role="dialog" aria-modal="true" aria-labelledby="pgTitle">
    <img class="plogo" src="assets/logo-480.webp" alt="">
    <h2 id="pgTitle">${list.length ? "Qui joue ?" : "Bienvenue, aventurier !"}</h2>
    ${list.length ? `<p>Touche ton nom pour reprendre ta partie là où tu l'as laissée.</p>
      <div class="plist">${list.map((n, i) => `<div class="prow"><button class="pbtn" data-pick="${i}"><b>${e(n)}</b><span>${e(summary(n))}</span></button><button class="pdel pexp" data-exp="${i}" title="Code de sauvegarde de ${e(n)}, pour continuer sur un autre appareil" aria-label="Code de sauvegarde de ${e(n)}">📤</button><button class="pdel" data-del="${i}" title="Effacer la partie de ${e(n)}" aria-label="Effacer la partie de ${e(n)}">✕</button></div>`).join("")}</div>
      <p class="psep">ou nouveau joueur :</p>` : `<p>Avant de commencer, écris ton <b>nom de joueur</b>. Il sert à retrouver ta partie : la prochaine fois, choisis le même nom et tu reprendras là où tu t'es arrêté.</p>`}
    <form class="pform" id="pgForm" autocomplete="off">
      <label for="pgName">Ton nom de joueur</label>
      <div class="pline"><input id="pgName" maxlength="20" autocomplete="off" autocorrect="off" autocapitalize="words" spellcheck="false" enterkeyhint="go" placeholder="Par exemple : Lina">
      <button class="pgo" type="submit">${list.length ? "Créer" : "Commencer"}</button></div>
      <p class="perr" id="pgErr" hidden>Écris au moins une lettre.</p>
    </form>
    <button class="pimport" id="pgImport">📥 Tu as déjà joué sur un autre appareil ? <b>Entre ton code de sauvegarde</b></button>
    <p class="pnote">Ta partie est gardée sur cet appareil. Pour la continuer ailleurs, touche 📤 à côté de ton nom : tu obtiens un code de sauvegarde à recopier sur l'autre appareil.</p>
    ${canClose ? `<button class="pclose" id="pgClose">Annuler</button>` : ""}
  </div>`;
  document.body.appendChild(g);
  const card = g.querySelector(".pcard");
  const done = (name) => { const n = Players.choose(name, legacy); if (!n) return false; g.remove(); onChoose(n); return true; };
  g.querySelectorAll("[data-pick]").forEach((b) => b.onclick = () => done(list[+b.dataset.pick]));
  g.querySelectorAll("[data-del]").forEach((b) => { let armed = false; b.onclick = () => {
    if (!armed) { armed = true; b.textContent = "Effacer ?"; b.classList.add("armed"); setTimeout(() => { armed = false; b.textContent = "✕"; b.classList.remove("armed"); }, 3000); return; }
    const n = list[+b.dataset.del], wasCurrent = Players.current === n; Players.forget(n, bases);
    reopen({ canClose: canClose && !wasCurrent }); }; });
  // 📤 : afficher le code de sauvegarde d'un joueur
  g.querySelectorAll("[data-exp]").forEach((b) => b.onclick = async () => {
    const n = list[+b.dataset.exp], code = await packSave(n);
    card.innerHTML = `<h2>📤 Sauvegarde de ${e(n)}</h2>
      <p>Pour continuer sur un autre appareil : ouvre le Grimoire là-bas, touche <b>« Entre ton code de sauvegarde »</b> et colle ce code.</p>
      <textarea class="pcode" id="pgCode" readonly spellcheck="false">${code}</textarea>
      <div class="pbtns"><button class="pgo" id="pgCopy">Copier le code</button><button class="pgo alt" id="pgFile">Télécharger le fichier</button></div>
      <p class="perr ok" id="pgMsg" hidden></p>
      <p class="pnote">Le code contient ta partie telle qu'elle est maintenant. Quand tu auras avancé, refais un nouveau code. Garde-le pour toi : il donne ta partie à qui le colle.</p>
      <button class="pclose" id="pgBack">Retour</button>`;
    const msg = (t) => { const m = document.getElementById("pgMsg"); m.textContent = t; m.hidden = false; };
    const ta = document.getElementById("pgCode"); ta.onclick = () => ta.select();
    document.getElementById("pgCopy").onclick = async () => {
      ta.select();
      try { await navigator.clipboard.writeText(code); msg("Code copié ! Colle-le sur l'autre appareil."); }
      catch (err) { try { document.execCommand("copy"); msg("Code copié ! Colle-le sur l'autre appareil."); } catch (e2) { msg("Le code est sélectionné : copie-le (Ctrl + C, ou appui long puis « Copier »)."); } }
    };
    if (document.getElementById("pgFile")) document.getElementById("pgFile").onclick = () => {
      try { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([code], { type: "text/plain" })); a.download = `grimoire-${Players.clean(n).replace(/[^\wÀ-ÿ-]+/g, "_")}.txt`; document.body.appendChild(a); a.click(); a.remove(); msg("Fichier téléchargé : envoie-le sur l'autre appareil (mail, clé USB…)."); }
      catch (err) { msg("Le téléchargement n'est pas permis ici : copie plutôt le code."); }
    };
    document.getElementById("pgBack").onclick = () => reopen();
    setTimeout(() => ta.select(), 50);
  });
  // 📥 : retrouver une partie avec un code
  document.getElementById("pgImport").onclick = () => {
    card.innerHTML = `<h2>📥 Retrouver ma partie</h2>
      <p>Colle ici le code de sauvegarde obtenu sur l'autre appareil (il commence par <code>GRIM</code>), ou choisis le fichier de sauvegarde.</p>
      <textarea class="pcode" id="pgCode" spellcheck="false" autocomplete="off" autocorrect="off" autocapitalize="off" placeholder="GRIM1.…"></textarea>
      <label class="pfile">📄 Ouvrir un fichier de sauvegarde<input type="file" id="pgFileIn" accept=".txt,text/plain"></label>
      <p class="perr" id="pgErr2" hidden></p>
      <div class="pbtns"><button class="pgo" id="pgGo">Retrouver ma partie</button></div>
      <button class="pclose" id="pgBack">Retour</button>`;
    const ta = document.getElementById("pgCode"), err = (t) => { const m = document.getElementById("pgErr2"); m.textContent = t; m.hidden = false; };
    document.getElementById("pgFileIn").onchange = async (ev) => { const f = ev.target.files[0]; if (f) ta.value = (await f.text()).trim(); };
    let armedFor = null;
    document.getElementById("pgGo").onclick = async () => {
      let data; try { data = await unpackSave(ta.value); } catch (x) { err(/^(Ce |Cet )/.test(x.message) ? x.message : "Ce code est incomplet ou abîmé : il manque peut-être un morceau. Recopie-le en entier, ou utilise le fichier de sauvegarde."); return; }
      if (Players.has(data.n) && armedFor !== data.n) { armedFor = data.n; err(`Il y a déjà un joueur « ${data.n} » sur cet appareil. Touche encore « Retrouver ma partie » pour remplacer sa partie par celle du code.`); document.getElementById("pgGo").textContent = "Remplacer la partie"; return; }
      const n = Players.restore(data); g.remove(); onChoose(n);
    };
    document.getElementById("pgBack").onclick = () => reopen();
    setTimeout(() => ta.focus(), 50);
  };
  document.getElementById("pgForm").onsubmit = (ev) => { ev.preventDefault();
    if (!done(document.getElementById("pgName").value)) { document.getElementById("pgErr").hidden = false; document.getElementById("pgName").focus(); } };
  if (canClose) document.getElementById("pgClose").onclick = () => g.remove();
  setTimeout(() => (list.length ? g.querySelector(".pbtn") : document.getElementById("pgName")).focus(), 50);
}

const SAVE_KEY = "grimoire-sql-v1";
const fresh = () => ({ current: 0, completed: [], xp: 0, hp: MAX_HP, scrolls: START_SCROLLS, hintsUsed: {}, loot: [], seenIntro: false });
let state = fresh();
function loadState() {      // la partie du joueur en cours
  state = fresh();
  try { const s = JSON.parse(localStorage.getItem(Players.key(SAVE_KEY))); if (s && typeof s.current === "number") state = Object.assign(fresh(), s); } catch (e) {}
}
loadState();
function save() { if (!Players.current) return; try { localStorage.setItem(Players.key(SAVE_KEY), JSON.stringify(state)); } catch (e) {} pushScore(); }

/* ---------- CLASSEMENT COMMUN À TOUS LES APPAREILS (facultatif) ----------
   Le site est statique (GitHub Pages) : les scores sont envoyés à une petite feuille Google Sheets
   dont l'adresse se règle dans config.js (voir le README). Seuls le nom, le niveau, l'XP, les missions
   et les badges partent ; la partie elle-même reste sur l'appareil. Sans adresse, le classement est local. */
const CLASSEMENT_URL = (typeof window !== "undefined" && typeof window.GRIMOIRE_CLASSEMENT_URL === "string") ? window.GRIMOIRE_CLASSEMENT_URL.trim() : "";
const scoreOf = (name, g) => { g = g || {}; const xp = g.xp || 0; return { id: Players.idOf(name), nom: name, niveau: Math.floor(xp / 150) + 1, xp, missions: (g.completed || []).length, badges: (g.loot || []).filter((l) => l.kind === "badge").length }; };
let pushTimer = null;
function pushScore(now) {
  if (!CLASSEMENT_URL || !Players.current) return;
  clearTimeout(pushTimer);
  pushTimer = setTimeout(() => {
    try { fetch(CLASSEMENT_URL, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(scoreOf(Players.current, state)) }).catch(() => {}); } catch (e) {}
  }, now ? 0 : 1500);
}
async function onlineScores() {
  if (!CLASSEMENT_URL) return null;
  try {
    const ctrl = window.AbortController ? new AbortController() : null; const t = setTimeout(() => ctrl && ctrl.abort(), 6000);
    const r = await fetch(CLASSEMENT_URL, { signal: ctrl ? ctrl.signal : undefined }); clearTimeout(t);
    const rows = await r.json(); return Array.isArray(rows) ? rows : null;
  } catch (e) { return null; }
}
function gameSummary(name) {
  const s = Players.read(SAVE_KEY, name);
  if (!s || typeof s.current !== "number") return "nouvelle partie";
  const L = LEVELS[s.current] || LEVELS[0];
  return `mission ${L.id} · ${(s.completed || []).length}/${LEVELS.length} réussies · ${s.xp || 0} XP`;
}

// Classement des joueurs inscrits dans ce navigateur, calculé… avec une vraie requête SQL (RANK() OVER, chapitre 8)
const RANK_SQL = "SELECT RANK() OVER (ORDER BY niveau DESC, xp DESC) AS rang, nom, niveau, xp, missions, badges, id\nFROM joueurs\nORDER BY rang, nom;";
async function openRanking() {
  const old = document.getElementById("playerGate"); if (old) old.remove();
  const wait = document.createElement("div"); wait.id = "playerGate"; wait.className = "pgate";
  wait.innerHTML = `<div class="pcard"><h2>🏆 Classement</h2><p>${CLASSEMENT_URL ? "Je récupère les scores de tous les appareils…" : "Calcul du classement…"}</p></div>`;
  document.body.appendChild(wait);
  // les joueurs de cet appareil, puis ceux du classement en ligne (un même joueur n'apparaît qu'une fois, grâce à son identifiant)
  const byId = new Map();
  Players.list.forEach((n) => byId.set(Players.idOf(n), scoreOf(n, Players.read(SAVE_KEY, n))));
  const online = await onlineScores();
  (online || []).forEach((o) => { if (!o || !o.id || !o.nom) return; const mine = byId.get(o.id); if (!mine || (+o.xp || 0) > mine.xp) byId.set(o.id, { id: o.id, nom: String(o.nom).slice(0, 20), niveau: +o.niveau || 1, xp: +o.xp || 0, missions: +o.missions || 0, badges: +o.badges || 0 }); });
  wait.remove();
  const myId = Players.current ? Players.idOf(Players.current) : null;
  const db = new SQL.Database(); let res = { values: [] };
  try {
    db.run("CREATE TABLE joueurs (id TEXT, nom TEXT, niveau INTEGER, xp INTEGER, missions INTEGER, badges INTEGER)");
    const ins = db.prepare("INSERT INTO joueurs VALUES (?, ?, ?, ?, ?, ?)");
    byId.forEach((j) => ins.run([j.id, j.nom, j.niveau, j.xp, j.missions, j.badges]));
    ins.free();
    const r = db.exec(RANK_SQL)[0]; if (r) res = r;
  } finally { db.close(); }
  const medal = (r) => ({ 1: "🥇", 2: "🥈", 3: "🥉" }[r] || r);
  const g = document.createElement("div"); g.id = "playerGate"; g.className = "pgate";
  g.innerHTML = `<div class="pcard rankcard" role="dialog" aria-modal="true" aria-labelledby="rkTitle">
    <h2 id="rkTitle">🏆 Classement des joueurs</h2>
    <p>Du plus haut <b>niveau</b> au plus bas. À niveau égal, le plus d'XP passe devant. Le niveau monte de 1 tous les 150 XP.</p>
    ${res.values.length ? `<div class="tablewrap"><table class="res rank"><thead><tr><th>Rang</th><th>Joueur</th><th>Niveau</th><th>XP</th><th>Missions</th><th>Badges</th></tr></thead>
      <tbody>${res.values.map(([rang, nom, niveau, xp, missions, badges, id]) => `<tr class="${id === myId ? "me" : ""}"><td class="rk">${medal(rang)}</td><td><b>${esc(nom)}</b>${id === myId ? ' <span class="you">toi</span>' : ""}</td><td>${niveau}</td><td>${xp}</td><td>${missions}/${LEVELS.length}</td><td>${badges}</td></tr>`).join("")}</tbody></table></div>`
      : `<p>Aucun joueur pour l'instant.</p>`}
    <p class="pnote">${online ? "🌍 Classement en ligne : les joueurs de tous les appareils." : CLASSEMENT_URL ? "⚠️ Le classement en ligne ne répond pas (pas d'Internet ?) : seuls les joueurs de cet appareil apparaissent." : "Seuls les joueurs de cet appareil apparaissent. Pour un classement commun à tous les appareils, il faut régler config.js (voir le README)."}</p>
    <details class="rksql"><summary>La requête SQL qui calcule ce classement</summary>
      <pre><code>${esc(RANK_SQL)}</code></pre>
      <p>C'est le <code>RANK() OVER</code> du chapitre 8 : chaque joueur est une ligne de la table <code>joueurs</code>, et le rang est écrit dans une colonne. Deux joueurs à égalité reçoivent le même rang.</p></details>
    <button class="pclose" id="rkClose">Fermer</button>
  </div>`;
  document.body.appendChild(g);
  const close = () => g.remove();
  $("rkClose").onclick = close; g.addEventListener("click", (e) => { if (e.target === g) close(); });
  setTimeout(() => $("rkClose").focus(), 50);
}
function showPlayer() { $("playerName").textContent = Players.current || "Joueur"; }
function openPlayers(first) {
  playerGate({ summary: gameSummary, bases: [SAVE_KEY], legacy: [SAVE_KEY], canClose: !first,
    onChoose: () => { loadState(); showPlayer(); pushScore(true); buildDictionary(LEVELS[state.current]); renderHUD(); renderMap(); renderLoot(); renderSchema(); renderLevel(); FX.play("levelup");
      if (!state.seenIntro) showIntro(); } });
}

let SQL = null;
const $ = (id) => document.getElementById(id);
