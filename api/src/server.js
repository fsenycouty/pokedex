// Démarrage du serveur
import app from "./app.js";
import sequelize from "./config/sequelize.client.js";

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

/**
 * Arrêt propre du serveur : ferme d'abord les connexions HTTP en cours,
 * puis la connexion à la base de données, avant de quitter le process.
 * Nécessaire notamment sur Render (plan Free), qui envoie SIGTERM pour
 * mettre le service en veille après une période d'inactivité — sans ce
 * gestionnaire, Node coupe brutalement sans libérer la connexion Sequelize.
 * @param {string} signal - Le signal reçu (SIGTERM ou SIGINT), utile pour le log.
 */
async function gracefulShutdown(signal) {
  console.log(`${signal} reçu, arrêt propre du serveur...`);

  // On arrête d'abord d'accepter de nouvelles requêtes et on attend
  // que les requêtes déjà en cours se terminent.
  server.close(async (err) => {
    if (err) {
      console.error("Erreur lors de la fermeture du serveur HTTP:", err);
      process.exit(1);
    }

    try {
      // Ferme proprement le pool de connexions Sequelize/pg.
      await sequelize.close();
      console.log("Connexion à la base de données fermée.");
      process.exit(0);
    } catch (error) {
      console.error("Erreur lors de la fermeture de la connexion BDD:", error);
      process.exit(1);
    }
  });
}

// SIGTERM : envoyé par Render (mise en veille) et la plupart des orchestrateurs.
// SIGINT : envoyé par un Ctrl+C en local pendant le développement.
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));