# Le Grimoire des Requêtes · L'aventure SQL

> **Tout est en français, sauf les mots-clés.** Les tables et les colonnes portent des noms français sans
> accents (`heros`, `nom`, `fortune`, `num_chateau`) ; seule la vingtaine de mots-clés SQL (`SELECT`,
> `FROM`, `WHERE`…) reste en anglais, car ils font partie du langage lui-même.

Un mini-RPG médiéval-fantastique pour apprendre le SQL. Chaque requête est un sort :
réussis-la pour gagner de l'XP, des objets et des badges ; une formule mal écrite coûte un point de vie.

Le SQL s'exécute **dans le navigateur** grâce à [sql.js](https://github.com/sql-js/sql.js)
(SQLite compilé en WebAssembly). Aucun serveur, aucune installation.

## Par où commencer ?

**Tu n'as jamais fait de SQL ?** Ouvre d'abord `premiers-pas.html`. Trente-trois petites leçons, une seule chose
à l'écran à la fois, sans points de vie.

*Partie 1 · Lire une table* (prépare le Chapitre 1) :

1. Une table, c'est quoi ? (lignes, colonnes, qui parle anglais et qui parle français)
2. Demander toute une table (`SELECT * FROM`)
3. Choisir les colonnes
4. Garder certaines lignes avec un nombre (`WHERE pv > 100`)
5. Garder certaines lignes avec un texte (`WHERE classe = 'Mage'`, apostrophes et accents)
6. Ranger les lignes (`ORDER BY … DESC`)

*Partie 2 · Compter et relier* (prépare le Chapitre 2) :

7. Compter (`COUNT(*)`)
8. Faire des paquets (`GROUP BY`), avec des couleurs pour voir chaque paquet
9. Relier deux tables (`JOIN … ON`), en 9 petites étapes : d'abord les mots (`id` = numéro, le point se lit
   « de » : `heros.nom` = le nom du héros), vérifiés par deux questions ; puis des phrases dont le début
   est déjà posé, pour n'ajouter que la règle `ON` (3 blocs), puis le `JOIN` (6 blocs), puis la phrase entière
10. Relier, puis filtrer (`JOIN` + `WHERE`) : le JOIN est déjà posé, on n'ajoute que le WHERE
11. Additionner par paquets (`SUM` + `GROUP BY`), jusqu'au boss du Chapitre 2, une seule nouveauté par phrase

*Partie 3 · Chercher plus loin* (prépare le Chapitre 3) :

12. Trouver ce qui manque (`LEFT JOIN` + `IS NULL`) : Borin disparaît avec `JOIN`, réapparaît avec `LEFT JOIN`
13. Filtrer les tas (`HAVING`) : le videur de la sortie, après `GROUP BY`
14. Une question dans la question (`AVG` + sous-requête) : la boîte de l'assistant
15. Est-ce dans la liste ? (`IN`), d'abord écrite à la main, puis fabriquée par une sous-requête

*Partie 4 · Modifier le royaume* (prépare le Chapitre 4) :

16. Ajouter une ligne (`INSERT INTO … VALUES`), comme un formulaire
17. Modifier des lignes (`UPDATE … SET … WHERE`) : le résultat en direct montre tout le royaume payé tant que le `WHERE` n'est pas posé
18. Supprimer des lignes (`DELETE FROM … WHERE`) : regarder avant de détruire

*Partie 5 · Le Conseil des Sages* (prépare le Chapitre 5) :

19. Sans doublons (`DISTINCT`) : la liste d'invités
20. Chercher un motif (`LIKE`, le joker `%`, `NOT LIKE`)
21. Fabriquer une étiquette (`CASE WHEN … THEN … ELSE … END` : quand, alors, sinon, fin ; le premier WHEN vrai gagne)
22. Le jugement du Conseil (`CASE` + `GROUP BY`, puis le boss du Chapitre 5 : `JOIN` + `CASE` + `NOT LIKE` + `ORDER BY`)

