import sequelize from "../config/sequelize.client.js";
import { Pokemon, Type, Team, User } from "../models/index.js";
import dataJson from "../../data/dataset.json" with { type: "json" };
import { hashPassword } from "../services/password.service.js";

async function seed() {
  // 1. Vérifie la synchronisation de la BDD
  console.log("Synchronisation de la BDD...");
  // Force la réinsertion des données en supprimant les tables avant des les recréer
  await sequelize.sync({ force: true });

  // 2. Envoie les datas en BDD
  // Pokemon
  console.log("Seeding Pokemon...");
  // On utilise la méthode "bulkCreate" de notre modèle qui permet d'insérer plusieurs lignes en BDD en simultané.
  // dataJson.pokemons --> la clé pokemons définie dans le JSON
  await Pokemon.bulkCreate(dataJson.pokemons, {
    returning: true,
  });

  // Type
  console.log("Seeding Type...");
  await Type.bulkCreate(dataJson.types, {
    returning: true,
  });

  // User
  console.log("Seeding Users...");
  // On parcours tout le talbeau users de "dataJson"
  for (const user of dataJson.users) {
    // On fait le hash du password
    user.password_hash = await hashPassword(user.password);
    // On insère le nouveau user dans la BDD
    await User.create(user);
  }

  // Team
  console.log("Seeding Team...");
  await Team.bulkCreate(dataJson.teams, {
    returning: true,
  });

  let myPokemon;
  let myType;
  let myTeam;

  for (let pokemonType of dataJson.pokemon_type) {
    // recherche dans la BDD un Pokemon selon son ID (ID dans le json)
    myPokemon = await Pokemon.findByPk(pokemonType.pokemon_id);

    // recherche dans la BDD un Type selon son ID (ID dans le json)
    myType = await Type.findByPk(pokemonType.type_id);

    // j'ai le Pokemon et le Type, je peux les associer
    // ajoute dans myPokemon, le type myType
    // la fonction addType est fournie par Sequelize
    // addType est disponible parce-que j'ai défini l'association N - N entre Pokemon et Type dans models/index.js
    await myPokemon.addType(myType);
  }

  for (let teamPokemon of dataJson.team_pokemon) {
    // recherche dans la BDD un Team selon son ID (ID dans le json)
    myTeam = await Team.findByPk(teamPokemon.team_id);

    // recherche dans la BDD un Pokemon selon son ID (ID dans le json)
    myPokemon = await Pokemon.findByPk(teamPokemon.pokemon_id);

    // j'ai la Team et le Pokemon, je peux les associer
    // ajoute dans myTeam, le pokemon myPokemon
    // la fonction addPokemon est fournie par Sequelize
    // addPokemon est disponible parce-que j'ai défini l'association N - N entre Team et Pokemon dans models/index.js
    await myTeam.addPokemon(myPokemon);
  }

  // 3. On fermer la connection sequelize
  console.log("✅ Seeding complete!");
  await sequelize.close();
}

seed();
