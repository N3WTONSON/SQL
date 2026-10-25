"use strict";
/* =====================================================================
   7. DÉMARRAGE
   ===================================================================== */
function wire() {
    document.addEventListener("click", (e) => {
    const ins = e.target.closest("[data-ins]"); if (ins) { insertAtCursor(ins.dataset.ins); renderTranslate(); FX.play("click"); }
    const pk = e.target.closest("[data-peek]");
    if (pk) { const t = pk.dataset.peek; $("consoleMode").textContent = "LECTURE";
      $("out").innerHTML = `<div class="msg info">La table ${t} (${TABLE_FR[t]}) telle qu'elle est au départ. Chaque ligne est un élément, chaque colonne une information sur lui. Simple lecture : aucun PV en jeu.</div>` + table(run(`SELECT * FROM ${t}`));
      $("out").scrollIntoView({ block: "nearest" }); return; }
    if (e.target.closest("#whyNext")) { const n = LEVELS[state.current + 1]; if (n) { daily.active = false; state.current = n.id; save(); renderMap(); renderLevel(); window.scrollTo({ top: 0 }); } return; }
    const lv = e.target.closest(".lvl[data-lvl]:not(.locked)");
    if (lv) { stopModes(); state.current = +lv.dataset.lvl; save(); renderMap(); renderLevel(); }
  });
  $("cast").onclick = cast;
  // Colonne de droite : épinglée (toujours visible) ou repliée en barre d'icônes ; chaque appareil s'en souvient
  const side = { rail: false };
  try { side.rail = localStorage.getItem("grimoire-colonne") === "repliee"; } catch (e) {}
  const closeDrawer = () => { document.body.classList.remove("drawer"); $("shade").hidden = true; };
  const applySide = () => {
    document.body.classList.toggle("rail", side.rail); if (!side.rail) closeDrawer();
    $("pinBtn").innerHTML = side.rail
      ? `<span class="ri" aria-hidden="true">📌</span><span class="rl">Épingler</span>`
      : `<span class="ri" aria-hidden="true">⇥</span><span class="rl">Replier la colonne</span>`;
    $("pinBtn").title = side.rail ? "Épingler la colonne : elle reste toujours visible" : "Replier la colonne sur la droite pour agrandir la mission";
    try { localStorage.setItem("grimoire-colonne", side.rail ? "repliee" : "epinglee"); } catch (e) {}
  };
  $("pinBtn").onclick = () => { side.rail = !side.rail; FX.play(side.rail ? "unclick" : "click"); applySide(); };
  document.querySelectorAll("[data-open]").forEach((b) => b.onclick = () => {
    const panel = $(b.dataset.open);
    document.body.classList.add("drawer"); $("shade").hidden = false; panel.open = true; FX.play("page");
    setTimeout(() => panel.scrollIntoView({ block: "start", behavior: "smooth" }), 30);
  });
  $("shade").onclick = closeDrawer; $("drawerClose").onclick = () => { FX.play("unclick"); closeDrawer(); };
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && document.body.classList.contains("drawer")) closeDrawer(); });
  // choisir une mission dans la carte referme le tiroir
  $("map").addEventListener("click", (e) => { if (e.target.closest(".lvl[data-lvl]:not(.locked)")) closeDrawer(); });
  applySide();
  // hauteur réelle de la barre du haut (elle peut passer sur 2 lignes) : la barre d'icônes se cale dessous
  const hudH = () => document.documentElement.style.setProperty("--hudH", document.querySelector(".hud").offsetHeight + "px");
  hudH(); window.addEventListener("resize", hudH);
  if (window.ResizeObserver) new ResizeObserver(hudH).observe(document.querySelector(".hud"));
  // panneaux pliables : chaque appareil se souvient de ce qui est plié
  ["foldQuests", "foldMap", "foldTables", "foldLoot"].forEach((id) => {
    const el = $(id);
    try { if (localStorage.getItem("grimoire-pli-" + id) === "ferme") el.open = false; } catch (e) {}
    el.addEventListener("toggle", () => { FX.play(el.open ? "page" : "unclick"); try { localStorage.setItem("grimoire-pli-" + id, el.open ? "ouvert" : "ferme"); } catch (e) {} });
  });
  $("playerBtn").onclick = () => { FX.play("page"); openPlayers(false); };
  $("rankBtn").onclick = () => { if (!SQL) return; FX.play("levelup"); openRanking(); };
  $("albumBtn").onclick = () => { if (!SQL) return; FX.play("page"); openAlbum(); };
  $("peek").onclick = () => { FX.play("page"); explore(); };
  const soundLabel = () => { $("sound").textContent = FX.on ? "SON : OUI" : "SON : NON"; $("sound").setAttribute("aria-pressed", FX.on ? "true" : "false"); };
  $("sound").onclick = () => { FX.toggle(); soundLabel(); }; soundLabel();
