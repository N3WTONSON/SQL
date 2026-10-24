-- Le Grimoire des Requêtes : base du royaume (SQLite)
CREATE TABLE visites (
  id INTEGER PRIMARY KEY, num_heros INTEGER REFERENCES heros(id), num_chateau INTEGER REFERENCES chateaux(id), jour INTEGER, heure INTEGER
);
CREATE TABLE chateaux (
  id INTEGER PRIMARY KEY, nom TEXT NOT NULL, region TEXT, seigneur TEXT, tresor INTEGER
);
CREATE TABLE heros (
  id INTEGER PRIMARY KEY, nom TEXT NOT NULL, classe TEXT, niveau INTEGER, pv INTEGER, fortune INTEGER,
  num_chateau INTEGER REFERENCES chateaux(id)
);
CREATE TABLE monstres (
  id INTEGER PRIMARY KEY, nom TEXT NOT NULL, type TEXT, region TEXT, pv INTEGER, danger INTEGER, butin TEXT
);
CREATE TABLE sorts (
  id INTEGER PRIMARY KEY, nom TEXT NOT NULL, ecole TEXT, puissance INTEGER, mana INTEGER,
  num_heros INTEGER REFERENCES heros(id)
);
CREATE TABLE inventaire (
  id INTEGER PRIMARY KEY, objet TEXT NOT NULL, rarete TEXT, valeur INTEGER,
  num_heros INTEGER REFERENCES heros(id)
);

INSERT INTO visites VALUES
 (1,1,1,3,19),(2,3,1,3,21),(3,4,1,3,22),(4,6,1,3,23),(5,2,2,3,22),(6,5,2,3,21),(7,1,1,2,22),(8,4,3,3,23),(9,6,3,2,20);

INSERT INTO chateaux VALUES
 (1,'Bastion de l''Aube','Plaines Dorées','Reine Ysolde',12000),
 (2,'Fort Roc-Tonnerre','Pics Gelés','Thane Hrolf',4300),
 (3,'Tour Penchée de Brumeval','Marais Putride','Archimage Ombrelin',870);

INSERT INTO heros VALUES
 (1,'Aria Lamebrume','Paladin',12,140,320,1),
 (2,'Borin Barbe-de-Fer','Guerrier',9,180,75,2),
 (3,'Lyra Murmure-Vent','Mage',14,85,510,1),
 (4,'Kael Pas-Feutré','Voleur',7,95,1200,3),
 (5,'Mira Chantelune','Druide',10,110,40,2),
 (6,'Gédéon le Distrait','Mage',3,60,5,3);

INSERT INTO monstres VALUES
 (1,'Gobelin Grincheux','Gobelin','Forêt Sombre',30,2,'Dent cariée'),
 (2,'Loup Spectral','Bête','Forêt Sombre',65,5,'Croc d''ectoplasme'),
 (3,'Troll des Ponts','Troll','Marais Putride',150,7,'Péage impayé'),
 (4,'Champignon Hurleur','Plante','Forêt Sombre',20,1,'Spore bruyante'),
 (5,'Ours-Hibou','Bête','Forêt Sombre',90,6,'Plume de 40 kg'),
 (6,'Liche Mineure','Mort-vivant','Crypte Oubliée',120,8,'Phylactère fêlé'),
 (7,'Slime Collant','Gelée','Marais Putride',45,3,'Gelée à la menthe'),
 (8,'Dragonnet Boudeur','Dragon','Pics Gelés',200,9,'Écaille vexée'),
 (9,'Araignée Tisse-Nuit','Bête','Forêt Sombre',55,4,'Soie d''ombre');

INSERT INTO sorts VALUES
 (1,'Boule de Feu','Feu',80,30,3),
 (2,'Lumière Sacrée','Lumière',60,25,1),
 (3,'Ronces Vivantes','Nature',45,20,5),
 (4,'Pas de l''Ombre','Ombre',30,15,4),
 (5,'Tempête de Givre','Glace',95,45,3),
 (6,'Étincelle Ratée','Feu',5,1,6),
 (7,'Jugement Divin','Lumière',110,60,1),
 (8,'Peau d''Écorce','Nature',25,10,5);

INSERT INTO inventaire VALUES
 (1,'Épée Solaire','Légendaire',5000,1),
 (2,'Hache à Double Tranchant','Rare',800,2),
 (3,'Bâton de Cristal','Épique',2400,3),
 (4,'Crochets de Serrure','Commun',15,4),
 (5,'Bourse Trouée','Commun',1,6),
 (6,'Graine d''Yggdrasil','Légendaire',7000,5),
 (7,'Potion Douteuse','Commun',3,6),
 (8,'Cape d''Invisibilité (presque)','Rare',950,4);