*Partie 6 · Les outils oubliés* (prépare le Chapitre 6) :

23. Seulement les premiers (`ORDER BY` puis `LIMIT`) : les ciseaux, en tout dernier
24. Ou bien (`OR`, puis les parenthèses) : AND passe avant OR, comme × avant +
25. Le plus petit, le plus grand (`MIN`, `MAX`, puis « à qui est le maximum ? » avec une sous-requête)
26. Entre deux bornes (`BETWEEN … AND …`, bornes comprises)

*Partie 7 · L'Architecte* (prépare le Chapitre 7) :

27. Construire une table (`CREATE TABLE`, `INTEGER`, `TEXT`, `PRIMARY KEY`) : le résultat en direct montre le plan de la table
28. Remplir sa table (`INSERT` dans ta table, puis `JOIN` avec les héros)
29. Agrandir ou démolir (`ALTER TABLE … ADD COLUMN`, `DROP TABLE`, et la différence avec `DELETE`)

*Partie 8 · Les Archives* (prépare le Chapitre 8) :

30. Remplir les cases vides (`COALESCE`) : la roue de secours
31. Travailler le texte (`UPPER`, `LOWER`, `LENGTH`)
32. La liste préparée (`WITH … AS ( … )`)
33. Le podium (`RANK() OVER (ORDER BY …)`, puis `PARTITION BY`)

Dans la partie 4, le résultat en direct montre la table **après** la phrase : lignes ajoutées ou modifiées en
vert, lignes supprimées barrées. Le jeu compte les lignes touchées et explique l'écart (« 6 lignes au lieu
d'une : sans le videur WHERE, l'ordre s'applique à toutes les lignes »).

Au début, on ne tape rien : on construit la phrase en cliquant sur des blocs. Chaque bloc porte sa
traduction (`SELECT` = « montre », `WHERE` = « seulement si »), la phrase se relit en français et
le résultat s'affiche en direct. Les mauvais blocs placés exprès (`<` au lieu de `>`, `Mage` sans
apostrophes, `Foret` sans accent) expliquent l'erreur. Le clavier arrive seulement à la fin de chaque leçon.

**Pour retenir.** Chaque notion a son moyen mnémotechnique, présenté sur une carte « Pour retenir » :
- l'ordre de la phrase : « la **S**uper **F**ée **W**ilda **O**rdonne » (SELECT, FROM, WHERE, ORDER BY),
  puis « Wilda **G**ronde, puis **O**rdonne » quand GROUP BY arrive ;
- `WHERE` est le videur à l'entrée ; le crocodile `>` ouvre la bouche vers le plus grand ;
- un texte porte des boucles d'oreilles (`'Mage'`) ; la base porte des lunettes (accents, majuscules) ;
- `DESC` comme descendre, `ASC` comme ascenseur ; `id` comme identité ; le point se lit « de » ;
- `JOIN` = joindre, `ON` = la poignée de main entre numéros égaux ; `COUNT` compte, `SUM` fait la somme ;
- `AND` est un parent sévère, `OR` un grand-parent gâteau ; les parenthèses sont la boîte du OR ; `BETWEEN` est une fenêtre ;
- `DELETE` vide les meubles, `DROP TABLE` démolit les murs ; `COALESCE` est la roue de secours ; `PARTITION BY` est une cloison.

Chaque leçon commence par un **rappel éclair** (une question sur la leçon d'avant), et le bouton
**« Mon aide-mémoire »** affiche à tout moment les images déjà rencontrées.

**L'entraînement du jour (3 minutes).** Pour retenir les mots et leur ordre, il faut les retrouver
plusieurs fois, en espaçant. Le bouton « S'entraîner » propose 10 questions variées :
- traduire un mot (« seulement si » → `WHERE`) ou l'inverse ;
- compléter une phrase à trou (`SELECT nom ___ heros WHERE …`) ;
- remettre les mots dans l'ordre (de 3 mots jusqu'à la phrase complète). En cas d'erreur, l'indice donne
  la question suivante plutôt que la réponse.

