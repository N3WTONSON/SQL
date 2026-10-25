"use strict";
/* =====================================================================
   6. ACTIONS DU JOUEUR
   ===================================================================== */
function explore() {
  const q = $("sql").value.trim(); if (!q) return;
  $("consoleMode").textContent = "MODE EXPLORATION";
  const L = curL();
  try {
    if (L.mode === "write") {
      const w = runWorld(L, q);
      const changed = w.after.some((a, i) => a.missing !== w.before[i].missing || (!a.missing && (a.sig !== w.before[i].sig || changedIds({ values: rowsOf(w.before[i]) }, a).length)));
      $("out").innerHTML = (w.res && !changed ? table(w.res)
        : `<div class="msg info">Vision d'un royaume parallèle : rien n'est validé, les lignes touchées sont surlignées.</div>` + (w.res ? table(w.res) : "") + worldView(w));
    } else $("out").innerHTML = table(run(q, worldSetup(L)));
  }
  catch (e) { $("out").innerHTML = `<div class="msg warn"><b>VISION TROUBLE</b>${esc(translateError(e.message))}</div>`; }
}

function cast() {
  const L = curL();
  const q = $("sql").value.trim();
  if (!q) return;
  $("consoleMode").textContent = "MISSION";
  FX.play("cast"); const sb = document.querySelector(".spellbox"); sb.classList.remove("casting"); void sb.offsetWidth; sb.classList.add("casting");
  const write = L.mode === "write";
  let got;
  try { got = write ? runWorld(L, q) : run(q, worldSetup(L)); }
  catch (e) {                                    // erreur de syntaxe : -1 PV
    attempt.fails += 1; if (L.daily) renderDailyBar();
    if (L.blitz) { FX.play("bad"); $("out").innerHTML = `<div class="msg warn"><b>PRESQUE !</b>${esc(translateError(e.message))} Aucun PV perdu en défi éclair.</div>`; return; }
    state.hp -= 1; save(); renderHUD(true); FX.play("hit");
    document.querySelector(".spellbox").classList.remove("shake"); void document.body.offsetWidth;
    document.querySelector(".spellbox").classList.add("shake");
    const caseTip = /\bCASE\b/i.test(q) && !/\bEND\b/i.test(q) ? " Un CASE se termine toujours par END." : "";
    $("out").innerHTML = `<div class="msg err"><b>LE SORT SE RETOURNE CONTRE TOI · −1 PV</b>${esc(translateError(e.message) + caseTip)}</div>`;
    if (state.hp <= 0) knockOut();
    return;
  }
  if (L.forbid && L.forbid.re.test(q)) {         // contrainte pédagogique du niveau : pas de dégâts
    attempt.fails += 1;
    setTimeout(() => FX.play("bad"), 250);
    $("out").innerHTML = `<div class="msg warn"><b>LE SORT FONCTIONNE, MAIS LA RÈGLE N'EST PAS RESPECTÉE</b>${esc(L.forbid.msg)}</div>` + (write ? worldView(got) : table(got));
    return;
  }
  if (write) {                                   // chapitre 4 : on juge l'état du royaume, pas l'affichage
    const problem = compareWorld(got, runWorld(L, L.expected), q);
    if (problem) { attempt.fails += 1; setTimeout(() => FX.play("bad"), 250); $("out").innerHTML = `<div class="msg warn"><b>LE SORT FONCTIONNE, MAIS LE ROYAUME N'EST PAS COMME PRÉVU</b>${esc(problem)}</div>` + worldView(got); return; }
    $("out").innerHTML = `<div class="msg ok"><b>SORT RÉUSSI</b>Le royaume a changé exactement comme il fallait. Les lignes surlignées portent ta marque.</div>` + worldView(got) + decomposition(L);
    victory(L);
    return;
  }
  const want = run(L.expected, worldSetup(L));
  let problem = compare(got, want, L.ordered);
  if (problem) problem += queryTips(q, problem);
  if (problem) {                                 // sort valide mais mauvaise cible : pas de dégâts
    attempt.fails += 1; if (L.daily) renderDailyBar();
    let diff = "";
    if (got.columns.length && got.columns.length === want.columns.length && !/mauvais ordre/.test(problem)) {
      const { extra, missing } = diffRows(got, want);
      const list = (rows) => rows.slice(0, 6).map((r) => `<span>${r.map((v) => v === null ? "NULL" : emo(v) + esc(v)).join(" · ")}</span>`).join("") + (rows.length > 6 ? `<span>… et ${rows.length - 6} autre(s)</span>` : "");
      if (extra.length || missing.length) diff = `<div class="diff">
        ${extra.length ? `<div class="plus"><span class="label">En trop dans ton résultat (${extra.length})</span>${list(extra)}</div>` : ""}
        ${missing.length ? `<div class="minus"><span class="label">Attendues mais absentes (${missing.length})</span>${list(missing)}</div>` : ""}
        <p>Pour comprendre, compare ces lignes : qu'ont-elles en commun ? Celles en trop ont passé ton filtre alors qu'elles n'auraient pas dû ; les absentes ont été écartées, ou modifiées, à tort.</p></div>`;
    }
    setTimeout(() => FX.play("bad"), 250);
    $("out").innerHTML = `<div class="msg warn"><b>LE SORT FONCTIONNE, MAIS RATE SA CIBLE</b>${esc(problem)}</div>` + diff + table(got);
    return;
  }
  $("out").innerHTML = `<div class="msg ok"><b>SORT RÉUSSI</b>La boule de cristal confirme ta vision.</div>` + table(got) + (L.daily ? "" : decomposition(L));
  victory(L);
}

