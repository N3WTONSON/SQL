/**
 * Le Grimoire des Requêtes : classement commun à tous les appareils.
 * À coller dans Extensions > Apps Script d'une feuille Google Sheets, puis à déployer
 * comme « Application Web » (Exécuter en tant que : moi ; Accès : tout le monde).
 * Il ne reçoit que : identifiant du joueur, nom, niveau, XP, missions réussies, badges.
 */
const FEUILLE = "Classement";

function feuille_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(FEUILLE);
  if (!sh) { sh = ss.insertSheet(FEUILLE); sh.appendRow(["id", "nom", "niveau", "xp", "missions", "badges", "mis à jour"]); }
  return sh;
}

// Lire le classement : le jeu appelle cette adresse en GET
function doGet() {
  const lignes = feuille_().getDataRange().getValues().slice(1).filter((l) => l[0]);
  const joueurs = lignes.map((l) => ({ id: l[0], nom: l[1], niveau: l[2], xp: l[3], missions: l[4], badges: l[5] }));
  return ContentService.createTextOutput(JSON.stringify(joueurs)).setMimeType(ContentService.MimeType.JSON);
}

// Enregistrer un score : le jeu envoie un POST ; une ligne par joueur (repéré par son identifiant)
function doPost(e) {
  let d;
  try { d = JSON.parse(e.postData.contents); } catch (err) { return ContentService.createTextOutput("erreur"); }
  const id = String(d.id || "").slice(0, 60);
  if (!id) return ContentService.createTextOutput("erreur");
  const borne = (v, max) => Math.max(0, Math.min(max, Math.floor(Number(v) || 0)));
  const xp = borne(d.xp, 20000);
  const ligne = [id, String(d.nom || "?").replace(/[<>"]/g, "").slice(0, 20), Math.floor(xp / 150) + 1, xp, borne(d.missions, 40), borne(d.badges, 40), new Date()];
  const verrou = LockService.getScriptLock();
  verrou.waitLock(5000);
  try {
    const sh = feuille_();
    const ids = sh.getRange(1, 1, sh.getLastRow(), 1).getValues().map((l) => String(l[0]));
    const i = ids.indexOf(id);
    if (i > 0) sh.getRange(i + 1, 1, 1, ligne.length).setValues([ligne]);
    else sh.appendRow(ligne);
  } finally { verrou.releaseLock(); }
  return ContentService.createTextOutput("ok");
}