Chaque mot a une boîte de 0 à 5 (méthode Leitner) : une bonne réponse le fait monter, une erreur le
renvoie à 1 et le fait revenir avant la fin de la séance. Les mots faibles sont tirés plus souvent.
Des jauges montrent la maîtrise de chaque mot ; une bannière rappelle l'entraînement une fois par jour,
et le jeu compte les jours d'affilée. Seuls les mots des leçons déjà vues sont proposés.

**L'ordre de la phrase, version questions.** Chaque mot répond à une question, toujours dans le même ordre :
quoi ? (`SELECT`) → dans quelle table ? (`FROM`) → reliée à quelle table ? (`JOIN … ON`) → quelles lignes ?
(`WHERE`) → en quels tas ? (`GROUP BY`) → quels tas ? (`HAVING`) → dans quel ordre ? (`ORDER BY`) → combien ? (`LIMIT`).

Ensuite, l'aventure complète (`index.html`) reprend ces notions dès le Chapitre 1.

## Images, animations et bruitages

- **Une icône emoji par table** : 🛡️ `heros`, 👹 `monstres`, 🪄 `sorts`, 💰 `inventaire`, 🏰 `chateaux`, 📖 `visites`.
  On les retrouve dans les blocs, au-dessus des tableaux, dans le panneau des tables et sous chaque mission
  (« Tables à utiliser »).
- **Illustrations des tables** : une grande image par table (`assets/table-*.webp`) dans le panneau des tables
  et sur la carte « Les 5 tables du royaume » de Premiers pas, avec les **vraies colonnes** écrites par le jeu.
  Les trois châteaux ont chacun leur image (`assets/chateau-1.webp` à `chateau-3.webp`) : affichés côte à côte,
  ils montrent qu'**une ligne de la table = un château**. Les quatre régions (Forêt Sombre, Marais Putride, Crypte
  Oubliée, Pics Gelés, `assets/region-*.webp`) apparaissent avec leurs monstres dans le panneau `monstres` et dans les leçons
  GROUP BY et OR. Les six héros ont leur portrait (`assets/heros-1.webp` à `heros-6.webp`), avec les vraies valeurs de
  leur ligne : on les voit sous la table `heros` (leçon 1 de Premiers pas, panneau des tables, première mission).
  Les neuf monstres ont aussi le leur (`assets/monstre-1.webp` à `monstre-9.webp`), dans l'étape « Une ligne = un monstre »
  de Premiers pas et dans le panneau `monstres` ; l'Ours-Hibou et la Liche illustrent leur boss.
  Certaines missions ont leur illustration au-dessus du récit (0, 2, 4, 6, 7, 9, 10, 14, 17, 19, 24 à 31, 33, 34) ;
  aucune ne montre le héros qui est la réponse de la mission.
- **Animations** : les lignes d'un résultat arrivent une à une ; avec `WHERE`, le videur écarte les lignes
  une par une sous les yeux du joueur ; les blocs posés « tombent » dans la phrase ; étincelles à chaque
  réussite, secousse à chaque erreur ; les pastilles de couleur des `JOIN` pulsent. Tout s'arrête si
  l'appareil demande de réduire les animations.
- **Bruitages** synthétisés par le navigateur (Web Audio, aucun fichier son) : clic de bloc, page qui tourne,
  bonne et mauvaise réponse, fanfare de fin de leçon, sort lancé, coup reçu (−1 PV), niveau supérieur, K.O.,
  parchemin déroulé. Le bouton **SON : OUI / NON** coupe tout et s'en souvient.

## Joueurs, sauvegarde et classement

Au premier accès, chaque jeu demande un **nom de joueur** (écran « Qui joue ? »). Chaque joueur a sa propre
partie : mission en cours, XP, objets, leçons de Premiers pas et boîtes de l'entraînement. Le bouton 👤 en haut
permet de changer de joueur ; un double toucher sur ✕ efface une partie. Le nom ne tient pas compte des
majuscules : « tom » retrouve la partie de « Tom ».