function victory(L) {
  if (L.blitz) return blitzRight();
  if (L.daily) return dailyWin(L);
  const first = !state.completed.includes(L.id);
  const lvlBefore = playerLevel();
  const ownedBefore = new Set(ALBUM.filter(cardOwned).map((c) => c.k));
  const stars = attemptStars(), oldStars = levelStars(L.id), ev = { L, stars, hints: attempt.hints, fails: attempt.fails };
  state.stars = state.stars || {}; if (stars > oldStars) state.stars[L.id] = stars;
  attempt = { key: null, fails: 0, hints: 0 };
  let gained = 0;
  if (first) {
    gained = Math.max(10, L.xp - (state.hintsUsed[L.id] || 0) * 15);   // chaque parchemin lu coûte 15 XP de récompense
    state.xp += gained;
    state.completed.push(L.id);
    state.loot.push({ kind: "item", name: L.item });
    if (L.badge) state.loot.push({ kind: "badge", name: L.badge });
    if (state.hp < MAX_HP) state.hp += 1;     // une victoire soigne 1 PV
  }
  const next = LEVELS[L.id + 1];
  const chapterEnd = !next || next.chapter !== L.chapter;
  if (first && chapterEnd) state.scrolls += 2;   // bonus de fin de chapitre
  ev.newCards = ALBUM.filter((c) => cardOwned(c) && !ownedBefore.has(c.k));
  let extra = afterSuccess(ev);
  const gear = syncEquipment();
  if (gear.length) extra += `<div class="xtra card">${avatarImg(40)} <b>Nouvel équipement pour ton héros :</b> ${gear.map((g) => `${g.ico} ${esc(g.name)}`).join(", ")}</div>`;
  extra += nextStepsHTML();
  save(); renderHUD(); renderMap(); renderLoot();
  const levelUp = playerLevel() > lvlBefore;
  const chName = L.chapter.split(" · ")[0];
  $("overlay").innerHTML = `<div class="card" role="dialog" aria-modal="true" aria-labelledby="vt">
      ${chapterEnd ? `<img class="logo sm" src="assets/logo-480.webp" alt="">` : ""}
      <h3 id="vt">${!next ? "Maître du Grimoire !" : chapterEnd ? `${esc(chName)} terminé !` : levelUp ? "Niveau supérieur !" : "Victoire !"}</h3>
      <div class="bigstars" aria-label="${stars} étoile(s) sur 3">${[1, 2, 3].map((i) => `<span class="${i <= stars ? "" : "off"}">★</span>`).join("")}</div>
      <p class="starhint">${stars === 3 ? "Parfait : sans parchemin et du premier coup !" : stars === 2 ? "Sans parchemin ! Du premier coup, ce sera ⭐⭐⭐." : "Rejoue-la sans parchemin pour gagner des étoiles."}${!first && stars > oldStars ? ` Nouveau record (avant : ${starsTxt(oldStars)}).` : ""}</p>
      <p>${first ? `Mission « ${esc(L.title)} » accomplie.` : "Mission déjà accomplie : pas de nouvel XP, mais l'entraînement paie."}</p>
      ${first ? `<div class="rewards"><span class="x">+${gained} XP</span><span class="i">${esc(L.item)}</span>${L.badge ? `<span class="b">${esc(L.badge)}</span>` : ""}${levelUp ? `<span class="x">NIV ${playerLevel()}</span>` : ""}${chapterEnd ? `<span class="i">+2 📜 parchemins</span>` : ""}</div>` : ""}
      ${extra}
      ${PEDAGOGY[L.id] ? `<div class="takeaway"><b>À RETENIR</b>${esc(PEDAGOGY[L.id].takeaway)}</div>` : ""}
      ${!next ? `<p>Grimoire terminé : ${state.xp} XP, niveau ${playerLevel()}, ${state.loot.filter((l) => l.kind === "badge").length} badges et ${state.loot.filter((l) => l.kind === "item").length} objets.</p>` : ""}
      <div class="btns"><button class="btn btn-cast" id="understandBtn">Comprendre pourquoi</button>
      <button class="btn btn-ghost" id="nextBtn">${next ? (next.chapter !== L.chapter ? "Chapitre suivant" : "Mission suivante") : "Lire l'épilogue"}</button></div>
    </div>`;
  $("overlay").hidden = false;
  setTimeout(() => { FX.play(levelUp || chapterEnd ? "levelup" : "win"); burst(document.querySelector("#overlay .card"), chapterEnd ? 28 : 18); }, 250);
  $("understandBtn").focus();
  $("understandBtn").onclick = () => { $("overlay").hidden = true; $("whyBtn").hidden = false; showWhy(L); };
  $("nextBtn").onclick = () => {
    $("overlay").hidden = true;
    if (next) { daily.active = false; state.current = next.id; save(); renderMap(); renderLevel(); window.scrollTo({ top: 0 }); }
    else { $("out").innerHTML = `<div class="msg ok"><b>ÉPILOGUE</b>Le trésor est rentré au Bastion, Gédéon est pardonné et le Conseil grave ton nom au fronton des Archives. Toi qui t'es réveillé·e sans souvenir au Chaudron Fêlé, tu sais maintenant interroger, relier, résumer, modifier, enquêter, bâtir des tables et classer n'importe quelle base de données.</div>
      <div class="hint"><span class="label">Ton grimoire complet</span><br>
      <code>SELECT</code> · <code>FROM</code> · <code>WHERE</code> · <code>AND</code> · <code>ORDER BY</code> · <code>LIMIT</code> · <code>DISTINCT</code> · <code>LIKE</code> · <code>CASE</code><br>
      <code>COUNT</code> · <code>SUM</code> · <code>AVG</code> · <code>GROUP BY</code> · <code>HAVING</code> · <code>AS</code><br>
      <code>JOIN</code> · <code>LEFT JOIN</code> · <code>IS NULL</code> · sous-requêtes · <code>IN</code><br>
      <code>INSERT</code> · <code>UPDATE</code> · <code>DELETE</code><br>
      <code>OR</code> · <code>( )</code> · <code>BETWEEN</code> · <code>MIN</code> · <code>MAX</code><br>
      <code>CREATE TABLE</code> · <code>ALTER TABLE</code> · <code>DROP TABLE</code><br>
      <code>COALESCE</code> · <code>UPPER</code> · <code>LENGTH</code> · <code>WITH</code> · <code>RANK() OVER</code> · <code>PARTITION BY</code></div>
      <div class="msg info">Le grimoire reste ouvert : rejoue n'importe quelle mission depuis la carte, ou utilise « Explorer » comme bac à sable pour inventer tes propres requêtes.</div>`; }
  };
}

function knockOut() {
  setTimeout(() => FX.play("ko"), 300);
  const L = curL();
  $("overlay").innerHTML = `<div class="card ko" role="dialog" aria-modal="true" aria-labelledby="kt">
      <h3 id="kt">K.O.</h3>
      <p>Cinq sorts ratés, c'est trop. Le tavernier te ramasse et te soigne. Tu repars avec tous tes PV et un parchemin offert.</p>
      <button class="btn btn-cast" id="reviveBtn">Reprendre « ${esc(L.title)} »</button></div>`;
  $("overlay").hidden = false;
  $("reviveBtn").focus();
  $("reviveBtn").onclick = () => { state.hp = MAX_HP; state.scrolls += 1; save(); $("overlay").hidden = true; renderHUD(); renderLevel(); };
}

function showIntro() {
  $("overlay").innerHTML = `<div class="card" role="dialog" aria-modal="true" aria-label="Le Grimoire des Requêtes">
      <img class="logo" src="assets/logo-480.webp" alt="Le Grimoire des Requêtes, l'aventure SQL">
      <p>Chaque requête SQL est un sort. Sous l'éditeur, un traducteur te dit en français ce que veut dire chaque mot que tu tapes. Réussis-les pour gagner de l'XP, des objets et des badges. Une formule mal écrite te coûte un point de vie ; un parchemin te souffle un indice.</p>
      <button class="btn btn-cast" id="startBtn">Ouvrir le grimoire</button>
      <p><a href="premiers-pas.html" target="_blank" rel="noopener" style="color:var(--arcane)">Jamais fait de SQL ? Commence par les Premiers pas</a> : 33 petites leçons, avec des blocs à cliquer.</p></div>`;
  $("overlay").hidden = false;
  $("startBtn").focus();
  $("startBtn").onclick = () => { FX.play("cast"); state.seenIntro = true; save(); $("overlay").hidden = true; $("sql").focus(); };
}

function readScroll() {
  const L = curL();
  if (L.daily || L.blitz) return;
  const used = state.hintsUsed[L.id] || 0;
  if (state.completed.includes(L.id) && attempt.hints < used) {      // mission rejouée : relire un parchemin déjà lu est gratuit (mais coûte les étoiles)
    attempt.hints += 1; FX.play("scroll");
    $("out").insertAdjacentHTML("afterbegin", `<div class="hint"><span class="label">Parchemin ${attempt.hints} sur ${L.hints.length} (déjà lu)</span><br>${L.hints[attempt.hints - 1]}</div>`); return;
  }
  if (used >= L.hints.length) { $("out").insertAdjacentHTML("afterbegin", `<div class="msg info">Tu as déjà lu tous les parchemins de cette mission.</div>`); return; }
  if (state.scrolls <= 0) return;
  state.scrolls -= 1; state.hintsUsed[L.id] = used + 1; attempt.hints = Math.max(attempt.hints, used) + 1; save(); renderHUD(); FX.play("scroll");
  $("out").insertAdjacentHTML("afterbegin", `<div class="hint"><span class="label">Parchemin ${used + 1} sur ${L.hints.length}</span><br>${L.hints[used]}</div>`);
}

function insertAtCursor(txt) {
  const ta = $("sql"), s = ta.selectionStart, e = ta.selectionEnd, v = ta.value;
  const pre = s > 0 && !/\s$/.test(v.slice(0, s)) ? " " : "";
  ta.value = v.slice(0, s) + pre + txt + " " + v.slice(e);
  ta.selectionStart = ta.selectionEnd = s + pre.length + txt.length + 1;
  // Sur tablette, ne pas ouvrir le clavier à chaque mot inséré (sauf s'il est déjà ouvert) : on fait juste briller l'éditeur.
  const touch = window.matchMedia && matchMedia("(pointer: coarse)").matches;
  if (!touch || document.activeElement === ta) ta.focus();
  else { ta.classList.remove("flash"); void ta.offsetWidth; ta.classList.add("flash"); }
}

/* =====================================================================
   MOTIVATION : étoiles, série de jours, défi du jour, quêtes, album
   ===================================================================== */
const dayKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const dayNum = (k) => { const [y, m, d] = k.split("-").map(Number); return Math.round(Date.UTC(y, m - 1, d) / 86400000); };
const weekKey = (d = new Date()) => {      // semaine ISO, du lundi au dimanche : « 2026-S43 »
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())); const wd = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - wd); const y0 = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  return `${t.getUTCFullYear()}-S${String(Math.ceil(((t - y0) / 86400000 + 1) / 7)).padStart(2, "0")}`;
};
const starsTxt = (n) => "★".repeat(n) + "☆".repeat(3 - n);
const levelStars = (id) => (state.stars || {})[id] || 0;
const totalStars = () => Object.values(state.stars || {}).reduce((a, b) => a + b, 0);

