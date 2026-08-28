// Gestion des modèles
import Pokemon from "./Pokemon.js";
import Type from "./Type.js";
import Team from "./Team.js";
import User from "./User.js";

// 1. Relation Many-to-Many entre Pokemon et Type
// a. Un Pokemon peut avoir plusieurs Type
Pokemon.belongsToMany(Type, {
  // On doit commencer par préciser à travers quelle table on doit faire cette relation
  // On précise donc le nom de la table de liaison (table pivot)
  through: "pokemon_type",
  // On précise la première clé dans la table de liaison
  foreignKey: "pokemon_id",
  // On doit aussi préciser quelle est la seconde clé étrangère
  otherKey: "type_id",
  // On précise toujours notre alias pour plus de simplicité

  // const myPokemon = Pokemon.find(...)
  // const myTypes = myPokemon.types;
  // ici "types" c'est l'alias de l'association
  as: "types",
  onDelete: "CASCADE",
});
// b. Un Type peut appartenir à plusieurs Pokemon
Type.belongsToMany(Pokemon, {
  // On reproduit la relation inverse sur le même plan que celle juste au dessus 👆
  through: "pokemon_type",
  foreignKey: "type_id",
  otherKey: "pokemon_id",
  // const myType = Type.find(...)
  // const myPokemons = myType.pokemons
  as: "pokemons",
  onDelete: "CASCADE",
});

// 2. Relation Many-to-Many entre Team et Pokemon
// a. Une Team peut avoir plusieurs Pokemon
Team.belongsToMany(Pokemon, {
  // On doit commencer par préciser à travers quelle table on doit faire cette relation
  // On précise donc le nom de la table de liaison (table pivot)
  through: "team_pokemon",
  // On précise la première clé dans la table de liaison
  foreignKey: "team_id",
  // On doit aussi préciser quelle est la seconde clé étrangère
  otherKey: "pokemon_id",
  // On précise toujours notre alias pour plus de simplicité

  // const myTeam = Team.find(...)
  // const myPokemons = myTeam.pokemons;
  // ici "pokemons" c'est l'alias de l'association
  as: "pokemons",
  onDelete: "CASCADE",
});
// b. Un Pokemon peut appartenir à plusieurs Team
Pokemon.belongsToMany(Team, {
  // On reproduit la relation inverse sur le même plan que celle juste au dessus 👆
  through: "team_pokemon",
  foreignKey: "pokemon_id",
  otherKey: "team_id",
  // const myPokemon = Pokemon.find(...)
  // const myTeams = myPokemon.teams
  as: "teams",
  onDelete: "CASCADE",
});

// 3. Relation One-to-Many entre User et Team
// a. Une Team appartient à un User
Team.belongsTo(
  User,
  // configuration de l'association
  {
    // nom de la colonne qui contient la clé étrangère
    foreignKey: "user_id",
    // alias du nom de la relation entre Team et User
    // belongs to : one User ==> donc alias = user au singulier
    as: "user",
    onDelete: "SET NULL",
  },
);

// b. Un User possede plusieurs Team
User.hasMany(Team, {
  // nom de la colonne qui contient la clé étrangère
  // la même pour belongsTo Team
  foreignKey: "user_id",
  // alias : has many Team ==> alias = teams au pluriel
  as: "teams",
});

// Exporte tous nos modèles
export { Pokemon, Type, Team, User };
