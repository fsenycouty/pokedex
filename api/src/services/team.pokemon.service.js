// Service de vérification Limite et Unicité de pokemon
export function checkTeamPokemon (team, idPokemon) {
  // Recherche si le pokemon existe dans la Team
  const findPokemon = team.pokemons.find(
    (pokemon) => pokemon.id === Number(idPokemon)
  );

  if (!findPokemon) {
    // Verifie si la limite max du nombre de pokemons est atteinte
    if (team.pokemons.length < 6) {
      return { allowed: true };
    } else {
      return { allowed: false, reason: "TEAM_FULL" };
    }
  } else {
    return { allowed: false, reason: "ALREADY_IN_TEAM" };
  }
}