/* ---------- 1. ÉTOILES : 1 si réussi, 2 sans parchemin, 3 sans parchemin et du premier coup ---------- */
let attempt = { key: null, fails: 0, hints: 0 };
function startAttempt(key) { if (attempt.key !== key) attempt = { key, fails: 0, hints: 0 }; }
const attemptStars = () => (attempt.hints > 0 ? 1 : attempt.fails > 0 ? 2 : 3);

/* ---------- 2. SÉRIE DE JOURS 🔥 : un jour compte dès qu'on réussit une mission ou le défi ---------- */
function streakNow() {      // la série encore vivante aujourd'hui (sinon 0)
  const s = state.streak; if (!s || !s.last) return 0;
  const gap = dayNum(dayKey()) - dayNum(s.last);
  if (gap <= 1) return s.n;
  if (gap === 2 && s.jokerWeek !== weekKey()) return s.n;     // le joker de la semaine peut encore la sauver
  return 0;
}
function markActiveDay() {
  const today = dayKey(), s = state.streak || (state.streak = { n: 0, last: null, best: 0, jokerWeek: null });
  if (s.last === today) return null;
  const gap = s.last ? dayNum(today) - dayNum(s.last) : 99, out = {};
  if (gap === 1) s.n += 1;
  else if (gap === 2 && s.jokerWeek !== weekKey()) { s.n += 1; s.jokerWeek = weekKey(); out.joker = true; }
  else s.n = 1;
  s.last = today; s.best = Math.max(s.best || 0, s.n); out.n = s.n;
  if (s.n % 7 === 0) {      // récompense tous les 7 jours
    state.xp += 100; state.scrolls += 2;
    const badge = `Flamme de ${s.n} jours`; if (!state.loot.some((l) => l.name === badge)) state.loot.push({ kind: "badge", name: badge });
    out.reward = `+100 XP · +2 📜 · badge « ${badge} »`;
  }
  return out;
}

