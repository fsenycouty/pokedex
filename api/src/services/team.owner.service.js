// Vérifie qu'une équipe appartient bien à l'utilisateur donné
export function isTeamOwner(team, userId) {
  return team.user_id === userId;
}
