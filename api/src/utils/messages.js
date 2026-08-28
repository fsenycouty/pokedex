// Messages d'erreur réutilisés dans plusieurs controllers, centralisés ici
// pour éviter les doublons (et rester cohérent si le texte doit changer)
export const MESSAGES = {
  TEAM_NOT_FOUND: "L'équipe n'existe pas !",
  TEAM_ALREADY_EXISTS: "L'équipe existe déjà !",
  TEAM_FORBIDDEN_UPDATE: "Vous n'êtes pas autorisé à modifier cette équipe.",
  TEAM_FORBIDDEN_DELETE: "Vous n'êtes pas autorisé à supprimer cette équipe.",
  POKEMON_NOT_FOUND: "Le pokémon n'existe pas !",
  POKEMON_NOT_IN_TEAM: "Le pokémon n'existe pas dans cette équipe !",
};
