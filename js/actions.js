"use strict";
/* =====================================================================
   6. ACTIONS DU JOUEUR
   ===================================================================== */
function explore() {
  const q = $("sql").value.trim(); if (!q) return;
  $("consoleMode").textContent = "MODE EXPLORATION";
  const L = LEVELS[state.current];
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
  const L = LEVELS[state.current];
  const q = $("sql").value.trim();
  if (!q) return;
  $("consoleMode").textContent = "MISSION";
  FX.play("cast"); const sb = document.querySelector(".spellbox"); sb.classList.remove("casting"); void sb.offsetWidth; sb.classList.add("casting");
  const write = L.mode === "write";
  let got;
  try { got = write ? runWorld(L, q) : run(q, worldSetup(L)); }
  catch (e) {                                    // erreur de syntaxe : -1 PV
    state.hp -= 1; save(); renderHUD(true); FX.play("hit");
    document.querySelector(".spellbox").classList.remove("shake"); void document.body.offsetWidth;
    document.querySelector(".spellbox").classList.add("shake");
    const caseTip = /\bCASE\b/i.test(q) && !/\bEND\b/i.test(q) ? " Un CASE se termine toujours par END." : "";
    $("out").innerHTML = `<div class="msg err"><b>LE SORT SE RETOURNE CONTRE TOI · −1 PV</b>${esc(translateError(e.message) + caseTip)}</div>`;
    if (state.hp <= 0) knockOut();
    return;
  }
  if (L.forbid && L.forbid.re.test(q)) {         // contrainte pédagogique du niveau : pas de dégâts
    setTimeout(() => FX.play("bad"), 250);
    $("out").innerHTML = `<div class="msg warn"><b>LE SORT FONCTIONNE, MAIS LA RÈGLE N'EST PAS RESPECTÉE</b>${esc(L.forbid.msg)}</div>` + (write ? worldView(got) : table(got));
    return;
  }
  if (write) {                                   // chapitre 4 : on juge l'état du royaume, pas l'affichage
    const problem = compareWorld(got, runWorld(L, L.expected), q);
    if (problem) { setTimeout(() => FX.play("bad"), 250); $("out").innerHTML = `<div class="msg warn"><b>LE SORT FONCTIONNE, MAIS LE ROYAUME N'EST PAS COMME PRÉVU</b>${esc(problem)}</div>` + worldView(got); return; }
    $("out").innerHTML = `<div class="msg ok"><b>SORT RÉUSSI</b>Le royaume a changé exactement comme il fallait. Les lignes surlignées portent ta marque.</div>` + worldView(got) + decomposition(L);
    victory(L);
    return;
  }
  const want = run(L.expected, worldSetup(L));
  let problem = compare(got, want, L.ordered);
  if (problem) problem += queryTips(q, problem);
  if (problem) {                                 // sort valide mais mauvaise cible : pas de dégâts
    let diff = "";
    if (got.columns.length && got.columns.length === want.columns.length && !/mauvais ordre/.test(problem)) {
      const { extra, missing } = diffRows(got, want);
      const list = (rows) => rows.slice(0, 6).map((r) => `<span>${r.map((v) => esc(v === null ? "NULL" : v)).join(" · ")}</span>`).join("") + (rows.length > 6 ? `<span>… et ${rows.length - 6} autre(s)</span>` : "");
      if (extra.length || missing.length) diff = `<div class="diff">
        ${extra.length ? `<div class="plus"><span class="label">En trop dans ton résultat (${extra.length})</span>${list(extra)}</div>` : ""}
        ${missing.length ? `<div class="minus"><span class="label">Attendues mais absentes (${missing.length})</span>${list(missing)}</div>` : ""}
        <p>Pour comprendre, compare ces lignes : qu'ont-elles en commun ? Celles en trop ont passé ton filtre alors qu'elles n'auraient pas dû ; les absentes ont été écartées, ou modifiées, à tort.</p></div>`;
    }
    setTimeout(() => FX.play("bad"), 250);
    $("out").innerHTML = `<div class="msg warn"><b>LE SORT FONCTIONNE, MAIS RATE SA CIBLE</b>${esc(problem)}</div>` + diff + table(got);
    return;
  }
  $("out").innerHTML = `<div class="msg ok"><b>SORT RÉUSSI</b>La boule de cristal confirme ta vision.</div>` + table(got) + decomposition(L);
  victory(L);
}

function victory(L) {
  const first = !state.completed.includes(L.id);
  const lvlBefore = playerLevel();
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
  save(); renderHUD(); renderMap(); renderLoot();
  const levelUp = playerLevel() > lvlBefore;
  const chName = L.chapter.split(" · ")[0];
  $("overlay").innerHTML = `<div class="card" role="dialog" aria-modal="true" aria-labelledby="vt">
      ${chapterEnd ? `<img class="logo sm" src="assets/logo-480.webp" alt="">` : ""}
      <h3 id="vt">${!next ? "Maître du Grimoire !" : chapterEnd ? `${esc(chName)} terminé !` : levelUp ? "Niveau supérieur !" : "Victoire !"}</h3>
      <p>${first ? `Mission « ${esc(L.title)} » accomplie.` : "Mission déjà accomplie : pas de nouvelle récompense, mais l'entraînement paie."}</p>
      ${first ? `<div class="rewards"><span class="x">+${gained} XP</span><span class="i">${esc(L.item)}</span>${L.badge ? `<span class="b">${esc(L.badge)}</span>` : ""}${levelUp ? `<span class="x">NIV ${playerLevel()}</span>` : ""}${chapterEnd ? `<span class="i">+2 parchemins</span>` : ""}</div>` : ""}
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
    if (next) { state.current = next.id; save(); renderMap(); renderLevel(); window.scrollTo({ top: 0 }); }
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
  const L = LEVELS[state.current];
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
  const L = LEVELS[state.current];
  const used = state.hintsUsed[L.id] || 0;
  if (used >= L.hints.length) { $("out").insertAdjacentHTML("afterbegin", `<div class="msg info">Tu as déjà lu tous les parchemins de cette mission.</div>`); return; }
  if (state.scrolls <= 0) return;
  state.scrolls -= 1; state.hintsUsed[L.id] = used + 1; save(); renderHUD(); FX.play("scroll");
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
