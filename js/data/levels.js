"use strict";
/* =====================================================================
   2. LES NIVEAUX (Tutoriel → Chapitre 5)
   ===================================================================== */
const LEVELS = [
  {
    id: 0, chapter: "Tutoriel", title: "Le Registre de la Taverne",
    pitch: "Tu te réveilles au <em>Chaudron Fêlé</em>, sans souvenir et sans un sou. Le tavernier pose devant toi un vieux registre : « Tous les héros du royaume y sont inscrits. Lis-le et tu sauras à qui t'adresser. »",
    mission: "Affiche <b>toutes</b> les colonnes et toutes les lignes de la table <code>heros</code>.",
    concept: ["SELECT *", "FROM"],
    starter: "-- Ton premier sort. Remplace les ??? :\nSELECT ??? FROM ???;",
    expected: "SELECT * FROM heros;", ordered: false,
    hints: [
      "Le symbole <code>*</code> signifie « toutes les colonnes ».",
      "La structure est toujours : <code>SELECT</code> quoi <code>FROM</code> quelle table.",
      "La formule complète : <code>SELECT * FROM heros;</code>"
    ],
    xp: 50, item: "Chope de bienvenue", badge: "Premier Sortilège"
  },
  {
    id: 1, chapter: "Tutoriel", title: "Les Noms et les Vocations",
    pitch: "Le registre déborde d'informations inutiles. La guilde n'a besoin que de deux choses pour composer une équipe : le <em>nom</em> de chaque héros et sa <em>classe</em>.",
    mission: "Affiche uniquement les colonnes <code>nom</code> et <code>classe</code> de la table <code>heros</code>.",
    concept: ["SELECT col1, col2"],
    starter: "SELECT * FROM heros;",
    expected: "SELECT nom, classe FROM heros;", ordered: false,
    hints: [
      "Remplace le <code>*</code> par la liste des colonnes voulues.",
      "Sépare les noms de colonnes par une virgule : <code>col1, col2</code>.",
      "La formule complète : <code>SELECT nom, classe FROM heros;</code>"
    ],
    xp: 60, item: "Plume d'oie du scribe", badge: null
  },
  {
    id: 2, chapter: "Chapitre 1 · La Forêt Sombre", title: "Les Ombres sous les Chênes",
    pitch: "Un éclaireur blessé titube jusqu'à la taverne : « La Forêt Sombre grouille de créatures ! » Avant d'y entrer, il faut savoir <em>ce qui t'y attend</em>, et pas ce qui rôde ailleurs.",
    mission: "Dans la table <code>monstres</code>, affiche le <code>nom</code> et les <code>pv</code> des monstres dont la <code>region</code> est <b>'Forêt Sombre'</b>.",
    concept: ["WHERE", "= 'texte'"],
    starter: "SELECT nom, pv\nFROM monstres\n",
    expected: "SELECT nom, pv FROM monstres WHERE region = 'Forêt Sombre';", ordered: false,
    hints: [
      "Filtre les lignes avec <code>WHERE colonne = valeur</code>, après le <code>FROM</code>.",
      "Le texte se met entre apostrophes simples : <code>'Forêt Sombre'</code> (majuscules et accents compris).",
      "La formule complète : <code>SELECT nom, pv FROM monstres WHERE region = 'Forêt Sombre';</code>"
    ],
    xp: 80, item: "Lanterne de l'éclaireur", badge: "Pisteur des Bois"
  },
  {
    id: 3, chapter: "Chapitre 1 · La Forêt Sombre", title: "L'Arsenal de la Guilde",
    pitch: "La guilde t'ouvre sa bibliothèque de sorts, mais tu ne pourras en mémoriser que <em>trois</em>. Autant choisir les plus puissants.",
    mission: "Affiche le <code>nom</code> et la <code>puissance</code> des <b>3 sorts les plus puissants</b> de la table <code>sorts</code>, du plus fort au plus faible.",
    concept: ["ORDER BY … DESC", "LIMIT"],
    starter: "SELECT nom, puissance\nFROM sorts\n",
    expected: "SELECT nom, puissance FROM sorts ORDER BY puissance DESC LIMIT 3;", ordered: true,
    hints: [
      "<code>ORDER BY puissance</code> trie par puissance ; <code>DESC</code> inverse l'ordre (du plus grand au plus petit).",
      "<code>LIMIT 3</code> garde seulement les 3 premières lignes. Il se place tout à la fin.",
      "La formule complète : <code>SELECT nom, puissance FROM sorts ORDER BY puissance DESC LIMIT 3;</code>"
    ],
    xp: 100, item: "Grimoire de poche", badge: null
  },
  {
    id: 4, chapter: "Chapitre 1 · La Forêt Sombre", title: "Boss : la Traque de l'Ours-Hibou",
    pitch: "Les petites bêtes fuient à ton approche. Reste la menace sérieuse : tous les monstres de la <em>Forêt Sombre</em> qui ont <em>plus de 50 PV</em>. Classe-les du plus coriace au plus fragile pour planifier ton attaque.",
    mission: "Affiche le <code>nom</code> et les <code>pv</code> des monstres de la région <b>'Forêt Sombre'</b> ayant <b>plus de 50 pv</b>, triés par <code>pv</code> décroissant.",
    concept: ["WHERE … AND …", ">", "ORDER BY"],
    starter: "",
    expected: "SELECT nom, pv FROM monstres WHERE region = 'Forêt Sombre' AND pv > 50 ORDER BY pv DESC;", ordered: true,
    hints: [
      "Deux conditions dans un même <code>WHERE</code> se relient avec <code>AND</code>.",
      "Ordre des clauses : <code>SELECT → FROM → WHERE → ORDER BY</code>. Pour « plus de 50 » : <code>pv &gt; 50</code>.",
      "La formule complète : <code>SELECT nom, pv FROM monstres WHERE region = 'Forêt Sombre' AND pv &gt; 50 ORDER BY pv DESC;</code>"
    ],
    xp: 150, item: "Plume de 40 kg", badge: "Fléau de la Forêt Sombre"
  },
  {
    id: 5, chapter: "Chapitre 2 · Les Châteaux", title: "Le Recensement des Mages",
    pitch: "Ta victoire fait du bruit. La Reine Ysolde te convoque au <em>Bastion de l'Aube</em> : elle prépare une alliance et veut savoir combien de mages le royaume peut aligner. Elle ne veut pas une liste, elle veut <em>un nombre</em>.",
    mission: "Compte le nombre de héros dont la <code>classe</code> est <b>'Mage'</b> dans la table <code>heros</code>.",
    concept: ["COUNT(*)", "AS"],
    starter: "SELECT nom\nFROM heros\nWHERE classe = 'Mage';",
    expected: "SELECT COUNT(*) FROM heros WHERE classe = 'Mage';", ordered: false,
    hints: [
      "<code>COUNT(*)</code> remplace la liste de colonnes et renvoie le nombre de lignes trouvées.",
      "Le <code>WHERE</code> agit avant le comptage. Tu peux renommer le résultat : <code>COUNT(*) AS nb_mages</code>.",
      "La formule complète : <code>SELECT COUNT(*) FROM heros WHERE classe = 'Mage';</code>"
    ],
    xp: 100, item: "Sceau royal en cire", badge: null
  },
  {
    id: 6, chapter: "Chapitre 2 · Les Châteaux", title: "La Carte des Menaces",
    pitch: "Sur la grande table de guerre, la Reine déroule une carte. « Je dois savoir où envoyer mes troupes. Combien de monstres rôdent dans <em>chaque</em> région ? »",
    mission: "Affiche chaque <code>region</code> de la table <code>monstres</code> avec le <b>nombre de monstres</b> qu'elle abrite.",
    concept: ["GROUP BY", "COUNT(*)"],
    starter: "SELECT region, COUNT(*)\nFROM monstres\n",
    expected: "SELECT region, COUNT(*) FROM monstres GROUP BY region;", ordered: false,
    hints: [
      "Sans regroupement, <code>COUNT(*)</code> compte tout d'un bloc. <code>GROUP BY region</code> crée un paquet par région.",
      "Toute colonne affichée à côté d'un <code>COUNT</code> doit apparaître dans le <code>GROUP BY</code>.",
      "La formule complète : <code>SELECT region, COUNT(*) FROM monstres GROUP BY region;</code>"
    ],
    xp: 120, item: "Carte d'état-major", badge: "Stratège Royal"
  },
  {
    id: 7, chapter: "Chapitre 2 · Les Châteaux", title: "Qui Vit Où ?",
    pitch: "Pour envoyer les convocations, le héraut a un problème : la table <code>heros</code> ne contient qu'un <em>numéro</em> de château (<code>num_chateau</code>). Le nom du château, lui, est rangé dans la table <code>chateaux</code>. Il faut <em>unir les deux registres</em>.",
    mission: "Affiche le <code>nom</code> de chaque héros et le <code>nom</code> du château où il vit, en reliant <code>heros.num_chateau</code> à <code>chateaux.id</code>.",
    concept: ["JOIN", "ON", "table.colonne"],
    starter: "SELECT heros.nom, chateaux.nom\nFROM heros\n",
    expected: "SELECT heros.nom, chateaux.nom FROM heros JOIN chateaux ON heros.num_chateau = chateaux.id;", ordered: false,
    hints: [
      "<code>JOIN chateaux</code> ajoute la table des châteaux ; <code>ON</code> dit comment faire correspondre les lignes.",
      "Les deux tables ont une colonne <code>nom</code> : préfixe-les (<code>heros.nom</code>, <code>chateaux.nom</code>). La liaison : <code>ON heros.num_chateau = chateaux.id</code>.",
      "La formule complète : <code>SELECT heros.nom, chateaux.nom FROM heros JOIN chateaux ON heros.num_chateau = chateaux.id;</code>"
    ],
    xp: 150, item: "Trompe du héraut", badge: "Lieur de Tables"
  },
  {
    id: 8, chapter: "Chapitre 2 · Les Châteaux", title: "Les Trésors Légendaires",
    pitch: "Une rumeur court : deux objets <em>légendaires</em> dorment dans les besaces du royaume. Pour sceller l'alliance, la Reine veut savoir <em>qui</em> les porte.",
    mission: "Affiche le <code>nom</code> du héros et l'<code>objet</code> pour chaque objet de rareté <b>'Légendaire'</b>, en reliant <code>inventaire.num_heros</code> à <code>heros.id</code>.",
    concept: ["JOIN", "WHERE après JOIN"],
    starter: "",
    expected: "SELECT heros.nom, inventaire.objet FROM inventaire JOIN heros ON inventaire.num_heros = heros.id WHERE inventaire.rarete = 'Légendaire';", ordered: false,
    hints: [
      "Pars de <code>inventaire</code>, puis <code>JOIN heros ON inventaire.num_heros = heros.id</code>.",
      "Le <code>WHERE</code> vient après le <code>JOIN … ON …</code> : <code>WHERE inventaire.rarete = 'Légendaire'</code> (accent compris).",
      "La formule complète : <code>SELECT heros.nom, inventaire.objet FROM inventaire JOIN heros ON inventaire.num_heros = heros.id WHERE inventaire.rarete = 'Légendaire';</code>"
    ],
    xp: 160, item: "Loupe de l'antiquaire", badge: null
  },
  {
    id: 9, chapter: "Chapitre 2 · Les Châteaux", title: "Boss : le Trésor des Châteaux",
    pitch: "L'alliance coûte cher. La Reine veut savoir quel château abrite les héros les plus <em>riches</em>, pour savoir qui mettra la main à la bourse. Indice du tavernier : « Méfie-toi des apparences, la tour qui penche cache peut-être un voleur… »",
    mission: "Pour chaque château, affiche son <code>nom</code> et la <b>somme de l'or</b> (<code>fortune</code>) de ses héros, du château le plus riche au plus pauvre.",
    concept: ["JOIN", "SUM()", "GROUP BY", "ORDER BY"],
    starter: "",
    expected: "SELECT chateaux.nom, SUM(heros.fortune) AS total FROM chateaux JOIN heros ON heros.num_chateau = chateaux.id GROUP BY chateaux.nom ORDER BY total DESC;", ordered: true,
    hints: [
      "Relie <code>chateaux</code> et <code>heros</code> avec <code>ON heros.num_chateau = chateaux.id</code>, puis additionne avec <code>SUM(heros.fortune)</code>.",
      "Regroupe par château avec <code>GROUP BY chateaux.nom</code>, nomme la somme <code>AS total</code>, puis <code>ORDER BY total DESC</code>.",
      "La formule complète : <code>SELECT chateaux.nom, SUM(heros.fortune) AS total FROM chateaux JOIN heros ON heros.num_chateau = chateaux.id GROUP BY chateaux.nom ORDER BY total DESC;</code>"
    ],
    xp: 250, item: "Clé du Trésor Royal", badge: "Maître des Alliances"
  },
  {
    id: 10, chapter: "Chapitre 3 · La Crypte Oubliée", title: "Le Guerrier sans Magie",
    pitch: "Sous le Bastion, une crypte s'est rouverte et une <em>Liche</em> s'y éveille. Sa porte est protégée par une rune qui foudroie quiconque porte la moindre trace de magie. Seul un héros qui ne connaît <em>aucun sort</em> peut la franchir. Problème : un simple <code>JOIN</code> fait disparaître les héros sans sort…",
    mission: "Affiche le <code>nom</code> des héros qui n'ont <b>aucun sort</b> dans la table <code>sorts</code>.",
    concept: ["LEFT JOIN", "IS NULL"],
    starter: "-- Explore d'abord ceci, sans WHERE, pour voir les « trous » :\nSELECT heros.nom, sorts.nom\nFROM heros\nLEFT JOIN sorts ON sorts.num_heros = heros.id;",
    expected: "SELECT heros.nom FROM heros LEFT JOIN sorts ON sorts.num_heros = heros.id WHERE sorts.id IS NULL;", ordered: false,
    hints: [
      "<code>LEFT JOIN</code> garde <b>toutes</b> les lignes de la table de gauche (<code>heros</code>), même sans correspondance. Les colonnes manquantes valent <code>NULL</code>.",
      "On ne teste jamais <code>= NULL</code>. Le filtre s'écrit <code>WHERE sorts.id IS NULL</code>.",
      "La formule complète : <code>SELECT heros.nom FROM heros LEFT JOIN sorts ON sorts.num_heros = heros.id WHERE sorts.id IS NULL;</code>"
    ],
    xp: 180, item: "Gantelet anti-magie", badge: "Chasseur de Vide"
  },
  {
    id: 11, chapter: "Chapitre 3 · La Crypte Oubliée", title: "Le Cercle des Invocateurs",
    pitch: "Borin a franchi la rune. Derrière, une seconde porte ne s'ouvre qu'au chant d'un <em>cercle d'invocateurs</em> : des héros qui maîtrisent <em>au moins deux sorts</em> chacun.",
    mission: "Affiche le <code>nom</code> de chaque héros et son <b>nombre de sorts</b>, uniquement pour ceux qui en ont <b>au moins 2</b>.",
    concept: ["GROUP BY", "HAVING"],
    starter: "SELECT heros.nom, COUNT(*) AS nb_sorts\nFROM heros\nJOIN sorts ON sorts.num_heros = heros.id\nGROUP BY heros.nom\n",
    expected: "SELECT heros.nom, COUNT(*) FROM heros JOIN sorts ON sorts.num_heros = heros.id GROUP BY heros.nom HAVING COUNT(*) >= 2;", ordered: false,
    hints: [
      "<code>WHERE</code> filtre les lignes <b>avant</b> le regroupement ; <code>HAVING</code> filtre les groupes <b>après</b>.",
      "Le <code>HAVING</code> se place juste après le <code>GROUP BY</code> : <code>HAVING COUNT(*) &gt;= 2</code>.",
      "La formule complète : <code>SELECT heros.nom, COUNT(*) FROM heros JOIN sorts ON sorts.num_heros = heros.id GROUP BY heros.nom HAVING COUNT(*) &gt;= 2;</code>"
    ],
    xp: 180, item: "Diapason d'invocation", badge: null
  },
  {
    id: 12, chapter: "Chapitre 3 · La Crypte Oubliée", title: "L'Écho des Gardiens",
    pitch: "Dans la salle des ossements, l'écho murmure : « Seuls les plus robustes méritent ta crainte. » Mais robuste par rapport à quoi ? À la <em>moyenne</em> de tous les monstres connus. Il faut d'abord calculer cette moyenne, puis s'en servir comme seuil.",
    mission: "Affiche le <code>nom</code> et les <code>pv</code> des monstres dont les PV sont <b>supérieurs à la moyenne</b> des PV de tous les monstres.",
    concept: ["AVG()", "sous-requête ( … )"],
    starter: "-- La moyenne seule : lance-la avec « Explorer »\nSELECT AVG(pv) FROM monstres;",
    expected: "SELECT nom, pv FROM monstres WHERE pv > (SELECT AVG(pv) FROM monstres);", ordered: false,
    hints: [
      "<code>SELECT AVG(pv) FROM monstres</code> renvoie une seule valeur (environ 86). Tu peux l'utiliser comme un nombre ordinaire.",
      "Une requête placée entre parenthèses à l'intérieur d'une autre s'appelle une <b>sous-requête</b> : <code>WHERE pv &gt; (SELECT AVG(pv) FROM monstres)</code>.",
      "La formule complète : <code>SELECT nom, pv FROM monstres WHERE pv &gt; (SELECT AVG(pv) FROM monstres);</code>"
    ],
    xp: 200, item: "Cor d'os résonnant", badge: "Oreille des Profondeurs"
  },
  {
    id: 13, chapter: "Chapitre 3 · La Crypte Oubliée", title: "Les Reliques des Mages",
    pitch: "Le phylactère de la Liche est entouré d'un champ qui repousse tout objet <em>non imprégné de magie</em>. Seuls les objets portés par des <em>Mages</em> peuvent passer. Gédéon le Distrait, très fier, vide déjà sa besace…",
    mission: "Affiche l'<code>objet</code> de chaque objet de la table <code>inventaire</code> dont le propriétaire est un héros de classe <b>'Mage'</b>, sans utiliser de JOIN.",
    concept: ["IN", "sous-requête ( … )"],
    starter: "SELECT objet\nFROM inventaire\nWHERE num_heros IN (\n  \n);",
    expected: "SELECT objet FROM inventaire WHERE num_heros IN (SELECT id FROM heros WHERE classe = 'Mage');", ordered: false,
    forbid: { re: /\bJOIN\b/i, msg: "Bien vu, un JOIN donne le bon résultat ! Mais le champ magique exige une sous-requête : remplace le JOIN par WHERE num_heros IN (SELECT …)." },
    hints: [
      "<code>num_heros IN (3, 6)</code> garde les lignes dont <code>num_heros</code> vaut 3 ou 6. Une sous-requête peut fournir cette liste.",
      "La sous-requête doit renvoyer <b>une seule colonne</b> : les <code>id</code> des héros mages. <code>SELECT id FROM heros WHERE classe = 'Mage'</code>.",
      "La formule complète : <code>SELECT objet FROM inventaire WHERE num_heros IN (SELECT id FROM heros WHERE classe = 'Mage');</code>"
    ],
    xp: 200, item: "Potion Douteuse (bénie)", badge: null
  },
  {
    id: 14, chapter: "Chapitre 3 · La Crypte Oubliée", title: "Boss : la Liche Mineure",
    pitch: "La Liche se dresse, son phylactère fêlé à la main. Elle ricane : les sorts médiocres glissent sur elle. Seules les <em>écoles de magie</em> dont la puissance moyenne dépasse la <em>moyenne de tous les sorts</em> peuvent l'atteindre. Choisis bien, tu n'auras pas de seconde chance.",
    mission: "Affiche chaque <code>ecole</code> de la table <code>sorts</code> avec sa <b>puissance moyenne</b>, uniquement si cette moyenne dépasse la puissance moyenne de <b>tous</b> les sorts, de la plus forte à la plus faible.",
    concept: ["GROUP BY", "HAVING", "sous-requête", "ORDER BY"],
    starter: "",
    expected: "SELECT ecole, AVG(puissance) AS moyenne FROM sorts GROUP BY ecole HAVING AVG(puissance) > (SELECT AVG(puissance) FROM sorts) ORDER BY moyenne DESC;", ordered: true,
    hints: [
      "Commence par la moyenne par école : <code>SELECT ecole, AVG(puissance) AS moyenne FROM sorts GROUP BY ecole</code>.",
      "Filtre les groupes avec <code>HAVING AVG(puissance) &gt; (SELECT AVG(puissance) FROM sorts)</code>, puis termine par <code>ORDER BY moyenne DESC</code>.",
      "La formule complète : <code>SELECT ecole, AVG(puissance) AS moyenne FROM sorts GROUP BY ecole HAVING AVG(puissance) &gt; (SELECT AVG(puissance) FROM sorts) ORDER BY moyenne DESC;</code>"
    ],
    xp: 300, item: "Phylactère fêlé", badge: "Briseur de Liche"
  },

  /* ---- Chapitre 4 : on MODIFIE le royaume. mode "write" = validation par l'état des tables.
     Le monde du chapitre est cumulatif : chaque niveau démarre avec les sorts attendus des niveaux précédents. ---- */
  {
    id: 15, chapter: "Chapitre 4 · La Forge des Nains", title: "Une Nouvelle Recrue",
    mode: "write", tables: ["heros"],
    pitch: "Au Fort Roc-Tonnerre, le Thane Hrolf rallume la grande forge pour armer l'alliance. Une jeune forgeronne se présente : <em>Tilda Marteau-Vif</em>. Jusqu'ici tu lisais le royaume ; désormais tu vas l'<em>écrire</em>. Et la forge se souvient : chaque sort réussi de ce chapitre reste gravé pour la suite.",
    mission: "Ajoute Tilda dans la table <code>heros</code> : id <b>7</b>, nom <b>'Tilda Marteau-Vif'</b>, classe <b>'Forgeronne'</b>, niveau <b>1</b>, pv <b>100</b>, fortune <b>0</b>, num_chateau <b>2</b>.",
    concept: ["INSERT INTO", "VALUES"],
    starter: "INSERT INTO heros (id, nom, classe, niveau, pv, fortune, num_chateau)\nVALUES ( );",
    expected: "INSERT INTO heros (id, nom, classe, niveau, pv, fortune, num_chateau) VALUES (7, 'Tilda Marteau-Vif', 'Forgeronne', 1, 100, 0, 2);",
    hints: [
      "<code>INSERT INTO table (colonnes…) VALUES (valeurs…)</code> ajoute une ligne. Les valeurs suivent l'ordre des colonnes listées.",
      "Les nombres s'écrivent tels quels, les textes entre apostrophes : <code>(7, 'Tilda Marteau-Vif', 'Forgeronne', 1, 100, 0, 2)</code>.",
      "La formule complète : <code>INSERT INTO heros (id, nom, classe, niveau, pv, fortune, num_chateau) VALUES (7, 'Tilda Marteau-Vif', 'Forgeronne', 1, 100, 0, 2);</code>"
    ],
    xp: 200, item: "Tablier de cuir ignifugé", badge: "Scribe du Royaume"
  },
  {
    id: 16, chapter: "Chapitre 4 · La Forge des Nains", title: "Le Premier Ouvrage",
    mode: "write", tables: ["inventaire"],
    pitch: "Tilda passe la nuit à l'enclume. Au matin, deux pièces refroidissent sur l'établi. Il faut les inscrire dans l'inventaire, à son nom (num_heros <b>7</b>), et d'<em>un seul sort</em>.",
    mission: "Ajoute <b>deux</b> lignes à <code>inventaire</code> en une seule requête : (<b>9</b>, <b>'Marteau Runique'</b>, <b>'Rare'</b>, <b>600</b>, <b>7</b>) et (<b>10</b>, <b>'Enclume de Poche'</b>, <b>'Commun'</b>, <b>40</b>, <b>7</b>). Colonnes : id, objet, rarete, valeur, num_heros.",
    concept: ["INSERT", "plusieurs lignes"],
    starter: "",
    expected: "INSERT INTO inventaire (id, objet, rarete, valeur, num_heros) VALUES (9, 'Marteau Runique', 'Rare', 600, 7), (10, 'Enclume de Poche', 'Commun', 40, 7);",
    hints: [
      "Un seul <code>VALUES</code> peut contenir plusieurs lignes, séparées par une virgule : <code>VALUES (…), (…)</code>.",
      "Colonnes : <code>(id, objet, rarete, valeur, num_heros)</code>. Attention aux apostrophes autour des textes, pas autour des nombres.",
      "La formule complète : <code>INSERT INTO inventaire (id, objet, rarete, valeur, num_heros) VALUES (9, 'Marteau Runique', 'Rare', 600, 7), (10, 'Enclume de Poche', 'Commun', 40, 7);</code>"
    ],
    xp: 200, item: "Marteau Runique", badge: null
  },
  {
    id: 17, chapter: "Chapitre 4 · La Forge des Nains", title: "La Solde de Borin",
    mode: "write", tables: ["heros"],
    pitch: "Borin a monté la garde devant la forge trois nuits de suite. Le Thane le paie <em>150 pièces d'or</em>. Le trésorier te tend la plume, et un avertissement : « La dernière fois, un apprenti a oublié de préciser <em>qui</em> payer. Tout le royaume a été payé. Le Fort a failli faire faillite. »",
    mission: "Augmente de <b>150</b> le <code>fortune</code> de <b>'Borin Barbe-de-Fer'</b>, et de lui seul.",
    concept: ["UPDATE", "SET", "WHERE"],
    starter: "UPDATE heros\nSET fortune = fortune + 150\n-- Attention : sans WHERE, TOUS les héros seraient payés !\n",
    expected: "UPDATE heros SET fortune = fortune + 150 WHERE nom = 'Borin Barbe-de-Fer';",
    hints: [
      "<code>SET fortune = fortune + 150</code> prend l'ancienne valeur et lui ajoute 150. C'est un calcul, pas une valeur fixe.",
      "Le <code>WHERE</code> choisit les lignes à modifier, exactement comme dans un SELECT : <code>WHERE nom = 'Borin Barbe-de-Fer'</code>.",
      "La formule complète : <code>UPDATE heros SET fortune = fortune + 150 WHERE nom = 'Borin Barbe-de-Fer';</code>"
    ],
    xp: 220, item: "Bourse du trésorier", badge: "Trésorier Prudent"
  },
  {
    id: 18, chapter: "Chapitre 4 · La Forge des Nains", title: "Le Grand Creuset",
    mode: "write", tables: ["inventaire"],
    pitch: "Le creuset a faim de métal. Le Thane ordonne de fondre la camelote : les objets <em>communs</em> qui valent <em>moins de 10 pièces</em>. Gédéon serre sa Potion Douteuse contre lui. Règle d'or des forgerons : <em>regarde avant de détruire</em>. Un DELETE ne se rattrape pas.",
    mission: "Supprime de <code>inventaire</code> les objets de rareté <b>'Commun'</b> dont la <code>valeur</code> est <b>inférieure à 10</b>.",
    concept: ["DELETE FROM", "WHERE"],
    starter: "-- Vérifie d'abord avec « Explorer » ce que tu vas détruire :\nSELECT * FROM inventaire\nWHERE rarete = 'Commun' AND valeur < 10;",
    expected: "DELETE FROM inventaire WHERE rarete = 'Commun' AND valeur < 10;",
    hints: [
      "Le SELECT de départ montre les victimes. Pour les supprimer, garde le même <code>WHERE</code> et remplace <code>SELECT *</code> par <code>DELETE</code>.",
      "La forme : <code>DELETE FROM table WHERE condition;</code>. Pas de liste de colonnes : on supprime des lignes entières.",
      "La formule complète : <code>DELETE FROM inventaire WHERE rarete = 'Commun' AND valeur &lt; 10;</code>"
    ],
    xp: 220, item: "Lingot de récupération", badge: null
  },
  {
    id: 19, chapter: "Chapitre 4 · La Forge des Nains", title: "Boss : la Lame des Alliances",
    mode: "write", tables: ["inventaire", "heros"],
    forbid: { re: /num_chateau\s*(=|IN)\s*\(?\s*2\b/i, msg: "Le Thane refuse les numéros griffonnés : retrouve l'id du Fort Roc-Tonnerre avec une sous-requête sur chateaux, à partir de son nom." },
    pitch: "Le grand œuvre : forger la <em>Lame des Alliances</em>, qui scellera le pacte. Quand elle sort du feu, la forge entière s'illumine et tous les héros du <em>Fort Roc-Tonnerre</em> gagnent en puissance. Le Thane exige que le fort soit désigné <em>par son nom</em>, pas par un numéro.",
    mission: "En <b>un seul sort de deux instructions</b> : 1) ajoute à <code>inventaire</code> (<b>11</b>, <b>'Lame des Alliances'</b>, <b>'Légendaire'</b>, <b>9000</b>, <b>7</b>) ; 2) augmente de <b>2</b> le <code>niveau</code> de tous les héros du château nommé <b>'Fort Roc-Tonnerre'</b>.",
    concept: ["INSERT", "UPDATE", "sous-requête", "plusieurs instructions ;"],
    starter: "",
    expected: "INSERT INTO inventaire (id, objet, rarete, valeur, num_heros) VALUES (11, 'Lame des Alliances', 'Légendaire', 9000, 7); UPDATE heros SET niveau = niveau + 2 WHERE num_chateau = (SELECT id FROM chateaux WHERE nom = 'Fort Roc-Tonnerre');",
    hints: [
      "Deux instructions dans un même sort se séparent par un <code>;</code>. Commence par l'<code>INSERT</code> de la lame, sur le modèle du niveau 16.",
      "Pour l'UPDATE : <code>SET niveau = niveau + 2 WHERE num_chateau = (SELECT id FROM chateaux WHERE nom = 'Fort Roc-Tonnerre')</code>.",
      "La formule complète : <code>INSERT INTO inventaire (id, objet, rarete, valeur, num_heros) VALUES (11, 'Lame des Alliances', 'Légendaire', 9000, 7); UPDATE heros SET niveau = niveau + 2 WHERE num_chateau = (SELECT id FROM chateaux WHERE nom = 'Fort Roc-Tonnerre');</code>"
    ],
    xp: 350, item: "Lame des Alliances", badge: "Maître de Forge"
  },

  /* ---- Chapitre 5 : retour à la lecture, sur le royaume d'origine ---- */
  {
    id: 20, chapter: "Chapitre 5 · Le Conseil des Sages", title: "Les Écoles du Savoir",
    pitch: "La Lame des Alliances t'ouvre les portes du <em>Conseil des Sages</em>, qui siège au sommet du Bastion. Pour ton épreuve d'admission, la doyenne te demande de nommer toutes les <em>écoles de magie</em> du royaume. Chacune une seule fois : le Conseil a horreur des répétitions.",
    mission: "Affiche la liste des <code>ecole</code> de la table <code>sorts</code>, <b>sans doublons</b>.",
    concept: ["DISTINCT"],
    starter: "-- Lance-le avec « Explorer » : remarques-tu les doublons ?\nSELECT ecole FROM sorts;",
    expected: "SELECT DISTINCT ecole FROM sorts;", ordered: false,
    hints: [
      "Sans précaution, chaque sort donne une ligne : « Feu » apparaît deux fois, « Lumière » aussi.",
      "<code>DISTINCT</code> se place juste après <code>SELECT</code> et supprime les lignes identiques.",
      "La formule complète : <code>SELECT DISTINCT ecole FROM sorts;</code>"
    ],
    xp: 220, item: "Toge de novice du Conseil", badge: "Œil du Conseil"
  },
  {
    id: 21, chapter: "Chapitre 5 · Le Conseil des Sages", title: "L'Énigme de l'Oracle",
    pitch: "L'oracle du Conseil parle en énigmes : « Deux ombres menacent la paix. Leur nom <em>commence par la lettre L</em>, et c'est tout ce que je dirai. » Un <code>=</code> ne t'aidera pas ici : il faut chercher un <em>motif</em>.",
    mission: "Affiche le <code>nom</code> des monstres dont le nom <b>commence par 'L'</b>.",
    concept: ["LIKE", "% joker"],
    starter: "SELECT nom\nFROM monstres\nWHERE nom ",
    expected: "SELECT nom FROM monstres WHERE nom LIKE 'L%';", ordered: false,
    hints: [
      "<code>LIKE</code> compare un texte à un motif. Le symbole <code>%</code> remplace « n'importe quelle suite de lettres », même vide.",
      "<code>'L%'</code> : commence par L. <code>'%L'</code> : finit par L. <code>'%L%'</code> : contient un L quelque part.",
      "La formule complète : <code>SELECT nom FROM monstres WHERE nom LIKE 'L%';</code>"
    ],
    xp: 220, item: "Loupe d'oracle", badge: null
  },
  {
    id: 22, chapter: "Chapitre 5 · Le Conseil des Sages", title: "Le Registre des Menaces",
    pitch: "Le Conseil veut un registre lisible par tous. Les chiffres de danger effraient les villageois ; il faut des <em>mots</em>. Le scribe propose trois étiquettes, de la plus grave à la plus légère.",
    mission: "Affiche le <code>nom</code> de chaque monstre et une étiquette : <b>'Mortel'</b> si <code>danger</code> ≥ 7, <b>'Dangereux'</b> si <code>danger</code> ≥ 4, sinon <b>'Inoffensif'</b>.",
    concept: ["CASE WHEN … THEN … ELSE … END"],
    starter: "SELECT nom,\n  CASE\n    WHEN danger >= 7 THEN 'Mortel'\n    \n  END AS menace\nFROM monstres;",
    expected: "SELECT nom, CASE WHEN danger >= 7 THEN 'Mortel' WHEN danger >= 4 THEN 'Dangereux' ELSE 'Inoffensif' END AS menace FROM monstres;", ordered: false,
    hints: [
      "<code>CASE</code> fonctionne comme un « si… alors… sinon » : chaque <code>WHEN condition THEN valeur</code> est testé dans l'ordre, et le premier vrai l'emporte.",
      "Ajoute <code>WHEN danger &gt;= 4 THEN 'Dangereux'</code> puis <code>ELSE 'Inoffensif'</code>. Garde la condition la plus stricte en premier, et n'oublie pas le <code>END</code>.",
      "La formule complète : <code>SELECT nom, CASE WHEN danger &gt;= 7 THEN 'Mortel' WHEN danger &gt;= 4 THEN 'Dangereux' ELSE 'Inoffensif' END AS menace FROM monstres;</code>"
    ],
    xp: 250, item: "Plume du scribe royal", badge: "Juge des Menaces"
  },
  {
    id: 23, chapter: "Chapitre 5 · Le Conseil des Sages", title: "L'Impôt du Conseil",
    pitch: "Le Conseil lève un impôt pour reconstruire la crypte. Le trésorier veut savoir combien de héros sont <em>riches</em> (au moins 300 pièces d'or) et combien sont <em>modestes</em>. Il veut deux lignes, pas six.",
    mission: "Affiche deux catégories, <b>'Riche'</b> (<code>fortune</code> ≥ 300) et <b>'Modeste'</b> (le reste), avec le <b>nombre de héros</b> dans chacune.",
    concept: ["CASE", "GROUP BY"],
    starter: "",
    expected: "SELECT CASE WHEN fortune >= 300 THEN 'Riche' ELSE 'Modeste' END AS fortune, COUNT(*) FROM heros GROUP BY fortune;", ordered: false,
    hints: [
      "Commence par étiqueter chaque héros : <code>CASE WHEN fortune &gt;= 300 THEN 'Riche' ELSE 'Modeste' END AS fortune</code>.",
      "Tu peux regrouper par une étiquette calculée : <code>GROUP BY fortune</code>, et compter avec <code>COUNT(*)</code>.",
      "La formule complète : <code>SELECT CASE WHEN fortune &gt;= 300 THEN 'Riche' ELSE 'Modeste' END AS fortune, COUNT(*) FROM heros GROUP BY fortune;</code>"
    ],
    xp: 260, item: "Abaque du trésorier", badge: null
  },
  {
    id: 24, chapter: "Chapitre 5 · Le Conseil des Sages", title: "Boss : le Jugement du Conseil",
    pitch: "Dernière épreuve. Le Conseil remet ses titres aux défenseurs du royaume. La <em>Tour Penchée</em> est exclue : on y a trouvé trop d'or pour un si petit château. Pour chaque autre héros, il faut son château et son titre : <em>Champion</em> à partir du niveau 10, <em>Écuyer</em> en dessous. Les plus aguerris passent en premier.",
    mission: "Affiche le <code>nom</code> du héros, le <code>nom</code> de son château et un titre (<b>'Champion'</b> si <code>niveau</code> ≥ 10, sinon <b>'Écuyer'</b>), pour les héros dont le château <b>ne commence pas par 'Tour'</b>, triés par <code>niveau</code> décroissant.",
    concept: ["JOIN", "CASE", "NOT LIKE", "ORDER BY"],
    starter: "",
    expected: "SELECT heros.nom, chateaux.nom, CASE WHEN heros.niveau >= 10 THEN 'Champion' ELSE 'Écuyer' END AS titre FROM heros JOIN chateaux ON heros.num_chateau = chateaux.id WHERE chateaux.nom NOT LIKE 'Tour%' ORDER BY heros.niveau DESC;", ordered: true,
    hints: [
      "Pars du chapitre 2 : <code>FROM heros JOIN chateaux ON heros.num_chateau = chateaux.id</code>, puis ajoute le titre avec un <code>CASE … END AS titre</code>.",
      "Pour exclure la tour : <code>WHERE chateaux.nom NOT LIKE 'Tour%'</code>. Termine par <code>ORDER BY heros.niveau DESC</code>.",
      "La formule complète : <code>SELECT heros.nom, chateaux.nom, CASE WHEN heros.niveau &gt;= 10 THEN 'Champion' ELSE 'Écuyer' END AS titre FROM heros JOIN chateaux ON heros.num_chateau = chateaux.id WHERE chateaux.nom NOT LIKE 'Tour%' ORDER BY heros.niveau DESC;</code>"
    ],
    xp: 400, item: "Sceptre du Conseil", badge: "Archimage du SQL"
  },

  /* ---- Chapitres 6 à 8 : enquête, architecte, archives ---- */
  {
    id: 25,
    chapter: "Chapitre 6 · Le Trésor disparu",
    title: "Le Coffre vide",
    pitch: "Alerte au Bastion de l'Aube ! Le <em>trésor du château</em> a disparu dans la nuit du <em>jour 3</em>. Le gardien a vu le coffre plein à 20 h et vide à 23 h. Heureusement, chaque entrée est notée dans un nouveau registre : la table <code>visites</code> (qui, quel château, quel jour, à quelle heure). À toi de mener l'enquête.",
    mission: "Affiche le <code>num_heros</code> et l'<code>heure</code> des <code>visites</code> au château <b>1</b>, le <b>jour 3</b>, avec une heure <b>entre 20 et 23</b> (bornes comprises).",
    concept: ["BETWEEN … AND …"],
    starter: "-- Regarde d'abord tout le registre avec « Explorer » :\nSELECT * FROM visites;",
    expected: "SELECT num_heros, heure FROM visites WHERE num_chateau = 1 AND jour = 3 AND heure BETWEEN 20 AND 23;",
    ordered: false,
    hints: [
      "Trois conditions à réunir avec <code>AND</code> : le château, le jour, et l'heure.",
      "<code>heure BETWEEN 20 AND 23</code> veut dire « heure ≥ 20 et heure ≤ 23 ». Les deux bornes sont comprises.",
      "La formule complète : <code>SELECT num_heros, heure FROM visites WHERE num_chateau = 1 AND jour = 3 AND heure BETWEEN 20 AND 23;</code>"
    ],
    xp: 260,
    item: "Registre du gardien",
    badge: "Fin Limier"
  },
  {
    id: 26,
    chapter: "Chapitre 6 · Le Trésor disparu",
    title: "La Serrure fondue",
    pitch: "La serrure du coffre n'a pas été crochetée : elle a <em>fondu</em>. Le forgeron est formel, seul un sort de <em>Feu</em> ou de <em>Lumière</em> fait ça. Qui, parmi les héros, connaît au moins un de ces sorts ?",
    mission: "Affiche, <b>sans doublons</b>, le <code>nom</code> des héros qui connaissent un sort d'<code>ecole</code> <b>'Feu'</b> <b>ou</b> <b>'Lumière'</b>.",
    concept: ["OR", "JOIN", "DISTINCT"],
    starter: "SELECT DISTINCT heros.nom\nFROM heros\nJOIN sorts ON sorts.num_heros = heros.id\nWHERE ",
    expected: "SELECT DISTINCT heros.nom FROM heros JOIN sorts ON sorts.num_heros = heros.id WHERE sorts.ecole = 'Feu' OR sorts.ecole = 'Lumière';",
    ordered: false,
    hints: [
      "<code>AND</code> exige que les deux conditions soient vraies. <code>OR</code> se contente d'<b>une seule</b> des deux.",
      "Écris chaque test en entier des deux côtés : <code>sorts.ecole = 'Feu' OR sorts.ecole = 'Lumière'</code>.",
      "La formule complète : <code>SELECT DISTINCT heros.nom FROM heros JOIN sorts ON sorts.num_heros = heros.id WHERE sorts.ecole = 'Feu' OR sorts.ecole = 'Lumière';</code>"
    ],
    xp: 260,
    item: "Fragment de serrure fondue",
    badge: null
  },
  {
    id: 27,
    chapter: "Chapitre 6 · Le Trésor disparu",
    title: "La Bourse oubliée",
    pitch: "Près du coffre, on a retrouvé un indice : l'<em>objet le moins précieux</em> de tout le royaume, tombé d'une poche. À qui appartient-il ? Pas question de lire les valeurs une par une : laisse la base trouver le minimum.",
    mission: "Affiche le <code>nom</code> du héros et l'<code>objet</code> de l'inventaire dont la <code>valeur</code> est la <b>plus petite</b> de tout l'inventaire.",
    concept: ["MIN()", "sous-requête", "JOIN"],
    starter: "-- Trouve d'abord la plus petite valeur :\nSELECT MIN(valeur) FROM inventaire;",
    expected: "SELECT heros.nom, inventaire.objet FROM inventaire JOIN heros ON inventaire.num_heros = heros.id WHERE inventaire.valeur = (SELECT MIN(valeur) FROM inventaire);",
    ordered: false,
    hints: [
      "<code>SELECT MIN(valeur) FROM inventaire</code> donne un seul nombre : la plus petite valeur. <code>MAX()</code> donne la plus grande.",
      "Place ce calcul entre parenthèses dans le WHERE : <code>WHERE inventaire.valeur = (SELECT MIN(valeur) FROM inventaire)</code>, après le JOIN avec heros.",
      "La formule complète : <code>SELECT heros.nom, inventaire.objet FROM inventaire JOIN heros ON inventaire.num_heros = heros.id WHERE inventaire.valeur = (SELECT MIN(valeur) FROM inventaire);</code>"
    ],
    xp: 270,
    item: "Bourse trouée (pièce à conviction)",
    badge: null
  },
  {
    id: 28,
    chapter: "Chapitre 6 · Le Trésor disparu",
    title: "Le Dernier Visiteur",
    pitch: "Le gardien se souvient d'une chose : le voleur était le <em>dernier</em> à entrer au Bastion ce soir-là. Classe les visites du jour 3 de la plus tardive à la plus tôt, et ne garde que la première ligne.",
    mission: "Affiche le <code>nom</code> du héros et l'<code>heure</code> de la visite <b>la plus tardive</b> au château <b>1</b> le <b>jour 3</b>. Une seule ligne.",
    concept: ["ORDER BY DESC", "LIMIT"],
    starter: "SELECT heros.nom, visites.heure\nFROM visites\nJOIN heros ON visites.num_heros = heros.id\nWHERE visites.num_chateau = 1 AND visites.jour = 3",
    expected: "SELECT heros.nom, visites.heure FROM visites JOIN heros ON visites.num_heros = heros.id WHERE visites.num_chateau = 1 AND visites.jour = 3 ORDER BY visites.heure DESC LIMIT 1;",
    ordered: true,
    hints: [
      "Trie d'abord : <code>ORDER BY visites.heure DESC</code> met la visite la plus tardive en haut.",
      "<code>LIMIT 1</code>, tout à la fin, coupe la liste après la première ligne.",
      "La formule complète : <code>SELECT heros.nom, visites.heure FROM visites JOIN heros ON visites.num_heros = heros.id WHERE visites.num_chateau = 1 AND visites.jour = 3 ORDER BY visites.heure DESC LIMIT 1;</code>"
    ],
    xp: 280,
    item: "Sablier du gardien",
    badge: null
  },
  {
    id: 29,
    chapter: "Chapitre 6 · Le Trésor disparu",
    title: "Boss : le Suspect",
    pitch: "Il est temps de réunir tous les indices. Le voleur : <em>a visité le Bastion</em> (château 1) <em>le jour 3 entre 20 h et 23 h</em>, <b>et</b> connaît un sort de <em>Feu ou de Lumière</em>. Attention : mélanger AND et OR sans précaution accuse des innocents. Les <em>parenthèses</em> sont ta boîte à indices.",
    mission: "Affiche, <b>sans doublons</b>, le <code>nom</code> des héros qui ont visité le château <b>1</b> le <b>jour 3</b> avec une <code>heure</code> <b>entre 20 et 23</b>, <b>et</b> qui connaissent un sort d'école <b>'Feu'</b> ou <b>'Lumière'</b>.",
    concept: ["JOIN ×2", "BETWEEN", "( … OR … )"],
    starter: "SELECT DISTINCT heros.nom\nFROM visites\nJOIN heros ON visites.num_heros = heros.id\nJOIN sorts ON sorts.num_heros = heros.id\nWHERE ",
    expected: "SELECT DISTINCT heros.nom FROM visites JOIN heros ON visites.num_heros = heros.id JOIN sorts ON sorts.num_heros = heros.id WHERE visites.num_chateau = 1 AND visites.jour = 3 AND visites.heure BETWEEN 20 AND 23 AND (sorts.ecole = 'Feu' OR sorts.ecole = 'Lumière');",
    ordered: false,
    hints: [
      "Deux JOIN : visites → heros, puis heros → sorts. Ensuite toutes les conditions des niveaux 25 et 26 dans un seul WHERE.",
      "La base fait les AND <b>avant</b> les OR. Sans parenthèses, Aria (venue à 19 h) serait accusée. Écris : <code>AND (sorts.ecole = 'Feu' OR sorts.ecole = 'Lumière')</code>.",
      "La formule complète : <code>SELECT DISTINCT heros.nom FROM visites JOIN heros ON visites.num_heros = heros.id JOIN sorts ON sorts.num_heros = heros.id WHERE visites.num_chateau = 1 AND visites.jour = 3 AND visites.heure BETWEEN 20 AND 23 AND (sorts.ecole = 'Feu' OR sorts.ecole = 'Lumière');</code>"
    ],
    xp: 450,
    item: "Loupe de l'enquêteur",
    badge: "Grand Détective"
  },
  {
    id: 30,
    chapter: "Chapitre 7 · L'Architecte",
    title: "Le Plan de l'Architecte",
    mode: "write",
    tables: ["familiers"],
    pitch: "Gédéon avoue en pleurant : il a pris le trésor <em>par erreur</em>, croyant ranger le coffre de son familier. L'Architecte royale soupire : « Le royaume n'a même pas de registre des familiers ! » Elle te confie sa plume : tu vas <em>créer une table</em>. Une table neuve, c'est d'abord un <em>plan</em> : la liste des colonnes et leur type.",
    mission: "Crée la table <code>familiers</code> avec 4 colonnes : <code>id</code> (<b>INTEGER PRIMARY KEY</b>), <code>nom</code> (<b>TEXT</b>), <code>espece</code> (<b>TEXT</b>) et <code>num_heros</code> (<b>INTEGER</b>).",
    concept: ["CREATE TABLE", "INTEGER", "TEXT", "PRIMARY KEY"],
    starter: "CREATE TABLE familiers (\n  id INTEGER PRIMARY KEY,\n  \n);",
    expected: "CREATE TABLE familiers (id INTEGER PRIMARY KEY, nom TEXT, espece TEXT, num_heros INTEGER);",
    hints: [
      "Entre les parenthèses : chaque colonne s'écrit <code>nom TYPE</code>, et les colonnes sont séparées par des virgules.",
      "<code>INTEGER</code> = nombre entier, <code>TEXT</code> = texte. <code>PRIMARY KEY</code> fait de <code>id</code> l'identité unique de chaque ligne.",
      "La formule complète : <code>CREATE TABLE familiers (id INTEGER PRIMARY KEY, nom TEXT, espece TEXT, num_heros INTEGER);</code>"
    ],
    xp: 300,
    item: "Plume de l'Architecte",
    badge: "Bâtisseur"
  },
  {
    id: 31,
    chapter: "Chapitre 7 · L'Architecte",
    title: "Les Premiers Pensionnaires",
    mode: "write",
    tables: ["familiers"],
    pitch: "Ta table est prête… et vide. Trois familiers attendent à la porte : <em>Braise</em> la salamandre de Lyra, <em>Plume</em> le hibou de Mira, et <em>Grognon</em>, le crapaud de Gédéon, qui dormait dans le coffre du trésor.",
    mission: "Ajoute dans <code>familiers</code> : (<b>1</b>, <b>'Braise'</b>, <b>'Salamandre'</b>, <b>3</b>), (<b>2</b>, <b>'Plume'</b>, <b>'Hibou'</b>, <b>5</b>) et (<b>3</b>, <b>'Grognon'</b>, <b>'Crapaud'</b>, <b>6</b>).",
    concept: ["INSERT INTO", "VALUES"],
    starter: "INSERT INTO familiers VALUES\n  (1, 'Braise', 'Salamandre', 3),\n  ",
    expected: "INSERT INTO familiers VALUES (1, 'Braise', 'Salamandre', 3), (2, 'Plume', 'Hibou', 5), (3, 'Grognon', 'Crapaud', 6);",
    hints: [
      "C'est le même INSERT qu'au chapitre 4, mais dans ta propre table. Les valeurs suivent l'ordre de ton plan : id, nom, espece, num_heros.",
      "Plusieurs lignes : des parenthèses séparées par des virgules, et un seul <code>;</code> à la fin.",
      "La formule complète : <code>INSERT INTO familiers VALUES (1, 'Braise', 'Salamandre', 3), (2, 'Plume', 'Hibou', 5), (3, 'Grognon', 'Crapaud', 6);</code>"
    ],
    xp: 280,
    item: "Collier de Braise",
    badge: null
  },
  {
    id: 32,
    chapter: "Chapitre 7 · L'Architecte",
    title: "Qui promène qui ?",
    pitch: "Ta table vit maintenant dans le royaume, comme les autres. Grâce à la colonne <code>num_heros</code>, elle peut se <em>relier</em> aux héros. L'Architecte veut le registre complet, lisible par un humain.",
    mission: "Affiche le <code>nom</code> du héros, le <code>nom</code> du familier et son <code>espece</code>, en reliant <code>familiers.num_heros</code> à <code>heros.id</code>.",
    concept: ["JOIN", "ta propre table"],
    starter: "SELECT * FROM familiers;",
    expected: "SELECT heros.nom, familiers.nom, familiers.espece FROM familiers JOIN heros ON familiers.num_heros = heros.id;",
    ordered: false,
    hints: [
      "Les deux tables ont une colonne <code>nom</code> : écris toujours <code>table.colonne</code> pour dire laquelle.",
      "<code>FROM familiers JOIN heros ON familiers.num_heros = heros.id</code>, comme les objets de l'inventaire au chapitre 2.",
      "La formule complète : <code>SELECT heros.nom, familiers.nom, familiers.espece FROM familiers JOIN heros ON familiers.num_heros = heros.id;</code>"
    ],
    xp: 280,
    item: "Laisse tressée",
    badge: null
  },
  {
    id: 33,
    chapter: "Chapitre 7 · L'Architecte",
    title: "Une Colonne de plus",
    mode: "write",
    tables: ["familiers"],
    pitch: "Mira fait remarquer qu'on ne sait pas l'<em>âge</em> des familiers. Pas besoin de tout détruire et de recommencer : on peut <em>agrandir le plan</em> d'une table existante. Les familiers déjà inscrits auront simplement une case vide.",
    mission: "Ajoute à la table <code>familiers</code> une colonne <code>age</code> de type <b>INTEGER</b>.",
    concept: ["ALTER TABLE", "ADD COLUMN"],
    starter: "",
    expected: "ALTER TABLE familiers ADD COLUMN age INTEGER;",
    hints: [
      "<code>ALTER TABLE</code> = modifier le plan d'une table. Ici on ne touche pas aux lignes, seulement aux colonnes.",
      "La forme : <code>ALTER TABLE nom_de_table ADD COLUMN colonne TYPE;</code>",
      "La formule complète : <code>ALTER TABLE familiers ADD COLUMN age INTEGER;</code>"
    ],
    xp: 300,
    item: "Équerre d'argent",
    badge: null
  },
  {
    id: 34,
    chapter: "Chapitre 7 · L'Architecte",
    title: "Boss : le Grand Chantier",
    mode: "write",
    tables: ["familiers", "quetes"],
    pitch: "Le roi a tranché : les familiers vivront avec leurs héros, plus besoin de registre. Il faut <em>démolir</em> la table, puis bâtir à sa place un <em>tableau des quêtes</em>, dont la première sera de rendre le trésor au Bastion. Attention : <code>DROP TABLE</code> est sans retour.",
    mission: "En un sort de trois instructions : 1) supprime la table <code>familiers</code> ; 2) crée la table <code>quetes</code> (<code>id</code> <b>INTEGER PRIMARY KEY</b>, <code>titre</code> <b>TEXT</b>, <code>recompense</code> <b>INTEGER</b>, <code>num_heros</code> <b>INTEGER</b>) ; 3) ajoute la quête (<b>1</b>, <b>'Rendre le trésor'</b>, <b>5000</b>, <b>6</b>).",
    concept: ["DROP TABLE", "CREATE TABLE", "INSERT INTO"],
    starter: "",
    expected: "DROP TABLE familiers; CREATE TABLE quetes (id INTEGER PRIMARY KEY, titre TEXT, recompense INTEGER, num_heros INTEGER); INSERT INTO quetes VALUES (1, 'Rendre le trésor', 5000, 6);",
    hints: [
      "Trois instructions séparées par des <code>;</code>. Commence par <code>DROP TABLE familiers;</code>",
      "Puis un CREATE TABLE comme au niveau 30, et un INSERT comme au niveau 31, cette fois dans <code>quetes</code>.",
      "La formule complète : <code>DROP TABLE familiers; CREATE TABLE quetes (id INTEGER PRIMARY KEY, titre TEXT, recompense INTEGER, num_heros INTEGER); INSERT INTO quetes VALUES (1, 'Rendre le trésor', 5000, 6);</code>"
    ],
    xp: 450,
    item: "Pierre angulaire",
    badge: "Grand Architecte"
  },
  {
    id: 35,
    chapter: "Chapitre 8 · Les Archives interdites",
    title: "Les Cases vides",
    pitch: "Le trésor rendu, le Conseil t'ouvre les <em>Archives interdites</em>. L'archiviste déteste les cases vides : « Un NULL dans un registre, c'est une tache d'encre ! » Au chapitre 3, le LEFT JOIN laissait des cases vides. Aujourd'hui, tu vas les remplir.",
    mission: "Affiche le <code>nom</code> de chaque héros et le <code>nom</code> de ses sorts. Les héros sans sort doivent apparaître avec le texte <b>'Aucun sort'</b>.",
    concept: ["LEFT JOIN", "COALESCE()"],
    starter: "-- Explore : quelle case est vide ?\nSELECT heros.nom, sorts.nom\nFROM heros\nLEFT JOIN sorts ON sorts.num_heros = heros.id;",
    expected: "SELECT heros.nom, COALESCE(sorts.nom, 'Aucun sort') FROM heros LEFT JOIN sorts ON sorts.num_heros = heros.id;",
    ordered: false,
    hints: [
      "Le LEFT JOIN garde Borin, mais sa case sort est NULL.",
      "<code>COALESCE(a, b)</code> donne <code>a</code>, ou <code>b</code> si <code>a</code> est vide. Remplace <code>sorts.nom</code> par <code>COALESCE(sorts.nom, 'Aucun sort')</code>.",
      "La formule complète : <code>SELECT heros.nom, COALESCE(sorts.nom, 'Aucun sort') FROM heros LEFT JOIN sorts ON sorts.num_heros = heros.id;</code>"
    ],
    xp: 300,
    item: "Encrier de l'archiviste",
    badge: "Archiviste"
  },
  {
    id: 36,
    chapter: "Chapitre 8 · Les Archives interdites",
    title: "Les Étiquettes gravées",
    pitch: "Les noms des héros doivent être gravés sur des plaques de bronze. Le graveur veut chaque nom <em>en majuscules</em>, et le <em>nombre de lettres</em> pour savoir combien de bronze prévoir. SQL sait travailler le texte, pas seulement les nombres.",
    mission: "Affiche, pour chaque héros, son <code>nom</code> <b>en majuscules</b> et le <b>nombre de lettres</b> de son <code>nom</code>.",
    concept: ["UPPER()", "LENGTH()"],
    starter: "SELECT nom\nFROM heros;",
    expected: "SELECT UPPER(nom), LENGTH(nom) FROM heros;",
    ordered: false,
    hints: [
      "<code>UPPER(nom)</code> écrit le nom en majuscules. <code>LENGTH(nom)</code> compte ses caractères.",
      "Deux colonnes calculées, séparées par une virgule : <code>SELECT UPPER(nom), LENGTH(nom) FROM heros;</code> Petite surprise : la base ne met pas en majuscules les lettres accentuées.",
      "La formule complète : <code>SELECT UPPER(nom), LENGTH(nom) FROM heros;</code>"
    ],
    xp: 300,
    item: "Burin du graveur",
    badge: null
  },
  {
    id: 37,
    chapter: "Chapitre 8 · Les Archives interdites",
    title: "La Liste préparée",
    pitch: "L'archiviste range ses recherches en <em>étapes</em> : d'abord une liste préparée à part, nommée, puis on s'en sert comme d'une table. C'est le sort <code>WITH</code>, idéal quand une requête devient trop longue à lire d'un bloc.",
    mission: "Avec <code>WITH</code>, prépare une liste <code>riches</code> des héros dont la <code>fortune</code> est <b>≥ 300</b>, puis affiche le <code>nom</code> de chacun et le <code>nom</code> de son château.",
    concept: ["WITH … AS ( … )", "JOIN"],
    starter: "WITH riches AS (\n  SELECT * FROM heros WHERE fortune >= 300\n)\nSELECT ",
    expected: "WITH riches AS (SELECT * FROM heros WHERE fortune >= 300) SELECT riches.nom, chateaux.nom FROM riches JOIN chateaux ON riches.num_chateau = chateaux.id;",
    ordered: false,
    hints: [
      "Une fois préparée, <code>riches</code> s'utilise exactement comme une table : <code>FROM riches</code>.",
      "Relie-la aux châteaux : <code>FROM riches JOIN chateaux ON riches.num_chateau = chateaux.id</code>.",
      "La formule complète : <code>WITH riches AS (SELECT * FROM heros WHERE fortune &gt;= 300) SELECT riches.nom, chateaux.nom FROM riches JOIN chateaux ON riches.num_chateau = chateaux.id;</code>"
    ],
    xp: 320,
    item: "Marque-page enchanté",
    badge: null
  },
  {
    id: 38,
    chapter: "Chapitre 8 · Les Archives interdites",
    title: "Le Podium des Sorts",
    pitch: "Le Conseil organise le tournoi des sortilèges. Chaque sort reçoit un <em>rang</em> : 1 pour le plus puissant, 2 pour le suivant… Contrairement à ORDER BY qui ne fait que ranger, <code>RANK()</code> <em>écrit</em> la place de chacun dans une colonne.",
    mission: "Affiche le <code>nom</code>, la <code>puissance</code> et le <b>rang</b> de chaque sort (1 = le plus puissant), dans une colonne nommée <code>rang</code>.",
    concept: ["RANK() OVER (ORDER BY …)", "AS"],
    starter: "SELECT nom, puissance,\n  RANK() OVER (ORDER BY ) AS rang\nFROM sorts;",
    expected: "SELECT nom, puissance, RANK() OVER (ORDER BY puissance DESC) AS rang FROM sorts;",
    ordered: false,
    hints: [
      "<code>RANK() OVER ( … )</code> : entre les parenthèses du OVER, tu dis comment classer.",
      "Le plus puissant doit avoir le rang 1 : <code>ORDER BY puissance DESC</code> dans le OVER.",
      "La formule complète : <code>SELECT nom, puissance, RANK() OVER (ORDER BY puissance DESC) AS rang FROM sorts;</code>"
    ],
    xp: 330,
    item: "Médaille du tournoi",
    badge: null
  },
  {
    id: 39,
    chapter: "Chapitre 8 · Les Archives interdites",
    title: "Boss final : les Champions des Écoles",
    pitch: "Ultime épreuve. Le Conseil ne veut plus un seul podium mais <em>un podium par école de magie</em>, et seulement les <em>vainqueurs</em>. Il te faudra tout ton savoir : une liste préparée avec WITH, un rang <em>par école</em> avec PARTITION BY, puis un filtre sur ce rang.",
    mission: "Affiche l'<code>ecole</code>, le <code>nom</code> et la <code>puissance</code> du sort <b>le plus puissant de chaque école</b>, en passant par une liste préparée <code>classement</code> qui contient un <code>rang</code> calculé avec <b>RANK() OVER (PARTITION BY ecole …)</b>.",
    concept: ["WITH", "RANK() OVER", "PARTITION BY"],
    starter: "WITH classement AS (\n  SELECT ecole, nom, puissance,\n    RANK() OVER (PARTITION BY ecole ORDER BY puissance DESC) AS rang\n  FROM sorts\n)\nSELECT ",
    expected: "WITH classement AS (SELECT ecole, nom, puissance, RANK() OVER (PARTITION BY ecole ORDER BY puissance DESC) AS rang FROM sorts) SELECT ecole, nom, puissance FROM classement WHERE rang = 1;",
    ordered: false,
    hints: [
      "<code>PARTITION BY ecole</code> recommence le classement à 1 pour chaque école : un podium par tas, comme GROUP BY mais sans fusionner les lignes.",
      "On ne peut pas filtrer un rang dans le WHERE du même SELECT : d'où la liste préparée. Termine par <code>SELECT ecole, nom, puissance FROM classement WHERE rang = 1;</code>",
      "La formule complète : <code>WITH classement AS (SELECT ecole, nom, puissance, RANK() OVER (PARTITION BY ecole ORDER BY puissance DESC) AS rang FROM sorts) SELECT ecole, nom, puissance FROM classement WHERE rang = 1;</code>"
    ],
    xp: 600,
    item: "Couronne du Grimoire",
    badge: "Maître du Grimoire"
  }
];

const MAX_HP = 5, START_SCROLLS = 3;
const KEYWORDS = {
  base: ["SELECT", "*", "FROM", "WHERE", "AND", "ORDER BY", "DESC", "LIMIT", ";"],
  ch2:  ["COUNT(*)", "SUM()", "AS", "GROUP BY", "JOIN", "ON"],
  ch3:  ["LEFT JOIN", "IS NULL", "HAVING", "AVG()", "IN", "( )"],
  ch4:  ["INSERT INTO", "VALUES", "UPDATE", "SET", "DELETE FROM"],
  ch5:  ["DISTINCT", "LIKE", "'%'", "NOT", "CASE", "WHEN", "THEN", "ELSE", "END"],
  ch6:  ["OR", "BETWEEN", "MIN()", "MAX()", "( )"],
  ch7:  ["CREATE TABLE", "INTEGER", "TEXT", "PRIMARY KEY", "ALTER TABLE", "ADD COLUMN", "DROP TABLE"],
  ch8:  ["COALESCE()", "UPPER()", "LENGTH()", "WITH", "RANK() OVER", "PARTITION BY"]
};
const keywordsFor = (L) => ((n) => [...KEYWORDS.base, ...(n >= 5 ? KEYWORDS.ch2 : []), ...(n >= 10 ? KEYWORDS.ch3 : []), ...(n >= 15 ? KEYWORDS.ch4 : []), ...(n >= 20 ? KEYWORDS.ch5 : []), ...(n >= 25 ? KEYWORDS.ch6 : []), ...(n >= 30 ? KEYWORDS.ch7 : []), ...(n >= 35 ? KEYWORDS.ch8 : [])])(L.kwId !== undefined ? L.kwId : L.id);

/* ---------------------------------------------------------------------
   COMPRENDRE POURQUOI : pour chaque mission
   - lesson   : le savoir du grimoire, lu avant d'écrire (le « pourquoi » de la notion)
   - steps    : la décomposition du sort, dans l'ordre où la base l'exécute vraiment.
                Chaque étape lance une requête intermédiaire et montre son résultat réel.
   - takeaway : la phrase à retenir, affichée sur la carte de victoire
   --------------------------------------------------------------------- */
const PEDAGOGY = {
  0: {
    lesson: "Une table, c'est un tableau, comme dans un tableur : clique sur « Voir ses 6 lignes » sous <code>heros</code>, dans le panneau des tables, pour la voir. Une base de données range l'information en <b>tables</b>, comme un registre : chaque <b>ligne</b> est un héros, chaque <b>colonne</b> une de ses caractéristiques. <code>SELECT</code> dit <i>quoi montrer</i>, <code>FROM</code> dit <i>où chercher</i>. On écrit SELECT en premier, mais la base lit d'abord FROM : elle ouvre le registre avant de choisir ce qu'elle montre.",
    steps: [
      { clause: "FROM", sql: "SELECT * FROM heros", why: "La base ouvre la table heros. <code>*</code> garde toutes les colonnes et rien ne filtre les lignes : on obtient le registre complet." }
    ],
    takeaway: "SELECT choisit les colonnes, FROM choisit la table, et la base lit FROM en premier."
  },
  1: {
    lesson: "Afficher tout est rarement utile : une vraie table peut avoir 50 colonnes et des millions de lignes. Nommer les colonnes rend le résultat lisible et la requête plus rapide. Les colonnes s'affichent dans l'ordre où tu les écris.",
    steps: [
      { clause: "FROM", sql: "SELECT * FROM heros", why: "La base charge la table : 6 lignes, 7 colonnes." },
      { clause: "SELECT", sql: "SELECT nom, classe FROM heros", why: "Elle ne garde que 2 colonnes sur 7. Les 6 lignes sont toujours là : <b>SELECT ne retire jamais de lignes</b>, il choisit seulement les colonnes." }
    ],
    takeaway: "SELECT réduit les colonnes, jamais les lignes."
  },
  2: {
    lesson: "<code>WHERE</code> est un tamis : la base examine <b>chaque ligne, une par une</b>, et ne garde que celles où la condition est vraie. Le texte se compare caractère par caractère : pour <code>=</code>, 'Forêt Sombre' et 'foret sombre' sont deux textes différents. Les apostrophes signalent un texte ; sans elles, la base croit lire un nom de colonne.",
    steps: [
      { clause: "FROM", sql: "SELECT * FROM monstres", why: "La base charge les 9 monstres du royaume." },
      { clause: "WHERE", sql: "SELECT * FROM monstres WHERE region = 'Forêt Sombre'", why: "Chaque ligne passe le test <code>region = 'Forêt Sombre'</code>. 5 réussissent, 4 sont écartées." },
      { clause: "SELECT", sql: "SELECT nom, pv FROM monstres WHERE region = 'Forêt Sombre'", why: "Ensuite seulement, on garde 2 colonnes. Comme WHERE passe <b>avant</b> SELECT, on peut filtrer sur <code>region</code> sans l'afficher." }
    ],
    takeaway: "WHERE filtre les lignes avant que SELECT choisisse les colonnes."
  },
  3: {
    lesson: "Une table n'a <b>pas d'ordre garanti</b> : sans <code>ORDER BY</code>, la base rend les lignes dans l'ordre qui l'arrange. <code>ORDER BY</code> trie (croissant par défaut, <code>DESC</code> pour décroissant), <code>LIMIT</code> coupe après N lignes. Il faut trier <i>avant</i> de couper, sinon on garderait 3 sorts au hasard.",
    steps: [
      { clause: "FROM", sql: "SELECT * FROM sorts", why: "8 sorts, dans l'ordre de rangement de la table, qui ne veut rien dire." },
      { clause: "ORDER BY", sql: "SELECT * FROM sorts ORDER BY puissance DESC", why: "Les 8 sorts sont classés du plus puissant au plus faible." },
      { clause: "LIMIT", sql: "SELECT * FROM sorts ORDER BY puissance DESC LIMIT 3", why: "On garde les 3 premières lignes du classement : le podium." },
      { clause: "SELECT", sql: "SELECT nom, puissance FROM sorts ORDER BY puissance DESC LIMIT 3", why: "Puis on n'affiche que le nom et la puissance." }
    ],
    takeaway: "ORDER BY puis LIMIT : c'est la recette de tout « top N »."
  },
  4: {
    lesson: "<code>AND</code> exige que les deux conditions soient vraies <b>pour la même ligne</b> (<code>OR</code> se contenterait d'une seule). La base applique toujours les clauses dans le même ordre : <b>FROM → WHERE → SELECT → ORDER BY</b>. Connaître cet ordre explique la plupart des erreurs.",
    steps: [
      { clause: "FROM", sql: "SELECT * FROM monstres", why: "Les 9 monstres." },
      { clause: "WHERE", sql: "SELECT * FROM monstres WHERE region = 'Forêt Sombre'", why: "Première condition : 5 monstres de la forêt." },
      { clause: "WHERE … AND", sql: "SELECT * FROM monstres WHERE region = 'Forêt Sombre' AND pv > 50", why: "Deuxième condition sur les mêmes lignes : le Champignon (20 PV) et le Gobelin (30 PV) tombent. Il en reste 3." },
      { clause: "ORDER BY", sql: "SELECT * FROM monstres WHERE region = 'Forêt Sombre' AND pv > 50 ORDER BY pv DESC", why: "Les 3 survivants sont classés du plus coriace au plus fragile." },
      { clause: "SELECT", sql: "SELECT nom, pv FROM monstres WHERE region = 'Forêt Sombre' AND pv > 50 ORDER BY pv DESC", why: "On n'affiche que le nom et les PV." }
    ],
    takeaway: "Chaque condition ajoutée avec AND resserre le tamis."
  },
  5: {
    lesson: "Les fonctions d'agrégat (<code>COUNT</code>, <code>SUM</code>, <code>AVG</code>…) <b>écrasent plusieurs lignes en une seule valeur</b>. <code>COUNT(*)</code> compte les lignes qui ont survécu au WHERE. <code>AS</code> colle une étiquette lisible sur le résultat.",
    steps: [
      { clause: "FROM", sql: "SELECT nom, classe FROM heros", why: "Les 6 héros." },
      { clause: "WHERE", sql: "SELECT nom, classe FROM heros WHERE classe = 'Mage'", why: "Le filtre ne laisse passer que 2 mages : Lyra et Gédéon." },
      { clause: "COUNT(*)", sql: "SELECT COUNT(*) AS nb_mages FROM heros WHERE classe = 'Mage'", why: "Les 2 lignes restantes sont fusionnées en une seule ligne qui contient le nombre 2." }
    ],
    takeaway: "Un agrégat transforme N lignes en une seule valeur."
  },
  6: {
    lesson: "<code>GROUP BY</code> range les lignes en <b>paquets</b> qui partagent la même valeur (ici la même région). L'agrégat s'applique ensuite à chaque paquet séparément. Sans GROUP BY, tout le monde serait dans un seul paquet. Une colonne affichée à côté d'un agrégat doit être dans le GROUP BY : sinon, la base ne saurait pas quelle valeur montrer pour le paquet.",
    steps: [
      { clause: "FROM", sql: "SELECT region, nom FROM monstres", why: "Les 9 monstres, régions mélangées." },
      { clause: "GROUP BY", sql: "SELECT region, nom FROM monstres ORDER BY region", why: "Rangés par région, on voit les paquets se former : 1 dans la crypte, 5 en forêt, 2 au marais, 1 dans les pics." },
      { clause: "COUNT(*)", sql: "SELECT region, COUNT(*) FROM monstres GROUP BY region", why: "Chaque paquet devient une seule ligne : sa région et son nombre de monstres." }
    ],
    takeaway: "GROUP BY donne une ligne de résultat par paquet."
  },
  7: {
    lesson: "Une base évite de répéter l'information : au lieu d'écrire le nom du château dans chaque héros, elle stocke un <b>numéro</b> (<code>num_chateau</code>) qui pointe vers la table <code>chateaux</code>. C'est une <b>clé étrangère</b>. <code>JOIN … ON</code> recolle les deux tables en associant chaque héros à la ligne de chateaux dont l'<code>id</code> correspond. Avantage : si un château change de nom, on le corrige à un seul endroit.",
    steps: [
      { clause: "FROM heros", sql: "SELECT nom, num_chateau FROM heros", why: "Les héros ne connaissent que des numéros de château." },
      { clause: "chateaux", sql: "SELECT id, nom FROM chateaux", why: "La table chateaux fait le lien entre chaque numéro et un nom." },
      { clause: "JOIN … ON", sql: "SELECT heros.nom, heros.num_chateau, chateaux.id, chateaux.nom FROM heros JOIN chateaux ON heros.num_chateau = chateaux.id", why: "Chaque héros est collé à la ligne de chateaux qui porte le même numéro : regarde les deux colonnes du milieu, elles sont toujours égales." },
      { clause: "SELECT", sql: "SELECT heros.nom, chateaux.nom FROM heros JOIN chateaux ON heros.num_chateau = chateaux.id", why: "On ne garde que les deux noms. Le préfixe <code>heros.</code> ou <code>chateaux.</code> lève l'ambiguïté entre les deux colonnes <code>nom</code>." }
    ],
    takeaway: "JOIN … ON relie deux tables par la colonne qu'elles partagent."
  },
  8: {
    lesson: "Après un JOIN, tout se passe comme si on avait <b>une seule grande table</b> : on peut filtrer sur n'importe quelle colonne des deux côtés. Ici la rareté est dans <code>inventaire</code> et le nom du porteur dans <code>heros</code>. Aucune des deux tables ne suffit seule.",
    steps: [
      { clause: "FROM", sql: "SELECT objet, rarete, num_heros FROM inventaire", why: "8 objets, mais leurs porteurs ne sont que des numéros." },
      { clause: "JOIN", sql: "SELECT inventaire.objet, inventaire.rarete, heros.nom FROM inventaire JOIN heros ON inventaire.num_heros = heros.id", why: "Le JOIN remplace chaque numéro par un vrai héros." },
      { clause: "WHERE", sql: "SELECT inventaire.objet, inventaire.rarete, heros.nom FROM inventaire JOIN heros ON inventaire.num_heros = heros.id WHERE inventaire.rarete = 'Légendaire'", why: "Le filtre s'applique à la table combinée : 2 objets légendaires restent." }
    ],
    takeaway: "On relie d'abord avec JOIN, puis on filtre la table combinée avec WHERE."
  },
  9: {
    lesson: "Ce boss enchaîne tout : relier (<code>JOIN</code>), regrouper (<code>GROUP BY</code>), additionner (<code>SUM</code>), classer (<code>ORDER BY</code>). On peut trier sur l'alias <code>total</code> parce que ORDER BY s'exécute <b>après</b> SELECT : l'alias existe déjà. À l'inverse, WHERE s'exécute avant SELECT et ne le connaît pas encore.",
    steps: [
      { clause: "JOIN", sql: "SELECT chateaux.nom, heros.nom, heros.fortune FROM chateaux JOIN heros ON heros.num_chateau = chateaux.id", why: "Chaque héros apparaît avec son château et son or." },
      { clause: "GROUP BY + SUM", sql: "SELECT chateaux.nom, SUM(heros.fortune) AS total FROM chateaux JOIN heros ON heros.num_chateau = chateaux.id GROUP BY chateaux.nom", why: "Un paquet par château, et l'or de ses héros est additionné. Kael apporte à lui seul 1200 pièces à la Tour Penchée." },
      { clause: "ORDER BY", sql: "SELECT chateaux.nom, SUM(heros.fortune) AS total FROM chateaux JOIN heros ON heros.num_chateau = chateaux.id GROUP BY chateaux.nom ORDER BY total DESC", why: "Le classement utilise l'alias <code>total</code>, calculé juste avant." }
    ],
    takeaway: "ORDER BY voit les alias de SELECT ; WHERE ne les voit pas."
  },
  10: {
    lesson: "Un <code>JOIN</code> classique ne garde que les lignes qui ont trouvé un partenaire : un héros sans sort n'a aucune ligne dans sorts, donc il disparaît. <code>LEFT JOIN</code> garde <b>toutes</b> les lignes de la table de gauche et remplit les trous avec <code>NULL</code>, qui veut dire « aucune valeur ». NULL n'est égal à rien, pas même à NULL : c'est pourquoi on le teste avec <code>IS NULL</code>.",
    steps: [
      { clause: "JOIN", sql: "SELECT heros.nom, sorts.nom FROM heros JOIN sorts ON sorts.num_heros = heros.id", why: "8 lignes, et Borin n'y est pas : il n'a aucun sort, donc aucun partenaire." },
      { clause: "LEFT JOIN", sql: "SELECT heros.nom, sorts.nom, sorts.id FROM heros LEFT JOIN sorts ON sorts.num_heros = heros.id", why: "9 lignes : Borin revient, avec NULL à la place du sort." },
      { clause: "WHERE … IS NULL", sql: "SELECT heros.nom FROM heros LEFT JOIN sorts ON sorts.num_heros = heros.id WHERE sorts.id IS NULL", why: "On ne garde que les trous : les héros sans aucun sort." }
    ],
    takeaway: "LEFT JOIN + IS NULL permet de trouver ce qui manque."
  },
  11: {
    lesson: "<code>WHERE</code> et <code>HAVING</code> filtrent tous les deux, mais pas au même moment. WHERE trie les <b>lignes</b> avant le regroupement : il ne connaît pas encore les totaux. HAVING trie les <b>groupes</b> après : il peut utiliser COUNT, SUM ou AVG. Ordre complet : <b>FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY</b>.",
    steps: [
      { clause: "JOIN", sql: "SELECT heros.nom, sorts.nom FROM heros JOIN sorts ON sorts.num_heros = heros.id", why: "Une ligne par couple héros-sort : 8 lignes." },
      { clause: "GROUP BY", sql: "SELECT heros.nom, COUNT(*) AS nb_sorts FROM heros JOIN sorts ON sorts.num_heros = heros.id GROUP BY heros.nom", why: "Un paquet par héros, avec son nombre de sorts : 5 groupes." },
      { clause: "HAVING", sql: "SELECT heros.nom, COUNT(*) AS nb_sorts FROM heros JOIN sorts ON sorts.num_heros = heros.id GROUP BY heros.nom HAVING COUNT(*) >= 2", why: "HAVING écarte les groupes trop petits. Un WHERE ne pourrait pas le faire : au moment du WHERE, les sorts ne sont pas encore comptés." }
    ],
    takeaway: "WHERE filtre les lignes, HAVING filtre les groupes."
  },
  12: {
    lesson: "Une <b>sous-requête</b> est une requête dans la requête. La base calcule d'abord celle entre parenthèses, puis utilise son résultat comme une valeur ordinaire. Impossible d'écrire <code>pv &gt; AVG(pv)</code> directement : WHERE examine les lignes une par une, alors qu'une moyenne a besoin de toutes les lignes à la fois.",
    steps: [
      { clause: "( sous-requête )", sql: "SELECT AVG(pv) AS moyenne FROM monstres", why: "Calculée en premier : la moyenne des PV vaut environ 86,1." },
      { clause: "WHERE", sql: "SELECT nom, pv FROM monstres WHERE pv > (SELECT AVG(pv) FROM monstres)", why: "Pour la requête principale, c'est comme si on avait écrit <code>pv &gt; 86.1</code>. 4 monstres dépassent ce seuil." }
    ],
    takeaway: "La sous-requête est calculée en premier, puis sert de valeur."
  },
  13: {
    lesson: "<code>IN</code> teste l'appartenance à une liste, comme <code>num_heros IN (3, 6)</code>. Une sous-requête peut fabriquer cette liste à la volée. C'est souvent plus lisible qu'un JOIN quand on n'a pas besoin d'afficher les colonnes de l'autre table.",
    steps: [
      { clause: "( sous-requête )", sql: "SELECT id, nom FROM heros WHERE classe = 'Mage'", why: "La sous-requête fabrique la liste des ids de mages : 3 et 6." },
      { clause: "WHERE … IN", sql: "SELECT objet, num_heros FROM inventaire WHERE num_heros IN (SELECT id FROM heros WHERE classe = 'Mage')", why: "Seuls les objets dont le num_heros figure dans cette liste passent. On affiche ici num_heros pour le vérifier." }
    ],
    takeaway: "IN (sous-requête) filtre à partir d'une liste calculée."
  },
  14: {
    lesson: "Synthèse du chapitre : <code>GROUP BY</code> fait un paquet par école, <code>AVG</code> calcule la moyenne de chaque paquet, la sous-requête calcule la moyenne générale, et <code>HAVING</code> compare les deux. Pour une école qui n'a qu'un sort, la moyenne est simplement la puissance de ce sort.",
    steps: [
      { clause: "( sous-requête )", sql: "SELECT AVG(puissance) AS moyenne_generale FROM sorts", why: "La moyenne de tous les sorts : 56,25." },
      { clause: "GROUP BY + AVG", sql: "SELECT ecole, AVG(puissance) AS moyenne FROM sorts GROUP BY ecole", why: "La moyenne de chaque école. Le Feu est tiré vers le bas par l'Étincelle Ratée (5)." },
      { clause: "HAVING", sql: "SELECT ecole, AVG(puissance) AS moyenne FROM sorts GROUP BY ecole HAVING AVG(puissance) > (SELECT AVG(puissance) FROM sorts)", why: "Seules les écoles au-dessus de 56,25 restent." },
      { clause: "ORDER BY", sql: "SELECT ecole, AVG(puissance) AS moyenne FROM sorts GROUP BY ecole HAVING AVG(puissance) > (SELECT AVG(puissance) FROM sorts) ORDER BY moyenne DESC", why: "Classées de la plus forte à la plus faible." }
    ],
    takeaway: "Une sous-requête dans un HAVING compare chaque groupe à l'ensemble."
  },
  15: {
    lesson: "<code>INSERT</code> ajoute une ligne. On liste les colonnes, puis les valeurs <b>dans le même ordre</b> : la base les associe par position, pas par nom. Lister les colonnes protège ta requête : si quelqu'un ajoute une colonne demain, ton INSERT fonctionne toujours. L'<code>id</code> doit être unique : c'est la <b>clé primaire</b>, l'identité de la ligne.",
    steps: [
      { clause: "avant", sql: "SELECT * FROM heros", why: "Le registre compte 6 héros. Les ids 1 à 6 sont pris, donc Tilda reçoit le 7." },
      { clause: "INSERT", sql: "INSERT INTO heros (id, nom, classe, niveau, pv, fortune, num_chateau) VALUES (7, 'Tilda Marteau-Vif', 'Forgeronne', 1, 100, 0, 2); SELECT * FROM heros", why: "Une 7e ligne apparaît. Son <code>num_chateau</code> vaut 2 : elle est rattachée au Fort Roc-Tonnerre, comme un JOIN le confirmerait." }
    ],
    takeaway: "INSERT associe les valeurs aux colonnes par position."
  },
  16: {
    lesson: "Un seul <code>INSERT</code> peut ajouter plusieurs lignes, séparées par des virgules. <code>num_heros = 7</code> rattache les objets à Tilda : c'est la clé étrangère du chapitre 2, vue cette fois du côté de l'écriture.",
    steps: [
      { clause: "INSERT", sql: "INSERT INTO inventaire (id, objet, rarete, valeur, num_heros) VALUES (9, 'Marteau Runique', 'Rare', 600, 7), (10, 'Enclume de Poche', 'Commun', 40, 7); SELECT * FROM inventaire", why: "Deux lignes ajoutées en une seule instruction : 10 objets au total." },
      { clause: "vérification", sql: "INSERT INTO inventaire (id, objet, rarete, valeur, num_heros) VALUES (9, 'Marteau Runique', 'Rare', 600, 7), (10, 'Enclume de Poche', 'Commun', 40, 7); SELECT inventaire.objet, heros.nom FROM inventaire JOIN heros ON inventaire.num_heros = heros.id WHERE heros.id = 7", why: "Un JOIN le prouve : les deux objets appartiennent bien à Tilda." }
    ],
    takeaway: "La clé étrangère relie une nouvelle ligne à une ligne existante."
  },
  17: {
    lesson: "<code>UPDATE</code> modifie des lignes existantes : <code>SET</code> dit <i>quoi changer</i>, <code>WHERE</code> dit <i>où</i>. Ce WHERE fonctionne exactement comme celui d'un SELECT. On peut donc toujours tester sa cible avec un SELECT avant. Sans WHERE, la cible est « toutes les lignes ». <code>fortune = fortune + 150</code> lit l'ancienne valeur, ajoute 150 et réécrit le résultat.",
    steps: [
      { clause: "cible (WHERE)", sql: "SELECT nom, fortune FROM heros WHERE nom = 'Borin Barbe-de-Fer'", why: "Le même WHERE dans un SELECT montre la cible : Borin, 75 pièces." },
      { clause: "UPDATE … SET", sql: "UPDATE heros SET fortune = fortune + 150 WHERE nom = 'Borin Barbe-de-Fer'; SELECT nom, fortune FROM heros", why: "Seul Borin change : 75 + 150 = 225. Les autres héros ne sont pas touchés." },
      { clause: "sans WHERE ?", sql: "UPDATE heros SET fortune = fortune + 150; SELECT nom, fortune FROM heros", why: "Contre-exemple : sans WHERE, les 7 héros sont payés. C'est la faillite redoutée du trésorier." }
    ],
    takeaway: "Teste toujours le WHERE d'un UPDATE avec un SELECT d'abord."
  },
  18: {
    lesson: "<code>DELETE</code> supprime des lignes entières. Pour vider une seule valeur, on ferait plutôt <code>UPDATE … SET colonne = NULL</code>. Il n'y a <b>pas de corbeille</b> : dans une vraie base, un DELETE sans WHERE vide toute la table. D'où le réflexe des pros : écrire d'abord le SELECT avec le même WHERE, vérifier, puis remplacer <code>SELECT *</code> par <code>DELETE</code>.",
    steps: [
      { clause: "cible (WHERE)", sql: "SELECT * FROM inventaire WHERE rarete = 'Commun' AND valeur < 10", why: "Les victimes désignées : la Bourse Trouée (1) et la Potion Douteuse (3)." },
      { clause: "DELETE", sql: "DELETE FROM inventaire WHERE rarete = 'Commun' AND valeur < 10; SELECT * FROM inventaire", why: "8 objets au lieu de 10. L'Enclume de Poche, commune mais à 40 pièces, échappe au creuset grâce au <code>AND</code>." }
    ],
    takeaway: "SELECT d'abord, DELETE ensuite, avec exactement le même WHERE."
  },
  19: {
    lesson: "Plusieurs instructions séparées par <code>;</code> s'exécutent l'une après l'autre. La sous-requête de l'UPDATE retrouve l'id du fort à partir de son <b>nom</b> : si un jour les numéros changent, ta requête reste juste. Désigner les choses par leur nom plutôt que par un numéro magique, c'est écrire une requête qui explique son intention.",
    steps: [
      { clause: "( sous-requête )", sql: "SELECT id, nom FROM chateaux WHERE nom = 'Fort Roc-Tonnerre'", why: "Le nom mène à l'id 2." },
      { clause: "cible", sql: "SELECT nom, niveau FROM heros WHERE num_chateau = (SELECT id FROM chateaux WHERE nom = 'Fort Roc-Tonnerre')", why: "Les héros du fort avant la forge : Borin, Mira et Tilda." },
      { clause: "INSERT ; UPDATE", sql: "INSERT INTO inventaire (id, objet, rarete, valeur, num_heros) VALUES (11, 'Lame des Alliances', 'Légendaire', 9000, 7); UPDATE heros SET niveau = niveau + 2 WHERE num_chateau = (SELECT id FROM chateaux WHERE nom = 'Fort Roc-Tonnerre'); SELECT nom, niveau FROM heros", why: "Après les deux instructions, ces trois héros ont gagné 2 niveaux. Les autres n'ont pas bougé." }
    ],
    takeaway: "Une sous-requête par le nom vaut mieux qu'un numéro écrit en dur."
  },
  20: {
    lesson: "<code>DISTINCT</code> retire les lignes en double <b>du résultat</b>, pas de la table. Deux lignes sont des doublons si <b>toutes</b> leurs colonnes affichées sont identiques. Avec <code>SELECT DISTINCT ecole, nom</code>, plus rien ne serait retiré, car chaque sort a un nom différent.",
    steps: [
      { clause: "SELECT", sql: "SELECT ecole FROM sorts", why: "Une ligne par sort : 8 lignes, avec Feu, Lumière et Nature en double." },
      { clause: "DISTINCT", sql: "SELECT DISTINCT ecole FROM sorts", why: "Les doublons sont fusionnés : il reste 5 écoles." },
      { clause: "piège", sql: "SELECT DISTINCT ecole, nom FROM sorts", why: "Contre-exemple : avec une colonne de plus, chaque ligne devient unique et DISTINCT ne retire plus rien." }
    ],
    takeaway: "DISTINCT compare des lignes entières du résultat."
  },
  21: {
    lesson: "<code>=</code> compare un texte <b>en entier</b>. <code>LIKE</code> le compare à un <b>motif</b> : <code>%</code> remplace n'importe quelle suite de caractères (même vide) et <code>_</code> remplace exactement un caractère. En SQLite, LIKE ignore les majuscules des lettres sans accent : c'est pourquoi <code>'l%'</code> marche aussi.",
    steps: [
      { clause: "= 'L'", sql: "SELECT nom FROM monstres WHERE nom = 'L'", why: "Aucun monstre ne s'appelle exactement « L » : le résultat est vide." },
      { clause: "LIKE 'L%'", sql: "SELECT nom FROM monstres WHERE nom LIKE 'L%'", why: "« L suivi de n'importe quoi » : Loup Spectral et Liche Mineure." },
      { clause: "LIKE '%L%'", sql: "SELECT nom FROM monstres WHERE nom LIKE '%l%'", why: "Pour comparer : « contient un L n'importe où » attrape beaucoup plus de monstres. La place du % change tout." }
    ],
    takeaway: "Le % de LIKE remplace « n'importe quoi » ; sa position change le sens."
  },
  22: {
    lesson: "<code>CASE</code> est le « si… alors… sinon » du SQL. Il est calculé <b>pour chaque ligne</b> et crée une colonne qui n'existe pas dans la table. Les <code>WHEN</code> sont testés dans l'ordre et la base s'arrête au <b>premier vrai</b>. Avec danger = 8, le test « ≥ 4 » est déjà vrai : s'il passe en premier, la Liche serait seulement « Dangereuse ».",
    steps: [
      { clause: "FROM", sql: "SELECT nom, danger FROM monstres", why: "Les chiffres bruts de danger, de 1 à 9." },
      { clause: "CASE", sql: "SELECT nom, danger, CASE WHEN danger >= 7 THEN 'Mortel' WHEN danger >= 4 THEN 'Dangereux' ELSE 'Inoffensif' END AS menace FROM monstres", why: "Chaque ligne reçoit son étiquette. La colonne danger reste affichée pour vérifier." },
      { clause: "piège", sql: "SELECT nom, danger, CASE WHEN danger >= 4 THEN 'Dangereux' WHEN danger >= 7 THEN 'Mortel' ELSE 'Inoffensif' END AS menace_mal_ordonnee FROM monstres", why: "Contre-exemple avec les WHEN inversés : plus aucun monstre n'est « Mortel », car « ≥ 4 » répond toujours en premier." }
    ],
    takeaway: "Dans un CASE, le premier WHEN vrai l'emporte : le plus strict d'abord."
  },
  23: {
    lesson: "On peut regrouper sur une <b>valeur calculée</b> : CASE fabrique une étiquette pour chaque ligne, puis GROUP BY fait un paquet par étiquette. C'est la base de presque tous les tableaux de bord : ranger les données en catégories, puis compter.",
    steps: [
      { clause: "CASE", sql: "SELECT nom, fortune, CASE WHEN fortune >= 300 THEN 'Riche' ELSE 'Modeste' END AS fortune FROM heros", why: "Chaque héros reçoit son étiquette selon son or." },
      { clause: "GROUP BY", sql: "SELECT CASE WHEN fortune >= 300 THEN 'Riche' ELSE 'Modeste' END AS fortune, COUNT(*) AS nb FROM heros GROUP BY fortune", why: "Un paquet par étiquette : 3 riches, 3 modestes." }
    ],
    takeaway: "CASE puis GROUP BY : ranger en catégories, puis compter."
  },
  24: {
    lesson: "Le boss final assemble tout le parcours. Lis-le dans l'ordre où la base l'exécute : <b>FROM/JOIN</b> réunit héros et châteaux, <b>WHERE</b> écarte la Tour, <b>SELECT</b> calcule le titre, <b>ORDER BY</b> classe. <code>NOT</code> inverse une condition : <code>NOT LIKE 'Tour%'</code> garde tout ce qui ne commence pas par « Tour ».",
    steps: [
      { clause: "JOIN", sql: "SELECT heros.nom, chateaux.nom, heros.niveau FROM heros JOIN chateaux ON heros.num_chateau = chateaux.id", why: "Les 6 héros avec leur château." },
      { clause: "WHERE NOT LIKE", sql: "SELECT heros.nom, chateaux.nom, heros.niveau FROM heros JOIN chateaux ON heros.num_chateau = chateaux.id WHERE chateaux.nom NOT LIKE 'Tour%'", why: "Kael et Gédéon, de la Tour Penchée, sont écartés. Il en reste 4." },
      { clause: "SELECT + CASE", sql: "SELECT heros.nom, chateaux.nom, heros.niveau, CASE WHEN heros.niveau >= 10 THEN 'Champion' ELSE 'Écuyer' END AS titre FROM heros JOIN chateaux ON heros.num_chateau = chateaux.id WHERE chateaux.nom NOT LIKE 'Tour%'", why: "Le titre est calculé ligne par ligne : seul Borin (niveau 9) reste Écuyer." },
      { clause: "ORDER BY", sql: "SELECT heros.nom, chateaux.nom, heros.niveau, CASE WHEN heros.niveau >= 10 THEN 'Champion' ELSE 'Écuyer' END AS titre FROM heros JOIN chateaux ON heros.num_chateau = chateaux.id WHERE chateaux.nom NOT LIKE 'Tour%' ORDER BY heros.niveau DESC", why: "Les plus aguerris passent en premier. La colonne niveau est affichée ici pour vérifier ; ta requête n'en avait pas besoin." }
    ],
    takeaway: "Toute requête se lit dans l'ordre FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY."
  },
  25: {
    lesson: "<code>BETWEEN a AND b</code> est un raccourci pour « ≥ a <b>et</b> ≤ b ». Les deux bornes sont <b>comprises</b> : une visite à 20 h ou à 23 h compte. Ici le <code>AND</code> qui suit BETWEEN appartient au BETWEEN, ce n'est pas une nouvelle condition.",
    steps: [
      { clause: "FROM", sql: "SELECT * FROM visites", why: "Le registre complet : 9 visites, sur 3 châteaux et 2 jours." },
      { clause: "WHERE château + jour", sql: "SELECT * FROM visites WHERE num_chateau = 1 AND jour = 3", why: "Le Bastion, la nuit du vol : 4 visites. Aria est passée à 19 h." },
      { clause: "BETWEEN", sql: "SELECT num_heros, heure FROM visites WHERE num_chateau = 1 AND jour = 3 AND heure BETWEEN 20 AND 23", why: "Aria (19 h) est hors de la fenêtre. Restent les héros 3, 4 et 6." }
    ],
    takeaway: "BETWEEN a AND b = entre a et b, bornes comprises."
  },
  26: {
    lesson: "<code>AND</code> est exigeant : toutes les conditions doivent être vraies. <code>OR</code> est indulgent : <b>une seule</b> suffit. Chaque côté du OR est un test complet : <code>ecole = 'Feu' OR 'Lumière'</code> ne marche pas, il faut répéter <code>ecole =</code>.",
    steps: [
      { clause: "JOIN", sql: "SELECT heros.nom, sorts.nom, sorts.ecole FROM heros JOIN sorts ON sorts.num_heros = heros.id", why: "Chaque héros avec ses sorts. Borin n'en a aucun : il disparaît." },
      { clause: "WHERE … OR …", sql: "SELECT heros.nom, sorts.ecole FROM heros JOIN sorts ON sorts.num_heros = heros.id WHERE sorts.ecole = 'Feu' OR sorts.ecole = 'Lumière'", why: "5 sorts passent. Lyra et Aria apparaissent deux fois." },
      { clause: "DISTINCT", sql: "SELECT DISTINCT heros.nom FROM heros JOIN sorts ON sorts.num_heros = heros.id WHERE sorts.ecole = 'Feu' OR sorts.ecole = 'Lumière'", why: "Chaque suspect une seule fois : Aria, Lyra, Gédéon." }
    ],
    takeaway: "AND : toutes les conditions. OR : au moins une."
  },
  27: {
    lesson: "<code>MIN()</code> et <code>MAX()</code> résument une colonne en un seul nombre, comme COUNT ou SUM. Mais un résumé perd les lignes : <code>SELECT MIN(valeur)</code> ne dit pas <i>à qui</i> appartient l'objet. D'où l'astuce : calculer le minimum dans une sous-requête, puis chercher la ligne qui a cette valeur.",
    steps: [
      { clause: "MIN", sql: "SELECT MIN(valeur) FROM inventaire", why: "La plus petite valeur : 1 pièce." },
      { clause: "WHERE = (sous-requête)", sql: "SELECT * FROM inventaire WHERE valeur = (SELECT MIN(valeur) FROM inventaire)", why: "La ligne qui a cette valeur : la Bourse Trouée, du héros 6." },
      { clause: "JOIN", sql: "SELECT heros.nom, inventaire.objet FROM inventaire JOIN heros ON inventaire.num_heros = heros.id WHERE inventaire.valeur = (SELECT MIN(valeur) FROM inventaire)", why: "Le héros 6, c'est Gédéon. Suspect n°1 ?" }
    ],
    takeaway: "MIN() / MAX() trouvent la valeur ; une sous-requête retrouve la ligne."
  },
  28: {
    lesson: "<code>LIMIT n</code> coupe le résultat après <i>n</i> lignes. Il s'exécute <b>en tout dernier</b>, après le tri : c'est le « combien ? » de la chaîne de questions. Sans ORDER BY avant, LIMIT 1 prendrait une ligne au hasard.",
    steps: [
      { clause: "WHERE", sql: "SELECT heros.nom, visites.heure FROM visites JOIN heros ON visites.num_heros = heros.id WHERE visites.num_chateau = 1 AND visites.jour = 3", why: "Les 4 visites de la nuit, dans le désordre." },
      { clause: "ORDER BY DESC", sql: "SELECT heros.nom, visites.heure FROM visites JOIN heros ON visites.num_heros = heros.id WHERE visites.num_chateau = 1 AND visites.jour = 3 ORDER BY visites.heure DESC", why: "La plus tardive en haut : Gédéon à 23 h." },
      { clause: "LIMIT 1", sql: "SELECT heros.nom, visites.heure FROM visites JOIN heros ON visites.num_heros = heros.id WHERE visites.num_chateau = 1 AND visites.jour = 3 ORDER BY visites.heure DESC LIMIT 1", why: "Une seule ligne reste." }
    ],
    takeaway: "ORDER BY d'abord, LIMIT tout à la fin."
  },
  29: {
    lesson: "La base calcule les <code>AND</code> <b>avant</b> les <code>OR</code>, comme les multiplications avant les additions. Sans parenthèses, <code>… AND ecole = 'Feu' OR ecole = 'Lumière'</code> se lit « (toutes les conditions et Feu) OU (Lumière, n'importe quand) ». Les parenthèses forment une boîte : le OR reste enfermé dedans.",
    steps: [
      { clause: "JOIN ×2", sql: "SELECT heros.nom, visites.heure, sorts.ecole FROM visites JOIN heros ON visites.num_heros = heros.id JOIN sorts ON sorts.num_heros = heros.id WHERE visites.num_chateau = 1 AND visites.jour = 3", why: "Chaque visite de la nuit, avec chaque sort du visiteur." },
      { clause: "piège : sans parenthèses", sql: "SELECT DISTINCT heros.nom FROM visites JOIN heros ON visites.num_heros = heros.id JOIN sorts ON sorts.num_heros = heros.id WHERE visites.num_chateau = 1 AND visites.jour = 3 AND visites.heure BETWEEN 20 AND 23 AND sorts.ecole = 'Feu' OR sorts.ecole = 'Lumière'", why: "Aria est accusée à tort : son sort de Lumière suffit à faire passer n'importe laquelle de ses visites." },
      { clause: "avec parenthèses", sql: "SELECT DISTINCT heros.nom FROM visites JOIN heros ON visites.num_heros = heros.id JOIN sorts ON sorts.num_heros = heros.id WHERE visites.num_chateau = 1 AND visites.jour = 3 AND visites.heure BETWEEN 20 AND 23 AND (sorts.ecole = 'Feu' OR sorts.ecole = 'Lumière')", why: "Deux suspects : Lyra et Gédéon. Et Gédéon était le dernier visiteur…" }
    ],
    takeaway: "AND passe avant OR : mets le OR entre parenthèses."
  },
  30: {
    lesson: "<code>CREATE TABLE</code> construit une table <b>vide</b> à partir d'un plan : <code>nom TYPE</code> pour chaque colonne. <code>INTEGER</code> = nombre entier, <code>TEXT</code> = texte. <code>PRIMARY KEY</code> marque l'identité de chaque ligne : deux familiers ne pourront jamais avoir le même id. La colonne <code>num_heros</code> servira de clé étrangère vers les héros.",
    steps: [
      { clause: "CREATE TABLE", sql: "CREATE TABLE familiers (id INTEGER PRIMARY KEY, nom TEXT, espece TEXT, num_heros INTEGER); SELECT name AS colonne, type FROM pragma_table_info('familiers')", why: "Le plan de ta table : 4 colonnes et leurs types." },
      { clause: "vérification", sql: "CREATE TABLE familiers (id INTEGER PRIMARY KEY, nom TEXT, espece TEXT, num_heros INTEGER); SELECT COUNT(*) AS lignes FROM familiers", why: "Une table neuve est vide : 0 ligne." }
    ],
    takeaway: "CREATE TABLE nom (colonne TYPE, …) : d'abord le plan, ensuite les lignes."
  },
  31: {
    lesson: "Ta table se remplit comme n'importe quelle autre. Sans liste de colonnes, <code>INSERT INTO familiers VALUES (…)</code> suit l'<b>ordre du plan</b> : id, nom, espece, num_heros. Le 3 de Braise n'est pas un hasard : c'est l'id de Lyra.",
    steps: [
      { clause: "INSERT", sql: "INSERT INTO familiers VALUES (1, 'Braise', 'Salamandre', 3), (2, 'Plume', 'Hibou', 5), (3, 'Grognon', 'Crapaud', 6); SELECT * FROM familiers", why: "Trois pensionnaires inscrits." }
    ],
    takeaway: "Sans liste de colonnes, les valeurs suivent l'ordre du plan."
  },
  32: {
    lesson: "Une fois créée, ta table est une table comme les autres : on la lit, on la filtre, on la relie. <code>familiers.num_heros</code> pointe vers <code>heros.id</code>, exactement comme <code>inventaire.num_heros</code>.",
    steps: [
      { clause: "FROM", sql: "SELECT * FROM familiers", why: "Ta table : des numéros de héros, peu lisibles." },
      { clause: "JOIN", sql: "SELECT heros.nom, familiers.nom, familiers.espece FROM familiers JOIN heros ON familiers.num_heros = heros.id", why: "Chaque numéro est remplacé par un vrai nom de héros." }
    ],
    takeaway: "Une table que tu crées se relie comme les autres, par sa clé étrangère."
  },
  33: {
    lesson: "<code>ALTER TABLE</code> modifie le <b>plan</b>, pas les lignes. <code>ADD COLUMN</code> ajoute une colonne à droite ; les lignes existantes reçoivent NULL (case vide) dans cette colonne. On la remplirait ensuite avec un UPDATE.",
    steps: [
      { clause: "ALTER TABLE", sql: "ALTER TABLE familiers ADD COLUMN age INTEGER; SELECT * FROM familiers", why: "La colonne age est apparue, vide pour les trois familiers." },
      { clause: "et ensuite ?", sql: "ALTER TABLE familiers ADD COLUMN age INTEGER; UPDATE familiers SET age = 2 WHERE nom = 'Plume'; SELECT * FROM familiers", why: "Exemple : un UPDATE remplirait la case de Plume. (Ce n'est pas demandé dans la mission.)" }
    ],
    takeaway: "ALTER TABLE … ADD COLUMN agrandit le plan ; les cases existantes valent NULL."
  },
  34: {
    lesson: "Ne confonds pas : <code>DELETE FROM t</code> vide les lignes mais garde la table ; <code>DROP TABLE t</code> détruit la table <b>entière</b>, plan compris. Après un DROP, un <code>SELECT * FROM familiers</code> donnerait « no such table ».",
    steps: [
      { clause: "DROP TABLE", sql: "DROP TABLE familiers; SELECT name AS tables_du_royaume FROM sqlite_master WHERE type = 'table'", why: "familiers a disparu de la liste des tables." },
      { clause: "CREATE + INSERT", sql: "DROP TABLE familiers; CREATE TABLE quetes (id INTEGER PRIMARY KEY, titre TEXT, recompense INTEGER, num_heros INTEGER); INSERT INTO quetes VALUES (1, 'Rendre le trésor', 5000, 6); SELECT * FROM quetes", why: "La nouvelle table et sa première quête, confiée à Gédéon." }
    ],
    takeaway: "DELETE vide les lignes ; DROP TABLE détruit toute la table."
  },
  35: {
    lesson: "<code>COALESCE(a, b)</code> veut dire « a, ou bien b si a est vide (NULL) ». On l'utilise surtout après un LEFT JOIN, pour remplacer les trous par un texte lisible. On peut enchaîner : <code>COALESCE(a, b, c)</code> prend la première valeur non vide.",
    steps: [
      { clause: "LEFT JOIN", sql: "SELECT heros.nom, sorts.nom FROM heros LEFT JOIN sorts ON sorts.num_heros = heros.id", why: "Borin est gardé, mais avec une case vide." },
      { clause: "COALESCE", sql: "SELECT heros.nom, COALESCE(sorts.nom, 'Aucun sort') FROM heros LEFT JOIN sorts ON sorts.num_heros = heros.id", why: "La case vide de Borin devient « Aucun sort »." }
    ],
    takeaway: "COALESCE(colonne, 'texte') remplit les cases vides."
  },
  36: {
    lesson: "Des fonctions transforment le texte de chaque ligne : <code>UPPER()</code> (majuscules), <code>LOWER()</code> (minuscules), <code>LENGTH()</code> (nombre de caractères). Attention : SQLite ne met en majuscules que les lettres <b>sans accent</b>, d'où « GéDéON ». Les espaces et apostrophes comptent dans LENGTH.",
    steps: [
      { clause: "UPPER", sql: "SELECT nom, UPPER(nom) FROM heros", why: "Chaque nom en majuscules ; les lettres accentuées restent minuscules." },
      { clause: "LENGTH", sql: "SELECT UPPER(nom), LENGTH(nom) FROM heros", why: "Le nombre de lettres de chaque nom." }
    ],
    takeaway: "UPPER, LOWER, LENGTH : travailler le texte ligne par ligne."
  },
  37: {
    lesson: "<code>WITH nom AS ( SELECT … )</code> prépare une liste nommée <b>avant</b> la requête principale. Ensuite, on s'en sert comme d'une table. C'est une sous-requête avec un nom : la requête se lit en étapes, de haut en bas.",
    steps: [
      { clause: "WITH", sql: "WITH riches AS (SELECT * FROM heros WHERE fortune >= 300) SELECT * FROM riches", why: "La liste préparée : Aria, Lyra et Kael." },
      { clause: "JOIN", sql: "WITH riches AS (SELECT * FROM heros WHERE fortune >= 300) SELECT riches.nom, chateaux.nom FROM riches JOIN chateaux ON riches.num_chateau = chateaux.id", why: "La liste préparée se relie aux châteaux comme une vraie table." }
    ],
    takeaway: "WITH prépare une liste nommée, utilisable comme une table."
  },
  38: {
    lesson: "<code>RANK() OVER (ORDER BY …)</code> calcule la place de chaque ligne <b>sans regrouper</b> : toutes les lignes restent, chacune avec son rang. En cas d'égalité, deux lignes auraient le même rang. Le résultat peut s'afficher dans n'importe quel ordre : c'est la colonne rang qui compte.",
    steps: [
      { clause: "ORDER BY seul", sql: "SELECT nom, puissance FROM sorts ORDER BY puissance DESC", why: "ORDER BY range les lignes, mais n'écrit aucun numéro." },
      { clause: "RANK", sql: "SELECT nom, puissance, RANK() OVER (ORDER BY puissance DESC) AS rang FROM sorts", why: "Chaque sort reçoit sa place : Jugement Divin est 1er." }
    ],
    takeaway: "RANK() OVER (ORDER BY …) écrit la place de chaque ligne."
  },
  39: {
    lesson: "<code>PARTITION BY ecole</code> découpe les sorts en tas (comme GROUP BY) mais <b>sans les fusionner</b> : le classement recommence à 1 dans chaque tas. Le rang est calculé au moment du SELECT, donc trop tard pour le WHERE de la même requête. La liste préparée <code>WITH</code> règle ça : on calcule d'abord, on filtre ensuite.",
    steps: [
      { clause: "PARTITION BY", sql: "SELECT ecole, nom, puissance, RANK() OVER (PARTITION BY ecole ORDER BY puissance DESC) AS rang FROM sorts", why: "Un podium par école : chaque école a son 1er." },
      { clause: "WITH + WHERE", sql: "WITH classement AS (SELECT ecole, nom, puissance, RANK() OVER (PARTITION BY ecole ORDER BY puissance DESC) AS rang FROM sorts) SELECT ecole, nom, puissance FROM classement WHERE rang = 1", why: "On ne garde que les vainqueurs : un champion par école." }
    ],
    takeaway: "PARTITION BY = un classement par tas ; WITH permet de filtrer sur ce rang."
  }
};
