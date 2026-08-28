import { Sequelize } from "sequelize";
import "dotenv/config";

// NODE_ENV=test coupe seulement les logs SQL pendant les tests.
// (pour la BDD de test : env.setup.js charge .env.test à la place de .env)
const isTest = process.env.NODE_ENV === "test";

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  // Options de connexion à la BDD
  logging: !isTest && console.log, // logs SQL coupés en test, affichés en dev
  define: {
    // Ajoute les champs createdAt et updatedAt à chaque table
    timestamps: true,
    // Comme on utilise les conventions du snake_case depuis le début,
    // on va préciser à l'ORM de le faire aussi !
    underscored: true,
    // Une convention pour que Sequelize ne mette pas les noms de table au pluriel tout seul
    freezeTableName: true,
  },
});

// Ici, on va tester notre connexion
try {
  // Pour se connecter, l'ORM Sequelize propose sa méthode "authenticate()" qui renvoie une promesse
  await sequelize.authenticate();
  // Log de confirmation utile en dev (inutile pendant les tests)
  if (!isTest) {
    console.log('✅ Connection to the database has been established successfully.');
  }
} catch (error) {
  console.error('❌ Unable to connect to the database:', error);
}

export default sequelize;