/* ---------- 3. DÉFI DU JOUR 🎯 : le même pour tout le monde, il change à minuit ---------- */
const DAILY_BANK = [
  { t: "Les plus robustes", m: "Affiche le <code>nom</code> et les <code>pv</code> des monstres qui ont <b>plus de 100 PV</b>.", q: "SELECT nom, pv FROM monstres WHERE pv > 100", c: ["WHERE", ">"] },
  { t: "Le Cercle des Mages", m: "Affiche le <code>nom</code> des héros de classe <b>'Mage'</b>.", q: "SELECT nom FROM heros WHERE classe = 'Mage'", c: ["WHERE", "texte"] },
  { t: "Qui porte quoi ?", m: "Affiche le <code>nom</code> du héros et l'<code>objet</code> pour chaque objet de l'inventaire, en reliant <code>inventaire.num_heros</code> à <code>heros.id</code>.", q: "SELECT heros.nom, inventaire.objet FROM inventaire JOIN heros ON inventaire.num_heros = heros.id", c: ["JOIN"] },
  { t: "Le trésor le plus lourd", m: "Affiche le <code>nom</code> et le <code>tresor</code> des châteaux, <b>du plus riche au plus pauvre</b>.", q: "SELECT nom, tresor FROM chateaux ORDER BY tresor DESC", o: true, c: ["ORDER BY", "DESC"] },
  { t: "Le Compte des Sorts", m: "Combien y a-t-il de sorts dans la table <code>sorts</code> ?", q: "SELECT COUNT(*) FROM sorts", c: ["COUNT(*)"] },
  { t: "Le Héros sans Magie", m: "Affiche le <code>nom</code> des héros qui ne connaissent <b>aucun sort</b>.", q: "SELECT heros.nom FROM heros LEFT JOIN sorts ON sorts.num_heros = heros.id WHERE sorts.id IS NULL", c: ["LEFT JOIN", "IS NULL"] },
  { t: "Les Écoles de Magie", m: "Affiche chaque <code>ecole</code> de magie avec le <b>nombre de sorts</b> qu'elle compte.", q: "SELECT ecole, COUNT(*) FROM sorts GROUP BY ecole", c: ["GROUP BY", "COUNT(*)"] },
  { t: "Le Butin Légendaire", m: "Affiche l'<code>objet</code> et la <code>valeur</code> des objets de rareté <b>'Légendaire'</b>.", q: "SELECT objet, valeur FROM inventaire WHERE rarete = 'Légendaire'", c: ["WHERE", "texte"] },
  { t: "Danger dans la Forêt", m: "Affiche le <code>nom</code> et le <code>danger</code> des monstres de la <b>'Forêt Sombre'</b> dont le danger vaut <b>au moins 4</b>.", q: "SELECT nom, danger FROM monstres WHERE region = 'Forêt Sombre' AND danger >= 4", c: ["WHERE", "AND"] },
  { t: "Le Podium des Sorts", m: "Affiche le <code>nom</code> et la <code>puissance</code> des <b>3 sorts les plus puissants</b>, du plus fort au plus faible.", q: "SELECT nom, puissance FROM sorts ORDER BY puissance DESC LIMIT 3", o: true, c: ["ORDER BY", "LIMIT"] },
  { t: "La Fortune du Royaume", m: "Quelle est la <b>somme</b> de la <code>fortune</code> de tous les héros ?", q: "SELECT SUM(fortune) FROM heros", c: ["SUM()"] },
  { t: "La Moyenne des Monstres", m: "Quelle est la <b>moyenne</b> des <code>pv</code> des monstres ?", q: "SELECT AVG(pv) FROM monstres", c: ["AVG()"] },
  { t: "Les Régions Peuplées", m: "Affiche chaque <code>region</code> et son nombre de monstres, <b>seulement</b> pour les régions qui en ont <b>au moins 2</b>.", q: "SELECT region, COUNT(*) FROM monstres GROUP BY region HAVING COUNT(*) >= 2", c: ["GROUP BY", "HAVING"] },
  { t: "Le Château de Chacun", m: "Affiche le <code>nom</code> de chaque héros et le <code>nom</code> de son château.", q: "SELECT heros.nom, chateaux.nom FROM heros JOIN chateaux ON heros.num_chateau = chateaux.id", c: ["JOIN"] },
  { t: "L'Énigme de la Lettre L", m: "Affiche le <code>nom</code> des monstres dont le nom <b>commence par 'L'</b>.", q: "SELECT nom FROM monstres WHERE nom LIKE 'L%'", c: ["LIKE", "%"] },
  { t: "Les Vocations", m: "Affiche la liste des <code>classe</code> des héros, <b>sans doublons</b>.", q: "SELECT DISTINCT classe FROM heros", c: ["DISTINCT"] },
  { t: "Les Sorts Économes", m: "Affiche le <code>nom</code> et le <code>mana</code> des sorts qui coûtent <b>moins de 30</b> mana, <b>du moins cher au plus cher</b>.", q: "SELECT nom, mana FROM sorts WHERE mana < 30 ORDER BY mana", o: true, c: ["WHERE", "ORDER BY"] },
  { t: "Les Riches du Bastion", m: "Affiche le <code>nom</code> des héros du château <b>1</b> dont la <code>fortune</code> vaut <b>au moins 300</b>.", q: "SELECT nom FROM heros WHERE num_chateau = 1 AND fortune >= 300", c: ["WHERE", "AND"] },
  { t: "L'Or des Châteaux", m: "Pour chaque château, affiche son <code>nom</code> et la <b>somme de la fortune</b> de ses héros.", q: "SELECT chateaux.nom, SUM(heros.fortune) FROM chateaux JOIN heros ON heros.num_chateau = chateaux.id GROUP BY chateaux.nom", c: ["JOIN", "SUM()", "GROUP BY"] },
  { t: "Fort ou Faible ?", m: "Affiche le <code>nom</code> de chaque monstre et l'étiquette <b>'Fort'</b> s'il a au moins 100 PV, sinon <b>'Faible'</b>.", q: "SELECT nom, CASE WHEN pv >= 100 THEN 'Fort' ELSE 'Faible' END FROM monstres", c: ["CASE"] },
  { t: "Le Plus Pauvre", m: "Affiche le <code>nom</code> du héros qui a la <b>plus petite fortune</b>.", q: "SELECT nom FROM heros WHERE fortune = (SELECT MIN(fortune) FROM heros)", c: ["MIN()", "sous-requête"] },
  { t: "Ni Trop Forts, Ni Trop Faibles", m: "Affiche le <code>nom</code> des héros dont le <code>niveau</code> est <b>entre 8 et 12</b>.", q: "SELECT nom FROM heros WHERE niveau BETWEEN 8 AND 12", c: ["BETWEEN"] },
  { t: "Feu ou Glace", m: "Affiche le <code>nom</code> des sorts d'école <b>'Feu'</b> ou <b>'Glace'</b>.", q: "SELECT nom FROM sorts WHERE ecole = 'Feu' OR ecole = 'Glace'", c: ["OR"] },
  { t: "Le Sac des Mages", m: "Affiche l'<code>objet</code> des objets dont le propriétaire est un héros de classe <b>'Mage'</b>.", q: "SELECT objet FROM inventaire WHERE num_heros IN (SELECT id FROM heros WHERE classe = 'Mage')", c: ["IN", "sous-requête"] },
  { t: "Les Sorts de Lyra", m: "Affiche le <code>nom</code> des sorts de <b>'Lyra Murmure-Vent'</b>.", q: "SELECT sorts.nom FROM sorts JOIN heros ON sorts.num_heros = heros.id WHERE heros.nom = 'Lyra Murmure-Vent'", c: ["JOIN", "WHERE"] },
  { t: "Les Enseignes Gravées", m: "Affiche le <code>nom</code> de chaque château <b>en majuscules</b>.", q: "SELECT UPPER(nom) FROM chateaux", c: ["UPPER()"] },
  { t: "Le Classement des Monstres", m: "Affiche le <code>nom</code>, les <code>pv</code> et le <b>rang</b> de chaque monstre (1 = le plus de PV), avec <code>RANK() OVER</code>.", q: "SELECT nom, pv, RANK() OVER (ORDER BY pv DESC) FROM monstres", c: ["RANK() OVER"] },
  { t: "Le Butin des Terribles", m: "Affiche le <code>nom</code> et le <code>butin</code> des monstres de danger <b>au moins 7</b>, du plus dangereux au moins dangereux.", q: "SELECT nom, butin FROM monstres WHERE danger >= 7 ORDER BY danger DESC", o: true, c: ["WHERE", "ORDER BY"] },
  { t: "L'Inventaire par Rareté", m: "Affiche chaque <code>rarete</code> avec le <b>nombre d'objets</b> de cette rareté.", q: "SELECT rarete, COUNT(*) FROM inventaire GROUP BY rarete", c: ["GROUP BY"] },
  { t: "Les Grands Sortilèges", m: "Affiche le <code>nom</code> du héros et le <code>nom</code> du sort, pour les sorts de <code>puissance</code> <b>au moins 80</b>.", q: "SELECT heros.nom, sorts.nom FROM sorts JOIN heros ON sorts.num_heros = heros.id WHERE sorts.puissance >= 80", c: ["JOIN", "WHERE"] }
];
const DAILY_XP = 100, DAILY_FIRST_TRY = 50;
function todayDaily() {
  const k = dayKey(), n = dayNum(k), D = DAILY_BANK[((n * 7) % DAILY_BANK.length + DAILY_BANK.length) % DAILY_BANK.length];
  return { daily: true, id: "defi", kwId: 39, date: k, chapter: `🎯 Défi du jour · ${k.split("-").reverse().join("/")}`, title: D.t,
    pitch: `Le crieur du Bastion annonce l'épreuve du jour. Tous les aventuriers du royaume ont <em>le même défi</em> aujourd'hui : il change à minuit. Réussis-le en un minimum d'essais pour grimper dans le <em>classement du jour</em>. Ici, pas de parchemin : seul ton savoir compte !`,
    mission: D.m, concept: D.c, starter: "", expected: D.q + ";", ordered: !!D.o, hints: [], xp: DAILY_XP, item: null, badge: null };
}
const daily = { active: false, L: null, started: 0 };
const curL = () => (blitz.active ? blitz.L : daily.active ? daily.L : LEVELS[state.current]);
function stopModes() { daily.active = false; if (blitz.active) { blitz.active = false; clearInterval(blitz.timer); } }
function dailyDone() { return state.daily && state.daily.date === dayKey() && state.daily.done ? state.daily : null; }
function renderDailyBar() {
  if (blitz.active) {
    $("dailyBar").className = "dailybar blitzbar";
    $("dailyBar").innerHTML = `<span class="dI" aria-hidden="true">⚡</span><div><b>Défi éclair · <span id="blitzScore">${blitz.score}</span> juste${blitz.score > 1 ? "s" : ""}</b><span>Question ${blitz.i + 1} · record ${(state.blitz && state.blitz.best) || 0} · aucun PV en jeu</span><div class="btime"><i id="blitzBar"></i></div></div>
      <span class="bclock" id="blitzTime">3:00</span><button class="dbtn alt" id="blitzSkip">Passer ›</button><button class="dbtn alt" id="blitzQuit">Arrêter</button>`;
    $("blitzSkip").onclick = blitzSkip; $("blitzQuit").onclick = () => endBlitz(true); tickBlitz(); return;
  }
  $("dailyBar").className = "dailybar";
  const D = todayDaily(), done = dailyDone();
  $("dailyBar").innerHTML = daily.active
    ? `<span class="dI" aria-hidden="true">🎯</span><div><b>Tu relèves le défi du jour</b><span>${esc(D.title)} · ${attempt.fails} essai(s) raté(s)</span></div><button class="dbtn alt" id="dailyLeave">← Revenir à ma mission</button>`
    : `<span class="dI" aria-hidden="true">🎯</span><div><b>Défi du jour : ${esc(D.title)}</b><span>${done ? `✅ Réussi ${done.tries === 0 ? "du premier coup" : `après ${done.tries} essai(s) raté(s)`} · reviens demain pour un nouveau défi` : `+${DAILY_XP} XP, +${DAILY_FIRST_TRY} XP si tu le réussis du premier coup · le même pour tous les joueurs`}</span></div>
       ${done ? `<button class="dbtn alt" id="dailyRank">🏆 Classement du jour</button><button class="dbtn alt" id="dailyGo">Rejouer</button>` : `<button class="dbtn" id="dailyGo">Relever le défi</button>`}
       ${daily.active ? "" : `<button class="dbtn alt blitzbtn" id="blitzGo" title="Facultatif : combien de requêtes justes en 3 minutes ?">⚡ Défi éclair${state.blitz && state.blitz.best ? ` · record ${state.blitz.best}` : ""}</button>`}`;
  $("dailyBar").classList.toggle("done", !!done && !daily.active);
  const go = $("dailyGo"), lv = $("dailyLeave"), rk = $("dailyRank");
  if (go) go.onclick = () => { FX.play("cast"); stopModes(); daily.active = true; daily.L = todayDaily(); daily.started = Date.now(); renderLevel(); window.scrollTo({ top: 0, behavior: "smooth" }); };
  if (lv) lv.onclick = () => { FX.play("page"); daily.active = false; renderLevel(); };
  if (rk) rk.onclick = () => openDailyRanking();
  if ($("blitzGo")) $("blitzGo").onclick = () => { FX.play("page"); openBlitzIntro(); };
}
function dailyWin(L) {
  const prev = dailyDone(), secs = Math.max(1, Math.round((Date.now() - daily.started) / 1000)), tries = attempt.fails;
  let gained = 0;
  if (!prev) {
    gained = DAILY_XP + (tries === 0 ? DAILY_FIRST_TRY : 0); state.xp += gained;
    state.daily = { date: L.date, done: true, tries, secs };
    state.dailyCount = (state.dailyCount || 0) + 1;
  } else if (tries < prev.tries || (tries === prev.tries && secs < prev.secs)) state.daily = { date: L.date, done: true, tries, secs };   // meilleur score de la journée
  let extra = afterSuccess({ daily: true, firstTry: tries === 0 });
  const gear = syncEquipment(); if (gear.length) extra += `<div class="xtra card">🎒 Nouvel équipement : ${gear.map((g) => `${g.ico} ${esc(g.name)}`).join(", ")}</div>`;
  extra += nextStepsHTML();
  save(); pushDaily(); renderHUD(); renderLoot();
  $("overlay").innerHTML = `<div class="card" role="dialog" aria-modal="true" aria-labelledby="vt">
      <h3 id="vt">🎯 Défi du jour réussi !</h3>
      <p>« ${esc(L.title)} » ${tries === 0 ? "du premier coup" : `après ${tries} essai(s) raté(s)`}, en ${secs < 60 ? `${secs} s` : `${Math.floor(secs / 60)} min ${secs % 60} s`}.</p>
      ${gained ? `<div class="rewards"><span class="x">+${gained} XP</span>${tries === 0 ? `<span class="b">Du premier coup !</span>` : ""}</div>` : `<p>Défi déjà réussi aujourd'hui : pas de nouvel XP, mais ton meilleur score du jour est gardé.</p>`}
      ${extra}
      <div class="btns"><button class="btn btn-cast" id="dRankBtn">🏆 Classement du jour</button><button class="btn btn-ghost" id="dBackBtn">Revenir à ma mission</button></div></div>`;
  $("overlay").hidden = false;
  setTimeout(() => { FX.play("levelup"); burst(document.querySelector("#overlay .card"), 24); }, 250);
  $("dRankBtn").onclick = () => { $("overlay").hidden = true; daily.active = false; renderLevel(); openDailyRanking(); };
  $("dBackBtn").onclick = () => { $("overlay").hidden = true; daily.active = false; renderLevel(); };
  $("dBackBtn").focus();
}
function pushDaily() {
  if (!CLASSEMENT_URL || !Players.current || !dailyDone()) return;
  const d = dailyDone(), body = Object.assign(scoreOf(Players.current, state), { type: "defi", defi: d.date, essais: d.tries, secondes: d.secs });
  try { fetch(CLASSEMENT_URL, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(body) }).catch(() => {}); } catch (e) {}
}
async function openDailyRanking() {
  const k = dayKey(), byId = new Map();
  Players.list.forEach((n) => { const g = Players.read(SAVE_KEY, n); if (g && g.daily && g.daily.date === k && g.daily.done) byId.set(Players.idOf(n), { id: Players.idOf(n), nom: n, essais: g.daily.tries, secondes: g.daily.secs }); });
  let online = null, oldScript = false;
  if (CLASSEMENT_URL) {
    try {
      const ctrl = window.AbortController ? new AbortController() : null; const t = setTimeout(() => ctrl && ctrl.abort(), 6000);
      const r = await fetch(CLASSEMENT_URL + (CLASSEMENT_URL.includes("?") ? "&" : "?") + "defi=" + k, { signal: ctrl ? ctrl.signal : undefined }); clearTimeout(t);
      const rows = await r.json();
      if (Array.isArray(rows)) { if (rows.length && rows[0].essais === undefined) oldScript = true; else online = rows; }
    } catch (e) {}
  }
  (online || []).forEach((o) => { if (!o || !o.id) return; const m = byId.get(o.id); if (!m || +o.essais < m.essais || (+o.essais === m.essais && +o.secondes < m.secondes)) byId.set(o.id, { id: o.id, nom: String(o.nom).slice(0, 20), essais: +o.essais || 0, secondes: +o.secondes || 0 }); });
  const db = new SQL.Database(); let res = { values: [] };
  try {
    db.run("CREATE TABLE defi_du_jour (id TEXT, nom TEXT, essais INTEGER, secondes INTEGER)");
    const ins = db.prepare("INSERT INTO defi_du_jour VALUES (?, ?, ?, ?)"); byId.forEach((j) => ins.run([j.id, j.nom, j.essais, j.secondes])); ins.free();
    const r = db.exec("SELECT RANK() OVER (ORDER BY essais, secondes) AS rang, nom, essais, secondes, id FROM defi_du_jour ORDER BY rang, nom")[0]; if (r) res = r;
  } finally { db.close(); }
  const myId = Players.current ? Players.idOf(Players.current) : null, medal = (r) => ({ 1: "🥇", 2: "🥈", 3: "🥉" }[r] || r);
  const old = document.getElementById("playerGate"); if (old) old.remove();
  const g = document.createElement("div"); g.id = "playerGate"; g.className = "pgate";
  g.innerHTML = `<div class="pcard rankcard" role="dialog" aria-modal="true" aria-labelledby="dkTitle">
    <h2 id="dkTitle">🎯 Classement du jour</h2>
    <p>Défi « ${esc(todayDaily().title)} ». Le moins d'essais ratés passe devant ; à égalité, le plus rapide.</p>
    ${res.values.length ? `<div class="tablewrap"><table class="res rank"><thead><tr><th>Rang</th><th>Joueur</th><th>Essais ratés</th><th>Temps</th></tr></thead>
      <tbody>${res.values.map(([rang, nom, essais, secs, id]) => `<tr class="${id === myId ? "me" : ""}"><td class="rk">${medal(rang)}</td><td><b>${esc(nom)}</b>${id === myId ? ' <span class="you">toi</span>' : ""}</td><td>${essais === 0 ? "0 ⭐" : essais}</td><td>${secs < 60 ? secs + " s" : Math.floor(secs / 60) + " min " + (secs % 60) + " s"}</td></tr>`).join("")}</tbody></table></div>`
      : `<p>Personne n'a encore réussi le défi aujourd'hui. Sois le premier !</p>`}
    <p class="pnote">${online ? "🌍 Classement en ligne : les joueurs de tous les appareils." : oldScript ? "⚠️ Le script Google est l'ancienne version : remplace-le par le nouveau classement/Code.gs (voir le README). En attendant, seuls les joueurs de cet appareil apparaissent." : "Seuls les joueurs de cet appareil apparaissent."}</p>
    <button class="pclose" id="dkClose">Fermer</button></div>`;
  document.body.appendChild(g);
  const close = () => g.remove(); $("dkClose").onclick = close; g.addEventListener("click", (e) => { if (e.target === g) close(); }); setTimeout(() => $("dkClose").focus(), 50);
}

/* ---------- 4. QUÊTES DE LA SEMAINE : 3 petits objectifs, renouvelés chaque lundi ---------- */
const TRAIN_KEY = "grimoire-entrainement-v1";
const canReadTraining = () => !/claude/i.test(location.hostname);     // sur claude.ai, Premiers pas est une page à part
const trainingSessions = () => { const t = Players.current ? Players.read(TRAIN_KEY, Players.current) : null; return (t && t.sessions) || 0; };
const hasLevel = (re) => LEVELS.some((L) => re.test(L.expected) && (state.completed.includes(L.id) || L.id <= Math.max(0, ...state.completed.map((x) => x + 1))));
const QUEST_POOL = [
  { k: "any", goal: 5, txt: "Réussis 5 missions (les anciennes comptent aussi)", ok: () => true },
  { k: "noscroll", goal: 2, txt: "Réussis 2 missions sans lire de parchemin", ok: () => true },
  { k: "first", goal: 2, txt: "Réussis 2 missions du premier coup", ok: () => true },
  { k: "stars", goal: 2, txt: "Obtiens ⭐⭐⭐ sur 2 missions", ok: () => true },
  { k: "daily", goal: 3, txt: "Réussis 3 défis du jour", ok: () => true },
  { k: "join", goal: 3, txt: "Réussis 3 missions qui utilisent JOIN", ok: () => hasLevel(/\bJOIN\b/i) },
  { k: "group", goal: 2, txt: "Réussis 2 missions avec GROUP BY", ok: () => hasLevel(/\bGROUP BY\b/i) },
  { k: "where", goal: 3, txt: "Réussis 3 missions avec WHERE", ok: () => hasLevel(/\bWHERE\b/i) },
  { k: "write", goal: 2, txt: "Réussis 2 missions qui modifient le royaume (INSERT, UPDATE, DELETE…)", ok: () => LEVELS.some((L) => L.mode === "write" && L.id <= Math.max(0, ...state.completed.map((x) => x + 1))) },
  { k: "train", goal: 2, txt: "Fais 2 entraînements du jour dans Premiers pas", ok: () => canReadTraining() }
];
const QUEST_XP = 75, QUEST_BONUS_XP = 150;
function ensureQuests() {
  const wk = weekKey();
  if (state.quests && state.quests.week === wk) return state.quests;
  let seed = [...wk].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
  const pool = QUEST_POOL.filter((q) => q.ok()), pick = [];
  while (pick.length < 3 && pool.length) { seed = (seed * 1103515245 + 12345) >>> 0; pick.push(pool.splice(seed % pool.length, 1)[0]); }
  state.quests = { week: wk, list: pick.map((q) => ({ k: q.k, goal: q.goal, txt: q.txt, n: 0, done: false })), trainBase: trainingSessions(), bonus: false };
  save(); return state.quests;
}
function questProgress(ev) {     // ev : { L, stars, hints, fails, daily }
  const Q = ensureQuests(), news = [];
  Q.list.forEach((q) => {
    if (q.done) return;
    const L = ev.L, e = (L && L.expected) || "";
    const hit = { any: !ev.daily, noscroll: !ev.daily && ev.hints === 0, first: !ev.daily && ev.fails === 0 && ev.hints === 0, stars: !ev.daily && ev.stars === 3,
      daily: ev.daily, join: !ev.daily && /\bJOIN\b/i.test(e), group: !ev.daily && /\bGROUP BY\b/i.test(e), where: !ev.daily && /\bWHERE\b/i.test(e),
      write: !ev.daily && L && L.mode === "write", train: false }[q.k];
    if (hit) q.n = Math.min(q.goal, q.n + 1);
    if (q.k === "train") q.n = Math.min(q.goal, Math.max(0, trainingSessions() - (Q.trainBase || 0)));
    if (q.n >= q.goal && !q.done) { q.done = true; state.xp += QUEST_XP; state.scrolls += 1; news.push(`Quête accomplie : ${q.txt} · +${QUEST_XP} XP · +1 📜`); }
  });
  if (!Q.bonus && Q.list.length && Q.list.every((q) => q.done)) {
    Q.bonus = true; state.xp += QUEST_BONUS_XP;
    const badge = `Héros de la semaine ${Q.week}`; state.loot.push({ kind: "badge", name: badge });
    news.push(`Les 3 quêtes de la semaine ! +${QUEST_BONUS_XP} XP · badge « ${badge} »`);
  }
  return news;
}
function renderQuests() {
  const Q = ensureQuests();
  if (Q.list.some((q) => q.k === "train")) Q.list.forEach((q) => { if (q.k === "train" && !q.done) q.n = Math.min(q.goal, Math.max(0, trainingSessions() - (Q.trainBase || 0))); });
  const done = Q.list.filter((q) => q.done).length;
  $("questInfo").textContent = `${done}/${Q.list.length}`; $("railQuest").textContent = `${done}/${Q.list.length}`;
  const left = 7 - ((new Date().getDay() + 6) % 7);
  $("quests").innerHTML = Q.list.map((q) => `<div class="quest ${q.done ? "done" : ""}"><span class="qi" aria-hidden="true">${q.done ? "✅" : "📋"}</span><div><b>${esc(q.txt)}</b>
      <div class="qbar" role="progressbar" aria-valuemin="0" aria-valuemax="${q.goal}" aria-valuenow="${q.n}"><i style="width:${(q.n / q.goal) * 100}%"></i></div><span>${q.n} / ${q.goal} · +${QUEST_XP} XP</span></div></div>`).join("")
    + `<p class="qnote">${Q.bonus ? "🏅 Toutes les quêtes sont faites : bravo !" : `Les 3 quêtes : +${QUEST_BONUS_XP} XP et un badge.`} Nouvelles quêtes ${left <= 1 ? "demain" : `dans ${left} jours`} (lundi).</p>`;
}

/* ---------- 5. ALBUM : 18 cartes à débloquer en réussissant des missions ---------- */
const ALBUM = [
  ...[[1, 0], [3, 1], [6, 5], [2, 10], [5, 11], [4, 3]].map(([id, lv]) => ({ k: "h" + id, kind: "heros", id, lv })),
  ...[[1, 2], [4, 2], [9, 2], [5, 4], [3, 6], [7, 6], [6, 14], [2, 21], [8, 22]].map(([id, lv]) => ({ k: "m" + id, kind: "monstres", id, lv })),
  ...[[1, 7], [2, 9], [3, 24]].map(([id, lv]) => ({ k: "c" + id, kind: "chateaux", id, lv }))
];
const cardOwned = (c) => state.completed.includes(c.lv);
const albumCount = () => ALBUM.filter(cardOwned).length;
function cardInfo(c) {
  const db = new SQL.Database();
  try { db.run(SCHEMA_SQL); const r = db.exec(`SELECT * FROM ${c.kind} WHERE id = ${c.id}`)[0]; return r ? r.values[0] : null; } finally { db.close(); }
}
const cardImg = (c) => (c.kind === "heros" ? HERO_ART : c.kind === "monstres" ? MONSTER_ART : CASTLE_ART)[c.id];
function cardHTML(c, owned, isNew) {
  const r = cardInfo(c) || [], lvl = LEVELS[c.lv];
  const line = c.kind === "heros" ? `${r[2]} · niveau ${r[3]} · ${r[4]} PV` : c.kind === "monstres" ? `${r[2]} · danger ${r[5]} · ${r[4]} PV` : `${r[2]} · ${r[3]}`;
  return owned
    ? `<figure class="acard ${c.kind} ${isNew ? "new" : ""}"><img src="${cardImg(c)}" alt="${esc(r[1])}"><figcaption><b>${esc(r[1])}</b><span>${esc(line)}</span></figcaption>${isNew ? '<span class="anew">NOUVELLE</span>' : ""}</figure>`
    : `<figure class="acard locked"><img src="${cardImg(c)}" alt=""><figcaption><b>???</b><span>Réussis « ${esc(lvl.title)} »</span></figcaption></figure>`;
}
function openAlbum() {
  const old = document.getElementById("playerGate"); if (old) old.remove();
  const sec = (kind, label) => `<h3 class="asec">${label} · ${ALBUM.filter((c) => c.kind === kind && cardOwned(c)).length}/${ALBUM.filter((c) => c.kind === kind).length}</h3><div class="agrid">${ALBUM.filter((c) => c.kind === kind).map((c) => cardHTML(c, cardOwned(c))).join("")}</div>`;
  const g = document.createElement("div"); g.id = "playerGate"; g.className = "pgate";
  g.innerHTML = `<div class="pcard albumcard" role="dialog" aria-modal="true" aria-labelledby="alTitle">
    <h2 id="alTitle">📒 Mon album · ${albumCount()}/${ALBUM.length}</h2>
    <p>Chaque mission réussie peut débloquer une carte. Les cases grises « ??? » disent quelle mission réussir.</p>
    <div class="abar"><i style="width:${(albumCount() / ALBUM.length) * 100}%"></i></div>
    ${sec("heros", "🛡️ Héros")}${sec("monstres", "👹 Monstres")}${sec("chateaux", "🏰 Châteaux")}
    ${albumCount() === ALBUM.length ? `<p class="qnote">🏅 Album complet ! Tu connais tout le royaume.</p>` : ""}
    <button class="pclose" id="alClose">Fermer</button></div>`;
  document.body.appendChild(g);
  const close = () => g.remove(); $("alClose").onclick = close; g.addEventListener("click", (e) => { if (e.target === g) close(); }); setTimeout(() => $("alClose").focus(), 50);
}

/* ---------- Après chaque réussite : série, quêtes, album → bloc à afficher sur la carte de victoire ---------- */
function afterSuccess(ev) {
  const lines = [];
  const s = markActiveDay();
  if (s) lines.push(`<div class="xtra fire">🔥 <b>${s.n} jour${s.n > 1 ? "s" : ""} d'affilée !</b>${s.joker ? " Ton 🃏 joker de la semaine a sauvé ta série." : ""}${s.reward ? `<br>Récompense des ${s.n} jours : ${esc(s.reward)}` : s.n % 7 ? ` <span>Encore ${7 - (s.n % 7)} jour(s) pour la récompense.</span>` : ""}</div>`);
  questProgress(ev).forEach((t) => lines.push(`<div class="xtra quest">📋 ${esc(t)}</div>`));
  if (ev.newCards && ev.newCards.length) lines.push(`<div class="xtra card">📒 <b>Nouvelle${ev.newCards.length > 1 ? "s" : ""} carte${ev.newCards.length > 1 ? "s" : ""} pour ton album !</b><div class="agrid mini">${ev.newCards.map((c) => cardHTML(c, true, true)).join("")}</div></div>`);
  return lines.join("");
}
function renderEngage() {
  const n = streakNow();
  $("streak").textContent = n; $("streakStat").classList.toggle("off", n === 0);
  $("streakStat").title = n ? `Série de ${n} jour(s) d'affilée · record ${(state.streak && state.streak.best) || n} · joker ${state.streak && state.streak.jokerWeek === weekKey() ? "déjà utilisé cette semaine" : "disponible cette semaine"}` : "Réussis une mission aujourd'hui pour lancer ta série de jours";
  $("albumCount").textContent = `${albumCount()}/${ALBUM.length}`;
  renderQuests(); renderDailyBar(); renderNextStep();
}

