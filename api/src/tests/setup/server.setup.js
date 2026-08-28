// Hooks globaux pour les tests d'intégration :
// synchronise la BDD, démarre un serveur de test sur un port libre,
// vide la BDD avant chaque test, ferme proprement le serveur et la BDD à la fin.
// (s'appliquent qu'aux tests d'intégration — pas aux tests unitaires)

import { before, beforeEach, after } from "node:test";
import sequelize from "../../config/sequelize.client.js";
// app contient toute la configuration du serveur : les routes, les middlewares, etc.
import app from "../../app.js";

let server;

before(async () => {
  // Recrée toutes les tables sur la BDD de test (chargée via .env.test, cf. env.setup.js)
  await sequelize.sync({ force: true });

  // Port 0 : l'OS choisit un port libre automatiquement, évite les conflits
  server = app.listen(0);
});

beforeEach(async () => {
  // Repart d'une base vide avant CHAQUE test, pour l'isolation entre eux
  await sequelize.truncate({ cascade: true, force: true });
});

after(async () => {
  // Ferme le serveur HTTP proprement (attend la fermeture effective)
  await new Promise((resolve) => server.close(resolve));

  // Supprime entièrement les tables, puis ferme la connexion à la BDD
  await sequelize.drop({ cascade: true, force: true });
  await sequelize.close();
});

// Le port n'est connu qu'une fois `before` exécuté.
// Appelée depuis les `it`, jamais avant, pour être sûre que `server` existe déjà.
export function getBaseUrl() {
  return `http://localhost:${server.address().port}`;
}