/* ---------- Mode clair / sombre, et installation comme une application ---------- */
const Theme = (() => {
  const meta = () => document.querySelector('meta[name="theme-color"]');
  const apply = (t) => {
    document.documentElement.dataset.theme = t;
    const b = document.getElementById("themeBtn");
    if (b) { b.textContent = t === "light" ? "🌙" : "☀️"; b.title = t === "light" ? "Passer en mode sombre" : "Passer en mode clair (salle lumineuse, vidéoprojecteur)"; b.setAttribute("aria-label", b.title); b.setAttribute("aria-pressed", t === "light" ? "true" : "false"); }
    if (meta()) meta().content = t === "light" ? "#f4eee1" : "#11132a";
  };
  let t = "dark"; try { t = localStorage.getItem("grimoire-theme") === "light" ? "light" : "dark"; } catch (e) {}
  apply(t);
  const b = document.getElementById("themeBtn");
  if (b) b.onclick = () => { t = t === "light" ? "dark" : "light"; try { localStorage.setItem("grimoire-theme", t); } catch (e) {} apply(t); if (typeof FX !== "undefined") FX.play("click"); };
  return { apply };
})();
const Install = (() => {
  const btn = document.getElementById("installBtn");
  const can = !!document.querySelector('link[rel="manifest"]') && /^https?:$/.test(location.protocol);
  const standalone = () => (window.matchMedia && matchMedia("(display-mode: standalone)").matches) || navigator.standalone === true;
  const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  let evt = null;
  if (!btn || !can || standalone()) return {};
  if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});
  window.addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); evt = e; btn.hidden = false; });
  window.addEventListener("appinstalled", () => { btn.hidden = true; evt = null; });
  if (ios) btn.hidden = false;      // Safari n'a pas de bouton automatique : on explique les deux gestes
  btn.onclick = async () => {
    if (evt) { evt.prompt(); try { const r = await evt.userChoice; if (r.outcome === "accepted") btn.hidden = true; } catch (e) {} evt = null; return; }
    const old = document.getElementById("playerGate"); if (old) old.remove();
    const g = document.createElement("div"); g.id = "playerGate"; g.className = "pgate";
    g.innerHTML = `<div class="pcard" role="dialog" aria-modal="true" aria-labelledby="insT"><h2 id="insT">📲 Installer le Grimoire</h2>
      <p>Sur iPad et iPhone, dans <b>Safari</b> :</p>
      <p>1. Touche le bouton <b>Partager</b> <span aria-hidden="true">⬆️</span> (en haut à droite sur iPad).<br>2. Choisis <b>« Sur l'écran d'accueil »</b>, puis <b>Ajouter</b>.</p>
      <p class="pnote">Le Grimoire s'ouvre alors en plein écran, avec son icône, et marche même sans Internet (sauf le classement en ligne).</p>
      <button class="pclose" id="insClose">Fermer</button></div>`;
    document.body.appendChild(g); document.getElementById("insClose").onclick = () => g.remove();
  };
  return {};
})();

  $("whyBtn").onclick = () => showWhy(LEVELS[state.current]);
  $("hintBtn").onclick = readScroll;
  let tTimer; $("sql").addEventListener("input", () => { clearTimeout(tTimer); tTimer = setTimeout(renderTranslate, 120); });
  $("sql").addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); cast(); }
  });
  let armed = false;
  $("reset").onclick = () => {
    if (!armed) { armed = true; $("reset").textContent = "Clique encore pour tout effacer"; setTimeout(() => { armed = false; $("reset").textContent = "Recommencer l'aventure"; }, 3000); return; }
    state = fresh(); save(); armed = false; $("reset").textContent = "Recommencer l'aventure";
    renderHUD(); renderMap(); renderLevel(); renderLoot();
  };
}

(async function boot() {
  wire(); showPlayer(); renderHUD(); renderMap(); renderLoot();
  try {
    const bin = Uint8Array.from(atob(WASM_B64), (c) => c.charCodeAt(0));
    SQL = await initSqlJs({ wasmBinary: bin });
    buildDictionary(LEVELS[state.current]);
    LEVELS.forEach((L) => {           // le dernier parchemin ne donne plus la solution : un squelette à compléter
      L.hints[L.hints.length - 1] = `Le squelette du sort. Les mots-clés sont à leur place ; remplace chaque <code>___</code> par une colonne, une table ou une valeur. Le traducteur sous l'éditeur te dira si ton sort veut bien dire ce que tu veux.<br><code>${esc(skeleton(L.expected))}</code>`;
    });
    renderSchema(); renderLevel();
    $("cast").disabled = false;
    if (Players.current) pushScore(true);          // le classement en ligne connaît le dernier score
    if (!Players.current) openPlayers(true);       // premier accès : on demande le nom du joueur
    else if (!state.avatar) openAvatarPicker(() => { if (!state.seenIntro) showIntro(); });
    else if (!state.seenIntro) showIntro();
  } catch (e) {
    $("lvlTitle").textContent = "Le grimoire refuse de s'ouvrir";
    $("lvlPitch").textContent = "Le moteur SQLite n'a pas pu démarrer dans ce navigateur : " + e.message;
  }
})();