/* ---------- 6. AVATAR : le héros choisi par le joueur, et son équipement qui évolue avec le niveau ---------- */
const AVATAR_HEROES = { 1: "Paladin", 2: "Guerrier", 3: "Mage", 4: "Voleur", 5: "Druide", 6: "Mage" };
const HERO_NAMES = { 1: "Aria Lamebrume", 2: "Borin Barbe-de-Fer", 3: "Lyra Murmure-Vent", 4: "Kael Pas-Feutré", 5: "Mira Chantelune", 6: "Gédéon le Distrait" };
const WEAPON = { Paladin: ["⚔️", "Épée bénie"], Guerrier: ["🪓", "Hache de guerre"], Mage: ["🪄", "Bâton de cristal"], Voleur: ["🗡️", "Dagues de l'ombre"], Druide: ["🌿", "Bâton de lierre"] };
const ARMOR = { Paladin: "Armure de lumière", Guerrier: "Cotte de mailles", Mage: "Robe étoilée", Voleur: "Armure de cuir souple", Druide: "Armure d'écorce" };
const gearFor = (cls) => [
  { lvl: 3, slot: "Cape", ico: "🧥", name: "Cape de voyageur" },
  { lvl: 6, slot: "Arme", ico: WEAPON[cls][0], name: WEAPON[cls][1] },
  { lvl: 10, slot: "Armure", ico: "🛡️", name: ARMOR[cls] },
  { lvl: 15, slot: "Amulette", ico: "📿", name: "Amulette des requêtes" },
  { lvl: 20, slot: "Couronne", ico: "👑", name: "Couronne du Grimoire" },
  { lvl: 30, slot: "Aura", ico: "✨", name: "Aura du Maître" }
];
const avatarTier = (lv) => (lv >= 30 ? "legend" : lv >= 15 ? "gold" : lv >= 6 ? "silver" : "bronze");
const TIER_FR = { bronze: "cadre de bronze", silver: "cadre d'argent", gold: "cadre d'or", legend: "cadre légendaire" };
const myGear = () => (state.avatar ? gearFor(AVATAR_HEROES[state.avatar]) : []);
function syncEquipment() {        // donne dans la Besace l'équipement mérité par le niveau ; renvoie les nouvelles pièces
  if (!state.avatar) return [];
  const lv = playerLevel(), got = [];
  myGear().forEach((g) => { if (lv >= g.lvl && !state.loot.some((l) => l.kind === "equip" && l.slot === g.slot)) { state.loot.push({ kind: "equip", slot: g.slot, name: `${g.ico} ${g.name}` }); got.push(g); } });
  return got;
}
function avatarImg(size, cls = "") { return state.avatar ? `<img class="ava ${avatarTier(playerLevel())} ${cls}" src="${HERO_ART[state.avatar]}" alt="" style="width:${size}px;height:${size}px">` : ""; }
function avatarHTML() {
  if (!state.avatar) return `<button class="dbtn alt" id="pickAvatar">Choisir mon héros</button>`;
  const lv = playerLevel(), gear = myGear(), tier = avatarTier(lv), next = gear.find((g) => lv < g.lvl);
  return `<div class="avacard ${tier}">
    <div class="avaimg">${avatarImg(96)}</div>
    <div class="avainfo"><b>${esc(Players.current || "")}</b><span>joue ${esc(HERO_NAMES[state.avatar])} · ${esc(AVATAR_HEROES[state.avatar])} · niveau ${lv}</span>
      <span class="tier">${TIER_FR[tier]}</span>
      <div class="slots">${gear.map((g) => `<span class="slot ${lv >= g.lvl ? "on" : ""}" title="${esc(g.slot)} : ${esc(g.name)} (niveau ${g.lvl})">${lv >= g.lvl ? g.ico : "🔒"}</span>`).join("")}</div>
      ${next ? `<span class="nextgear">Prochain équipement : ${next.ico} ${esc(next.name)} au niveau ${next.lvl}</span>` : `<span class="nextgear">Équipement complet !</span>`}
      <button class="plink" id="changeAvatar">Changer de héros</button></div></div>`;
}
function openAvatarPicker(then) {
  const old = document.getElementById("playerGate"); if (old) old.remove();
  const g = document.createElement("div"); g.id = "playerGate"; g.className = "pgate";
  g.innerHTML = `<div class="pcard albumcard" role="dialog" aria-modal="true" aria-labelledby="avTitle">
    <h2 id="avTitle">Choisis ton héros</h2>
    <p>Il t'accompagne dans toute l'aventure. En montant de niveau, il gagne une cape, une arme, une armure… qui arrivent dans ta Besace. Tu pourras en changer plus tard.</p>
    <div class="agrid avagrid">${Object.keys(AVATAR_HEROES).map((id) => `<button class="avapick ${+id === state.avatar ? "sel" : ""}" data-ava="${id}"><img src="${HERO_ART[id]}" alt=""><b>${esc(HERO_NAMES[id])}</b><span>${esc(AVATAR_HEROES[id])}</span></button>`).join("")}</div>
  </div>`;
  document.body.appendChild(g);
  g.querySelectorAll("[data-ava]").forEach((b) => b.onclick = () => {
    const keep = state.loot.filter((l) => l.kind !== "equip");     // nouveau héros : son propre équipement
    state.avatar = +b.dataset.ava; state.loot = keep; syncEquipment(); save(); FX.play("levelup");
    g.remove(); showPlayer(); renderLoot(); renderHUD(); if (then) then();
  });
  setTimeout(() => g.querySelector(".avapick").focus(), 50);
}

