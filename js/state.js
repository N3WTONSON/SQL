"use strict";
/* =====================================================================
   3. ÉTAT DU JOUEUR (sauvé dans le navigateur quand c'est possible)
   ===================================================================== */
const SAVE_KEY = "grimoire-sql-v1";
const fresh = () => ({ current: 0, completed: [], xp: 0, hp: MAX_HP, scrolls: START_SCROLLS, hintsUsed: {}, loot: [], seenIntro: false });
let state = fresh();
try { const s = JSON.parse(localStorage.getItem(SAVE_KEY)); if (s && typeof s.current === "number") state = Object.assign(fresh(), s); } catch (e) {}
function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch (e) {} }

let SQL = null;
const $ = (id) => document.getElementById(id);