### Continuer sa partie sur un autre appareil : le code de sauvegarde

Le site est statique (GitHub Pages) : il n'y a pas de serveur pour garder les parties. La partie vit donc sur
l'appareil, et on la transporte avec un **code de sauvegarde** :

1. Sur l'appareil de départ : 👤 → bouton **📤** à côté de son nom → **Copier le code** (ou **Télécharger le fichier**).
2. Sur l'autre appareil : ouvrir le jeu → **📥 Entre ton code de sauvegarde** → coller le code (ou ouvrir le fichier)
   → **Retrouver ma partie**.

Le code (environ 500 caractères, il commence par `GRIM1.`) contient la partie de l'aventure **et** celle de Premiers
pas, avec l'entraînement. C'est une photo de la partie à cet instant : on refait un code quand on a avancé.
Si le joueur existe déjà sur l'appareil, le jeu demande de confirmer avant de remplacer sa partie.

### Le classement 🏆

Le bouton **🏆 Classement** (dans l'aventure) classe les joueurs par niveau, puis par XP, avec leurs missions et
badges. Il est calculé par une vraie requête SQL, `RANK() OVER (ORDER BY niveau DESC, xp DESC)`, affichée sous le
tableau. Le même joueur n'apparaît qu'une fois, même s'il a joué sur plusieurs appareils : il est reconnu par son
identifiant, transporté par le code de sauvegarde.

**Classement commun à tous les appareils (facultatif, gratuit, 5 minutes).** Un site GitHub Pages ne peut rien
enregistrer ; les scores passent donc par une feuille Google Sheets. Seuls le nom, le niveau, l'XP, les missions et
les badges y sont envoyés, la partie elle-même reste sur l'appareil.

1. Crée une feuille sur sheets.google.com, puis **Extensions → Apps Script**.
2. Remplace le contenu par celui du fichier `classement/Code.gs`, et enregistre.
3. **Déployer → Nouveau déploiement → Application Web** ; « Exécuter en tant que : moi », « Qui a accès : tout le
   monde ». Autorise l'accès quand Google le demande, puis copie l'adresse qui se termine par `/exec`.
4. Dans `config.js` (à la racine du dépôt GitHub), colle cette adresse entre les guillemets :
   `window.GRIMOIRE_CLASSEMENT_URL = "https://script.google.com/macros/s/…/exec";`
5. Enregistre le fichier sur GitHub : quelques minutes après, le classement indique
   « 🌍 Classement en ligne : les joueurs de tous les appareils ».

Sans adresse, ou sans Internet, le classement montre les joueurs de l'appareil. N'importe qui connaissant l'adresse
pourrait envoyer un faux score : c'est fait pour une classe ou une famille, pas pour un concours.
Les pages publiées sur claude.ai restent en classement local (elles ne peuvent pas joindre Google).

## Revenir chaque jour : défi, série, quêtes, étoiles, album

- **⭐⭐⭐ Étoiles par mission** : ⭐ réussie, ⭐⭐ sans parchemin, ⭐⭐⭐ sans parchemin et du premier coup.
  La meilleure note est gardée et s'affiche sur la carte (« ★★☆ »), avec le total d'étoiles. Quand on rejoue une
  mission, les parchemins déjà lus se relisent gratuitement, mais font perdre les étoiles.
- **🎯 Défi du jour** : une mission surprise, la même pour tous les joueurs, qui change à minuit (30 défis en
  rotation). +100 XP, +50 si elle est réussie du premier coup, sans parchemin. Le **classement du jour** classe par
  essais ratés, puis par temps ; il est commun à tous les appareils si le classement en ligne est réglé.
- **🔥 Série de jours** : un jour compte dès qu'une mission ou le défi est réussi. Tous les 7 jours : +100 XP,
  +2 parchemins et un badge « Flamme de N jours ». Un **joker 🃏 par semaine** sauve la série si on rate un seul jour.
- **📋 Quêtes de la semaine** : 3 objectifs renouvelés chaque lundi (« Réussis 3 missions avec JOIN »,
  « Gagne sans parchemin », « Fais 2 entraînements dans Premiers pas »…), adaptés à l'avancement du joueur.
  +75 XP et +1 parchemin chacune ; les 3 : +150 XP et un badge « Héros de la semaine ».
- **📒 Album** : 18 cartes (6 héros, 9 monstres, 3 châteaux) débloquées par des missions ; les cartes manquantes
  sont floues avec « ? » et disent quelle mission réussir. Une nouvelle carte s'affiche sur l'écran de victoire.

Ces informations font partie de la partie du joueur : elles voyagent avec le code de sauvegarde.
Pour le classement du défi du jour en ligne, il faut la **nouvelle version** de `classement/Code.gs` : remplace le
code dans Apps Script, puis **Déployer → Gérer les déploiements → Modifier → Nouvelle version** (l'adresse ne change pas).

## Panneaux pliables

Dans l'aventure, la **Carte**, les **Tables du royaume** et la **Besace** se plient et se déplient en touchant
leur titre. Repliés, ils affichent un résumé (« 13/40 », « 5 tables », « 4 objets · 2 badges »). Chaque appareil
se souvient de ce qui est plié.

**La colonne entière se replie aussi** : le bouton « ⇥ Replier la colonne » la range sur la droite en une fine
barre d'icônes (🗺️ Carte, 📚 Tables, 🎒 Besace) et la mission prend toute la largeur. Toucher une icône fait glisser
la colonne par-dessus la page ; choisir une mission, toucher à côté ou « ✕ Fermer » la referme. « 📌 Épingler » la
remet toujours visible. Le choix est gardé sur l'appareil.

## Sur tablette

Les deux jeux sont pensés pour iPad et tablettes Android, en portrait comme en paysage :
- zones à toucher d'au moins 42 px (mots-clés, colonnes, blocs, carte des missions) ;
- éditeur en 16 px, pour que l'iPad ne zoome pas quand on touche le champ ; correction automatique et
  majuscule automatique désactivées (elles abîmeraient le SQL) ;
- toucher un mot-clé l'insère sans ouvrir le clavier à chaque fois (sauf s'il est déjà ouvert) ;
- barre du haut sur une seule ligne, pour laisser de la place au clavier virtuel ;
- pas d'effet de survol « collé » après un toucher, pas de zoom au double-toucher ;
- le son se déverrouille au premier toucher (obligatoire sur iPad).

## Jouer

**Le plus simple :** double-clique sur `index.html`. Le jeu fonctionne hors ligne
(seules les polices Google ne se chargent pas sans internet ; des polices de secours prennent le relais).

**Version en un seul fichier :** `standalone/grimoire-des-requetes.html` contient tout
(moteur, logo, niveaux). Pratique pour l'envoyer par mail ou le déposer sur un ENT.

**Avec un petit serveur local** (recommandé pour développer) :

```bash
cd grimoire-des-requetes
python3 -m http.server 8000
# puis ouvre http://localhost:8000
```

La progression est sauvegardée dans le navigateur (localStorage).
Le lien « Recommencer l'aventure » dans la besace remet tout à zéro.

## Contenu

| Chapitre | Niveaux | Notions |
|---|---|---|
| Tutoriel | 0 à 1 | `SELECT *`, `SELECT col1, col2`, `FROM` |
| 1 · La Forêt Sombre | 2 à 4 | `WHERE`, `AND`, `>`, `ORDER BY … DESC`, `LIMIT` |
| 2 · Les Châteaux | 5 à 9 | `COUNT(*)`, `SUM()`, `AS`, `GROUP BY`, `JOIN … ON` |
| 3 · La Crypte Oubliée | 10 à 14 | `LEFT JOIN`, `IS NULL`, `HAVING`, `AVG()`, sous-requêtes, `IN` |
| 4 · La Forge des Nains | 15 à 19 | `INSERT INTO … VALUES`, `UPDATE … SET`, `DELETE FROM`, plusieurs instructions |
| 5 · Le Conseil des Sages | 20 à 24 | `DISTINCT`, `LIKE` et `%`, `NOT LIKE`, `CASE WHEN … THEN … ELSE … END` |
| 6 · Le Trésor disparu (enquête) | 25 à 29 | `BETWEEN`, `OR`, `MIN()` / `MAX()`, `LIMIT`, parenthèses `( … OR … )` |
| 7 · L'Architecte | 30 à 34 | `CREATE TABLE`, `INTEGER`, `TEXT`, `PRIMARY KEY`, `ALTER TABLE … ADD COLUMN`, `DROP TABLE` |
| 8 · Les Archives interdites | 35 à 39 | `COALESCE()`, `UPPER()`, `LENGTH()`, `WITH … AS`, `RANK() OVER`, `PARTITION BY` |

40 niveaux, environ 9 800 XP, 21 badges, 40 objets. Le dernier boss mène au titre de Maître du Grimoire et à un épilogue qui récapitule toutes les notions.

**Le Chapitre 6 est une enquête.** Le trésor du Bastion a disparu ; une nouvelle table, `visites`
(`num_heros`, `num_chateau`, `jour`, `heure`), note qui est entré où et quand. Chaque mission apporte un
indice, et le boss montre pourquoi il faut des parenthèses : sans elles, une innocente est accusée.

**Le Chapitre 7 fait construire des tables.** Le jeu compare alors le **plan** de la table (colonnes,
types, clé) en plus des lignes : « Le plan de la table familiers ne correspond pas. Ta table : … Attendu : … ».

## Apprendre en comprenant pourquoi

### Le traducteur en direct

Sous l'éditeur, chaque morceau de la requête est **traduit en français pendant la frappe** :
`WHERE region = 'Forêt Sombre'` devient « Garde seulement les lignes où la colonne region vaut le texte
« Forêt Sombre » ». Le traducteur vérifie aussi chaque mot **avant** de lancer le sort :

- faute de frappe sur un mot-clé (`SELEC`, `FORM`) ;
- table ou colonne inconnue, avec la plus proche proposée ;
- nom anglais, accentué ou au singulier à la place du nom du royaume (`name` → `nom`, `héros`/`hero` → `heros`, `chateau` → `chateaux`) ;
- texte sans apostrophes, `= NULL`, `CASE` sans `END`, `JOIN` sans `ON` ;
- clauses dans le mauvais ordre, colonne ambiguë entre deux tables ;
- `UPDATE` ou `DELETE` sans `WHERE`, nombre de valeurs différent du nombre de colonnes dans un `INSERT`.

Le code est dans `js/engine.js` (`translateQuery`). Le traducteur explique aussi `CREATE TABLE` (colonne par colonne, avec son type), `ALTER`, `DROP`, `WITH`, `BETWEEN`, `COALESCE` et `RANK() OVER`. Les 40 requêtes attendues passent sans aucune
fausse alerte.

### Des parchemins qui ne donnent jamais la réponse

Le dernier parchemin de chaque mission est un **squelette généré automatiquement** : les mots-clés
restent, tout le reste devient `___`. Exemple :
`SELECT ___, ___ FROM ___ WHERE ___ = '___' AND ___ > ___ ORDER BY ___ DESC;`
Le joueur doit choisir lui-même chaque colonne, table et valeur, aidé par le traducteur.
Dans le panneau des tables, « Voir ses N lignes » affiche le contenu complet d'une table pour savoir quoi chercher.

### Chaque mission en trois temps

Le jeu ne se contente pas de dire « gagné » ou « perdu ».

**Avant d'écrire : le savoir du grimoire.** Sous la mission, un panneau explique la notion et
surtout *pourquoi* elle existe. Par exemple : pourquoi les tables stockent un `num_chateau` au lieu du nom,
ou pourquoi on ne peut pas écrire `pv > AVG(pv)` dans un WHERE. Il affiche aussi **l'ordre réel
d'exécution** de la requête (FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT),
calculé automatiquement depuis la requête attendue. On écrit SELECT en premier, mais la base
l'exécute presque en dernier : ce seul fait explique la plupart des erreurs de débutant.

**Pendant : des échecs qui font réfléchir.** Quand la requête est valide mais fausse, le jeu
montre les lignes **en trop** et les lignes **absentes**, puis demande : « qu'ont-elles en commun ? ».
Le joueur trouve lui-même la cause au lieu de recevoir la correction.

**Après : la décomposition du sort.** À la réussite, le jeu rejoue la requête **étape par étape,
dans l'ordre où la base l'exécute**. Chaque étape est une vraie requête intermédiaire, lancée en
direct, avec son tableau de résultat et une explication. Exemple au boss du chapitre 1 :
9 monstres → 5 dans la forêt → 3 au-dessus de 50 PV → triés → 2 colonnes gardées. Certaines
étapes sont des **contre-exemples** : un UPDATE sans WHERE, un CASE mal ordonné, un DISTINCT sur
deux colonnes. On y voit ce qui *se passerait* si on se trompait.

La carte de victoire propose d'abord « Comprendre pourquoi », puis la mission suivante, avec
une phrase **À retenir**. Sur une mission déjà réussie, le bouton « Pourquoi ? Décomposer » rejoue
l'explication à tout moment.

Ce contenu se trouve dans l'objet `PEDAGOGY` (`js/data/levels.js`) : `lesson`, `steps`
(`clause`, `sql`, `why`) et `takeaway` pour chaque niveau.

## Règles du jeu

- **5 PV.** Une erreur de syntaxe coûte 1 PV. À 0 PV : K.O., retour à pleine vie avec un parchemin offert.
- **Requête valide mais mauvaise réponse :** aucun dégât. L'oracle explique l'écart (colonnes, lignes, ordre).
- **Explorer (sans risque) :** exécute n'importe quelle requête sans valider la mission.
- **Parchemins :** 3 au départ, 3 indices progressifs par niveau. Chaque parchemin lu retire 15 XP à la récompense du niveau.
- **Victoire :** XP, un objet, parfois un badge, +1 PV. Fin de chapitre : +2 parchemins.
- **Niveau du héros :** +1 tous les 150 XP.

## Structure du projet

```
grimoire-des-requetes/
├── index.html                  page du jeu (charge les scripts dans l'ordre)
├── config.js                   réglage du classement commun (adresse Google Apps Script)
├── classement/Code.gs          le script à coller dans Google Sheets pour ce classement
├── css/style.css               thème : tokens de couleur et de typo en tête de fichier
├── js/
│   ├── data/schema.js          base du royaume (CREATE TABLE + INSERT)
│   ├── data/levels.js          les 40 niveaux + mots-clés débloqués par chapitre
│   ├── state.js                état du joueur et sauvegarde
│   ├── engine.js               exécution SQL, validation, traduction des erreurs
│   ├── render.js               affichage : HUD, carte, tables, besace, résultats
│   ├── actions.js              lancer un sort, explorer, parchemins, victoire, K.O.
│   └── main.js                 branchement des événements et démarrage
├── vendor/
│   ├── sql-wasm.js             sql.js 1.10.3
│   ├── sql-wasm.wasm           binaire SQLite
│   ├── sql-wasm-binary.js      le même binaire en base64 (permet le file://)
│   └── LICENSE-sql.js.txt      licence MIT de sql.js
├── assets/                     logo (128 px, 480 px et original)
├── sql/schema.sql              la base en SQL pur, à ouvrir dans DB Browser for SQLite
└── standalone/                 version en un seul fichier HTML
```

Les scripts sont des scripts classiques (pas des modules ES) pour que le jeu marche
en ouvrant le fichier directement. Ils partagent leurs constantes globales et doivent
rester chargés dans l'ordre de `index.html`.

## Comment fonctionne la validation

1. Chaque sort s'exécute sur une **base neuve** recréée depuis `SCHEMA_SQL`.
   Un `DROP TABLE` du joueur ne casse donc rien.
2. Le jeu exécute aussi la requête attendue du niveau (`expected`), puis compare
   le nombre de colonnes, le nombre de lignes et les valeurs.
3. L'ordre des lignes n'est vérifié que si le niveau a `ordered: true`.
4. Les noms de colonnes ne comptent pas : `COUNT(*) AS nb` et `COUNT(*)` sont acceptés,
   tout comme un `JOIN` écrit avec des alias.

### Chapitres 4 et 7 : validation par l'état du royaume

Les niveaux qui modifient la base ont `mode: "write"` et une liste `tables`.
Le jeu prend une photo de ces tables avant et après le sort du joueur, fait de même
avec la requête attendue, puis compare les deux royaumes ligne par ligne (par `id`).
Il sait ainsi dire :

- « Rien n'a changé » : le joueur a écrit un SELECT ;
- « Ton sort a touché 7 lignes au lieu de 1 » : l'UPDATE ou le DELETE sans WHERE ;
- « La ligne d'id 2 a une valeur inattendue dans la colonne fortune » : mauvais calcul ou faute de frappe.

Le monde du chapitre est **cumulatif** : chaque niveau démarre avec les requêtes attendues
des niveaux précédents du même chapitre (fonction `worldSetup`). Tilda, ajoutée au
niveau 15, existe donc au niveau 16. Dans la console, les lignes créées ou modifiées
sont surlignées et les lignes supprimées sont listées.
Au chapitre 7, le monde cumulatif vaut aussi pour les missions de lecture : la table `familiers` créée au
niveau 30 et remplie au niveau 31 peut être lue au niveau 32.

## Ajouter un niveau

Ajoute un objet à la fin du tableau `LEVELS` dans `js/data/levels.js` :

```js
{
  id: 15,                                   // = position dans le tableau
  chapter: "Chapitre 4 · La Forge des Nains",
  title: "Le Registre de la Forge",
  pitch: "Le récit, avec du <em>HTML</em> autorisé.",
  mission: "Ce que le joueur doit afficher, avec les <code>colonnes</code>.",
  concept: ["NOTION"],                      // pastilles sous la mission
  starter: "SELECT …",                      // texte de départ de l'éditeur ("" = vide)
  expected: "SELECT …;",                    // requête de référence
  ordered: false,                           // true si l'ordre des lignes compte
  hints: ["Indice 1", "Indice 2", "(remplacé au démarrage par le squelette)"],
  xp: 200, item: "Nom de l'objet", badge: null,
  // optionnel : niveau qui modifie la base, validé par l'état des tables listées
  // mode: "write", tables: ["heros"],
  // optionnel : interdire une construction (pas de dégâts, juste un rappel)
  // forbid: { re: /\bJOIN\b/i, msg: "Utilise une sous-requête." }
}
```

Le niveau apparaît tout seul sur la carte et se débloque après le précédent.
Pour de nouveaux mots-clés en raccourci, complète `KEYWORDS` et `keywordsFor()`
au bas du même fichier. Pour une nouvelle erreur SQLite à traduire, ajoute un cas
dans `translateError()` (`js/engine.js`).

## Mettre en ligne

Le dossier est un site statique : dépose-le tel quel sur GitHub Pages, Netlify,
Vercel ou n'importe quel hébergement web.

## Licences

- sql.js : MIT (voir `vendor/LICENSE-sql.js.txt`).
- Polices chargées depuis Google Fonts : MedievalSharp, Alegreya, IBM Plex Mono, Cinzel (licence SIL OFL).