/* ---------- 7. DÉFI ÉCLAIR ⚡ (facultatif) : un maximum de requêtes justes en 3 minutes ---------- */
const BLITZ_SECS = 180, BLITZ_XP = 10;
const NEED = [   // à partir de quelle mission chaque mot-clé est connu (calculé depuis les missions elles-mêmes)
  /\bRANK\(\)/i, /\bUPPER\(/i, /\bMIN\(/i, /\bOR\b/i, /\bBETWEEN\b/i, /\bCASE\b/i, /\bLIKE\b/i, /\bDISTINCT\b/i, /\bIN \(/i,
  /\bAVG\(/i, /\bHAVING\b/i, /\bLEFT JOIN\b/i, /\bSUM\(/i, /\bJOIN\b/i, /\bGROUP BY\b/i, /\bCOUNT\(/i, /\bLIMIT\b/i, /\bORDER BY\b/i, /\bWHERE\b/i
].map((re) => ({ re, at: (LEVELS.find((L) => re.test(L.expected)) || { id: 99 }).id }));
const blitzPool = () => {
  const reach = Math.max(0, ...state.completed.map((x) => x + 1));
  return DAILY_BANK.filter((D) => NEED.every((n) => !n.re.test(D.q) || n.at <= reach));
};
const blitz = { active: false, end: 0, score: 0, skips: 0, order: [], i: 0, timer: null, L: null };
function blitzLevel() {
  const D = blitz.order[blitz.i % blitz.order.length];
  return { blitz: true, id: "eclair", kwId: 39, chapter: "⚡ Défi éclair · 3 minutes", title: D.t, pitch: "Le sablier est retourné ! Enchaîne un maximum de requêtes justes. Aucun PV perdu ici, et tu peux passer une question.",
    mission: D.m, concept: D.c, starter: "", expected: D.q + ";", ordered: !!D.o, hints: [], xp: 0, item: null, badge: null };
}
function openBlitzIntro() {
  const old = document.getElementById("playerGate"); if (old) old.remove();
  const pool = blitzPool(), b = state.blitz || { best: 0, plays: 0 };
  const g = document.createElement("div"); g.id = "playerGate"; g.className = "pgate";
  g.innerHTML = `<div class="pcard" role="dialog" aria-modal="true" aria-labelledby="bzTitle">
    <h2 id="bzTitle">⚡ Défi éclair</h2>
    <p><b>Combien de requêtes justes en 3 minutes ?</b> Les questions sont tirées parmi les notions que tu as déjà vues (${pool.length} possibles).</p>
    <p class="pnote">C'est facultatif et sans risque : aucun PV perdu, tu peux passer une question, et chaque bonne réponse rapporte ${BLITZ_XP} XP. Ton record : <b>${b.best}</b>.</p>
    ${pool.length < 3 ? `<p class="perr">Réussis encore quelques missions pour débloquer le défi éclair.</p>` : `<div class="pbtns"><button class="pgo" id="bzGo">C'est parti !</button></div>`}
    <button class="pclose" id="bzClose">Pas maintenant</button></div>`;
  document.body.appendChild(g);
  $("bzClose").onclick = () => g.remove();
  if ($("bzGo")) { $("bzGo").onclick = () => { g.remove(); startBlitz(); }; setTimeout(() => $("bzGo").focus(), 50); }
}
function startBlitz() {
  const pool = blitzPool().slice();
  for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
  Object.assign(blitz, { active: true, end: Date.now() + BLITZ_SECS * 1000, score: 0, skips: 0, order: pool, i: 0 });
  daily.active = false; blitz.L = blitzLevel(); FX.play("cast"); renderLevel(); $("sql").focus();
  clearInterval(blitz.timer); blitz.timer = setInterval(tickBlitz, 250); tickBlitz();
}
function tickBlitz() {
  if (!blitz.active) return;
  const left = Math.max(0, Math.ceil((blitz.end - Date.now()) / 1000));
  const t = $("blitzTime"); if (t) { t.textContent = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, "0")}`; t.classList.toggle("hurry", left <= 20); }
  const bar = $("blitzBar"); if (bar) bar.style.width = (left / BLITZ_SECS * 100) + "%";
  if (left <= 0) endBlitz();
}
function blitzRight() { blitz.score += 1; FX.play("good"); burst($("dailyBar"), 12); blitz.i += 1; blitz.L = blitzLevel(); renderLevel(); $("sql").focus(); }
function blitzSkip() { blitz.skips += 1; FX.play("unclick"); blitz.i += 1; blitz.L = blitzLevel(); renderLevel(); $("sql").focus(); }
function endBlitz(quit) {
  if (!blitz.active) return;
  clearInterval(blitz.timer); blitz.active = false;
  const b = state.blitz || (state.blitz = { best: 0, plays: 0 }), record = blitz.score > b.best;
  b.plays += 1; if (record) b.best = blitz.score;
  const gained = blitz.score * BLITZ_XP; state.xp += gained;
  const gear = syncEquipment(); save(); renderHUD(); renderLoot(); renderLevel();
  $("overlay").innerHTML = `<div class="card" role="dialog" aria-modal="true" aria-labelledby="bzEnd">
    <h3 id="bzEnd">${quit ? "Défi éclair arrêté" : "⏳ Temps écoulé !"}</h3>
    <div class="bigscore">${blitz.score}</div><p>requête${blitz.score > 1 ? "s" : ""} juste${blitz.score > 1 ? "s" : ""} en 3 minutes${blitz.skips ? ` · ${blitz.skips} passée(s)` : ""}</p>
    <div class="rewards">${gained ? `<span class="x">+${gained} XP</span>` : ""}${record && blitz.score ? `<span class="b">Nouveau record !</span>` : `<span class="i">Record : ${b.best}</span>`}</div>
    ${gear.length ? `<div class="xtra card">🎒 Nouvel équipement : ${gear.map((g) => `${g.ico} ${esc(g.name)}`).join(", ")}</div>` : ""}
    <div class="btns"><button class="btn btn-cast" id="bzAgain">Rejouer</button><button class="btn btn-ghost" id="bzBack">Revenir à ma mission</button></div></div>`;
  $("overlay").hidden = false;
  setTimeout(() => { FX.play(record ? "levelup" : "win"); if (record) burst(document.querySelector("#overlay .card"), 24); }, 200);
  $("bzAgain").onclick = () => { $("overlay").hidden = true; startBlitz(); };
  $("bzBack").onclick = () => { $("overlay").hidden = true; renderLevel(); };
  $("bzBack").focus();
}

/* ---------- 8. PROCHAIN PAS 🧭 : toujours un petit objectif visible ---------- */
function nextSteps() {
  const out = [], lv = playerLevel(), toNext = 150 - (state.xp % 150);
  out.push({ ico: "⬆️", txt: `Il te manque ${toNext} XP pour le niveau ${lv + 1} !` });
  const g = myGear().find((x) => lv < x.lvl);
  if (g) out.push({ ico: g.ico, txt: `Encore ${g.lvl - lv} niveau${g.lvl - lv > 1 ? "x" : ""} pour gagner ${g.name}.` });
  if (!state.avatar) out.push({ ico: "🛡️", txt: "Choisis ton héros dans la Besace : il gagnera de l'équipement en montant de niveau." });
  const s = state.streak, today = dayKey();
  if (s && s.last !== today && streakNow() > 0) out.push({ ico: "🔥", txt: `Réussis une mission aujourd'hui pour garder ta série de ${streakNow()} jour${streakNow() > 1 ? "s" : ""}.` });
  else if (s && s.last === today && s.n % 7) out.push({ ico: "🔥", txt: `Encore ${7 - (s.n % 7)} jour${7 - (s.n % 7) > 1 ? "s" : ""} d'affilée pour la récompense de la série.` });
  if (!dailyDone()) out.push({ ico: "🎯", txt: `Le défi du jour t'attend : +${DAILY_XP} XP.` });
  const Q = state.quests && state.quests.week === weekKey() ? state.quests : null;
  if (Q) Q.list.filter((q) => !q.done).sort((a, b) => (b.n / b.goal) - (a.n / a.goal)).slice(0, 1).forEach((q) => out.push({ ico: "📋", txt: `Quête : encore ${q.goal - q.n} pour « ${q.txt} ».` }));
  const missing = ALBUM.filter((c) => !cardOwned(c));
  ["monstres", "heros", "chateaux"].forEach((kind) => {
    const m = missing.filter((c) => c.kind === kind); if (!m.length || m.length > 2) return;
    const word = { monstres: ["monstre", "monstres"], heros: ["héros", "héros"], chateaux: ["château", "châteaux"] }[kind];
    out.push({ ico: "📒", txt: `Encore ${m.length} ${word[m.length > 1 ? 1 : 0]} pour compléter l'album : réussis « ${LEVELS[m[0].lv].title} ».` });
  });
  if (missing.length > 2) out.push({ ico: "📒", txt: `Prochaine carte de l'album : réussis « ${LEVELS[Math.min(...missing.map((c) => c.lv))].title} ».` });
  const low = LEVELS.filter((L) => state.completed.includes(L.id) && levelStars(L.id) < 3);
  if (low.length) out.push({ ico: "⭐", txt: `${low.length} mission${low.length > 1 ? "s" : ""} à rejouer pour les 3 étoiles, par exemple « ${low[0].title} ».` });
  return out;
}
let stepIdx = 0, stepTimer = null;
function renderNextStep() {
  const el = $("nextStep"); if (!el) return;
  const steps = nextSteps(); if (!steps.length) { el.hidden = true; return; }
  el.hidden = false; stepIdx = stepIdx % steps.length; const s = steps[stepIdx];
  el.innerHTML = `<span class="nsI" aria-hidden="true">🧭</span><span class="nsT"><b>Prochain pas</b> ${s.ico} ${esc(s.txt)}</span>${steps.length > 1 ? `<button class="nsB" id="nsMore" title="Objectif suivant" aria-label="Objectif suivant">${stepIdx + 1}/${steps.length} ›</button>` : ""}`;
  if ($("nsMore")) $("nsMore").onclick = () => { stepIdx += 1; FX.play("click"); renderNextStep(); };
  clearInterval(stepTimer); stepTimer = setInterval(() => { stepIdx += 1; renderNextStep(); }, 9000);
}
const nextStepsHTML = () => { const s = nextSteps().slice(0, 2); return s.length ? `<div class="xtra next">🧭 <b>Prochain pas :</b> ${s.map((x) => `${x.ico} ${esc(x.txt)}`).join("<br>")}</div>` : ""; };
