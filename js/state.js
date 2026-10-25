"use strict";
/* =====================================================================
   3. ÉTAT DU JOUEUR (sauvé dans le navigateur quand c'est possible)
   ===================================================================== */

/* ---------- JOUEURS : chaque joueur a sa propre partie, sauvée dans ce navigateur ---------- */
const Players = (() => {
  const KEY = "grimoire-joueurs-v1";
  let d = { current: null, list: [] };
  try { const x = JSON.parse(localStorage.getItem(KEY)); if (x && Array.isArray(x.list)) d = x; } catch (e) {}
  const persist = () => { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) {} };
  const clean = (n) => String(n || "").replace(/[<>"`]/g, "").replace(/\s+/g, " ").trim().slice(0, 20);
  const slot = (base, name) => `${base}::${String(name).toLowerCase()}`;
  return {
    get current() { return d.current; },
    get list() { return d.list.slice(); },
    clean, slot,
    key: (base) => (d.current ? slot(base, d.current) : base),
    read(base, name) { try { return JSON.parse(localStorage.getItem(slot(base, name))); } catch (e) { return null; } },
    // choisir (ou créer) un joueur ; l'ancienne partie sans nom est confiée au premier joueur de ce navigateur
    choose(name, legacyKeys) {
      name = clean(name); if (!name) return null;
      const found = d.list.find((n) => n.toLowerCase() === name.toLowerCase());
      if (!found) {
        d.list.push(name);
        (legacyKeys || []).forEach((k) => { try {
          const old = localStorage.getItem(k);
          if (old && !localStorage.getItem(k + "::adopte") && !localStorage.getItem(slot(k, name))) { localStorage.setItem(slot(k, name), old); localStorage.setItem(k + "::adopte", name); }
        } catch (e) {} });
      }
      d.current = found || name; persist(); return d.current;
    },
    forget(name, bases) {
      d.list = d.list.filter((n) => n !== name); if (d.current === name) d.current = null; persist();
      (bases || []).forEach((b) => { try { localStorage.removeItem(slot(b, name)); } catch (e) {} });
    }
  };
})();
// L'écran « Qui joue ? » : au premier accès, et quand on touche le bouton du joueur en haut
function playerGate({ summary, bases, legacy, onChoose, canClose }) {
  const old = document.getElementById("playerGate"); if (old) old.remove();
  const g = document.createElement("div"); g.id = "playerGate"; g.className = "pgate";
  const list = Players.list;
  const e = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  g.innerHTML = `<div class="pcard" role="dialog" aria-modal="true" aria-labelledby="pgTitle">
    <img class="plogo" src="assets/logo-480.webp" alt="">
    <h2 id="pgTitle">${list.length ? "Qui joue ?" : "Bienvenue, aventurier !"}</h2>
    ${list.length ? `<p>Touche ton nom pour reprendre ta partie là où tu l'as laissée.</p>
      <div class="plist">${list.map((n, i) => `<div class="prow"><button class="pbtn" data-pick="${i}"><b>${e(n)}</b><span>${e(summary(n))}</span></button><button class="pdel" data-del="${i}" title="Effacer la partie de ${e(n)}" aria-label="Effacer la partie de ${e(n)}">✕</button></div>`).join("")}</div>
      <p class="psep">ou nouveau joueur :</p>` : `<p>Avant de commencer, écris ton <b>nom de joueur</b>. Il sert à retrouver ta partie : la prochaine fois, choisis le même nom et tu reprendras là où tu t'es arrêté.</p>`}
    <form class="pform" id="pgForm" autocomplete="off">
      <label for="pgName">Ton nom de joueur</label>
      <div class="pline"><input id="pgName" maxlength="20" autocomplete="off" autocorrect="off" autocapitalize="words" spellcheck="false" enterkeyhint="go" placeholder="Par exemple : Lina">
      <button class="pgo" type="submit">${list.length ? "Créer" : "Commencer"}</button></div>
      <p class="perr" id="pgErr" hidden>Écris au moins une lettre.</p>
    </form>
    <p class="pnote">Ta partie est gardée dans ce navigateur, sur cet appareil. Chaque joueur a la sienne.</p>
    ${canClose ? `<button class="pclose" id="pgClose">Annuler</button>` : ""}
  </div>`;
  document.body.appendChild(g);
  const done = (name) => { const n = Players.choose(name, legacy); if (!n) return false; g.remove(); onChoose(n); return true; };
  g.querySelectorAll("[data-pick]").forEach((b) => b.onclick = () => done(list[+b.dataset.pick]));
  g.querySelectorAll("[data-del]").forEach((b) => { let armed = false; b.onclick = () => {
    if (!armed) { armed = true; b.textContent = "Effacer ?"; b.classList.add("armed"); setTimeout(() => { armed = false; b.textContent = "✕"; b.classList.remove("armed"); }, 3000); return; }
    const n = list[+b.dataset.del], wasCurrent = Players.current === n; Players.forget(n, bases);
    playerGate({ summary, bases, legacy, onChoose, canClose: canClose && !wasCurrent }); }; });
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
function save() { if (!Players.current) return; try { localStorage.setItem(Players.key(SAVE_KEY), JSON.stringify(state)); } catch (e) {} }
function gameSummary(name) {
  const s = Players.read(SAVE_KEY, name);
  if (!s || typeof s.current !== "number") return "nouvelle partie";
  const L = LEVELS[s.current] || LEVELS[0];
  return `mission ${L.id} · ${(s.completed || []).length}/${LEVELS.length} réussies · ${s.xp || 0} XP`;
}

// Classement des joueurs inscrits dans ce navigateur, calculé… avec une vraie requête SQL (RANK() OVER, chapitre 8)
const RANK_SQL = "SELECT RANK() OVER (ORDER BY niveau DESC, xp DESC) AS rang, nom, niveau, xp, missions, badges\nFROM joueurs\nORDER BY rang, nom;";
function openRanking() {
  const old = document.getElementById("playerGate"); if (old) old.remove();
  const db = new SQL.Database(); let res = { values: [] };
  try {
    db.run("CREATE TABLE joueurs (nom TEXT, niveau INTEGER, xp INTEGER, missions INTEGER, badges INTEGER)");
    const ins = db.prepare("INSERT INTO joueurs VALUES (?, ?, ?, ?, ?)");
    Players.list.forEach((n) => {
      const g = Players.read(SAVE_KEY, n) || {}, xp = g.xp || 0;
      ins.run([n, Math.floor(xp / 150) + 1, xp, (g.completed || []).length, (g.loot || []).filter((l) => l.kind === "badge").length]);
    });
    ins.free();
    const r = db.exec(RANK_SQL)[0]; if (r) res = r;
  } finally { db.close(); }
  const medal = (r) => ({ 1: "🥇", 2: "🥈", 3: "🥉" }[r] || r);
  const g = document.createElement("div"); g.id = "playerGate"; g.className = "pgate";
  g.innerHTML = `<div class="pcard rankcard" role="dialog" aria-modal="true" aria-labelledby="rkTitle">
    <h2 id="rkTitle">🏆 Classement des joueurs</h2>
    <p>Du plus haut <b>niveau</b> au plus bas. À niveau égal, le plus d'XP passe devant. Le niveau monte de 1 tous les 150 XP.</p>
    ${res.values.length ? `<div class="tablewrap"><table class="res rank"><thead><tr><th>Rang</th><th>Joueur</th><th>Niveau</th><th>XP</th><th>Missions</th><th>Badges</th></tr></thead>
      <tbody>${res.values.map(([rang, nom, niveau, xp, missions, badges]) => `<tr class="${nom === Players.current ? "me" : ""}"><td class="rk">${medal(rang)}</td><td><b>${esc(nom)}</b>${nom === Players.current ? ' <span class="you">toi</span>' : ""}</td><td>${niveau}</td><td>${xp}</td><td>${missions}/${LEVELS.length}</td><td>${badges}</td></tr>`).join("")}</tbody></table></div>`
      : `<p>Aucun joueur pour l'instant.</p>`}
    <p class="pnote">Seuls les joueurs inscrits dans ce navigateur, sur cet appareil, apparaissent.${res.values.length < 2 ? " Invite quelqu'un à créer son joueur avec le bouton 👤 !" : ""}</p>
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
    onChoose: () => { loadState(); showPlayer(); buildDictionary(LEVELS[state.current]); renderHUD(); renderMap(); renderLoot(); renderSchema(); renderLevel(); FX.play("levelup");
      if (!state.seenIntro) showIntro(); } });
}

let SQL = null;
const $ = (id) => document.getElementById(id);
