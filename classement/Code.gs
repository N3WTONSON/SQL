/**
 * Le Grimoire des Requêtes : classement commun à tous les appareils.
 * À coller dans Extensions > Apps Script d'une feuille Google Sheets, puis à déployer
 * comme « Application Web » (Exécuter en tant que : moi ; Accès : tout le monde).
 * Après chaque modification de ce code : Déployer > Gérer les déploiements > Modifier > Nouvelle version.
 * Il ne reçoit que : identifiant du joueur, nom, niveau, XP, missions réussies, badges,
 * et pour le défi du jour : la date, le nombre d'essais ratés et le temps.
 */
const FEUILLE = "Classement";
const FEUILLE_DEFIS = "Defis";

function feuille_(nom, entetes) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(nom);
  if (!sh) { sh = ss.insertSheet(nom); sh.appendRow(entetes); }
  return sh;
}
const classement_ = () => feuille_(FEUILLE, ["id", "nom", "niveau", "xp", "missions", "badges", "mis à jour"]);
const defis_ = () => feuille_(FEUILLE_DEFIS, ["id", "nom", "defi", "essais", "secondes", "mis à jour"]);
const json_ = (o) => ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);

// Lire : sans paramètre, le classement général ; avec ?defi=AAAA-MM-JJ, le classement du défi de ce jour
function doGet(e) {
  const defi = e && e.parameter && e.parameter.defi;
  if (defi) {
    // la date est rangée sous la forme « jour 2026-10-25 » pour que Google Sheets ne la transforme pas en date
    const lignes = defis_().getDataRange().getValues().slice(1).filter((l) => l[0] && String(l[2]) === "jour " + defi);
    return json_(lignes.map((l) => ({ id: l[0], nom: l[1], defi: String(defi), essais: l[3], secondes: l[4] })));
  }
  const lignes = classement_().getDataRange().getValues().slice(1).filter((l) => l[0]);
  return json_(lignes.map((l) => ({ id: l[0], nom: l[1], niveau: l[2], xp: l[3], missions: l[4], badges: l[5] })));
}

// Enregistrer : le jeu envoie un POST ; une ligne par joueur (repéré par son identifiant)
function doPost(e) {
  let d;
  try { d = JSON.parse(e.postData.contents); } catch (err) { return ContentService.createTextOutput("erreur"); }
  const id = String(d.id || "").slice(0, 60);
  if (!id) return ContentService.createTextOutput("erreur");
  const borne = (v, max) => Math.max(0, Math.min(max, Math.floor(Number(v) || 0)));
  const nom = String(d.nom || "?").replace(/[<>"]/g, "").slice(0, 20);
  const verrou = LockService.getScriptLock();
  verrou.waitLock(5000);
  try {
    // le score général (toujours envoyé)
    const xp = borne(d.xp, 20000);
    const ligne = [id, nom, Math.floor(xp / 150) + 1, xp, borne(d.missions, 40), borne(d.badges, 60), new Date()];
    const sh = classement_();
    const ids = sh.getRange(1, 1, sh.getLastRow(), 1).getValues().map((l) => String(l[0]));
    const i = ids.indexOf(id);
    if (i > 0) sh.getRange(i + 1, 1, 1, ligne.length).setValues([ligne]); else sh.appendRow(ligne);
    // le défi du jour : on garde le meilleur résultat de chaque joueur pour chaque jour
    if (d.type === "defi" && /^\d{4}-\d{2}-\d{2}$/.test(String(d.defi || ""))) {
      const sd = defis_(), essais = borne(d.essais, 999), secondes = Math.max(1, borne(d.secondes, 86400));
      const lignes = sd.getDataRange().getValues();
      let j = -1;
      const jour = "jour " + d.defi;
      for (let k = 1; k < lignes.length; k++) if (String(lignes[k][0]) === id && String(lignes[k][2]) === jour) { j = k; break; }
      const nouvelle = [id, nom, jour, essais, secondes, new Date()];
      if (j < 0) sd.appendRow(nouvelle);
      else if (essais < lignes[j][3] || (essais === lignes[j][3] && secondes < lignes[j][4])) sd.getRange(j + 1, 1, 1, nouvelle.length).setValues([nouvelle]);
    }
  } finally { verrou.releaseLock(); }
  return ContentService.createTextOutput("ok");
}
