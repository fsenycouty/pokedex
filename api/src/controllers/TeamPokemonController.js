import { Pokemon, Team } from "../models/index.js";
import { checkTeamPokemon } from "../services/team.pokemon.service.js";
import HttpError from "../utils/HttpError.js";
import { isTeamOwner } from "../services/team.owner.service.js";
import { MESSAGES } from "../utils/messages.js";

const pokemonsInclude = [
  { association: "pokemons", through: { attributes: [] } },
];

class TeamPokemonController {
  // Ajouter un pokemon à une équipe
  addPokemon = async (req, res) => {
    const idTeam = req.params.idTeam;
    const idPokemon = req.body.id;

    // Recherche de la Team avec sa liste de pokemons à partir de :id dans l'URL
    const team = await Team.findByPk(idTeam, { include: pokemonsInclude });

    if (!team) {
      throw new HttpError(MESSAGES.TEAM_NOT_FOUND, 404);
    }

    // Vérifie que l'équipe appartient bien à l'utilisateur connecté
    // 403 : l'équipe existe mais l'utilisateur n'a juste pas de droit dessus
    if (!isTeamOwner(team, req.user.id)) {
      throw new HttpError(MESSAGES.TEAM_FORBIDDEN_UPDATE, 403);
    }

    // Recherche du pokemon à partir de la clé id dans le body de la request
    const pokemon = await Pokemon.findByPk(idPokemon);

    if (!pokemon) {
      throw new HttpError(MESSAGES.POKEMON_NOT_FOUND, 404);
    }

    // Verifie la limite et l'unicité du pokemon
    const result = checkTeamPokemon(team, idPokemon);

    if (!result.allowed) {
      const messages = {
        TEAM_FULL: "L'équipe est déjà complète (6 Pokémons maximum).",
        ALREADY_IN_TEAM: "Ce pokémon est déjà dans cette équipe.",
      };
      throw new HttpError(messages[result.reason], 409);
    }

    // Ajout du pokemon dans la team
    // addPokemon => méthode Sequelize ajoutée grâce à l'association Team <-> Pokemon dans models/index.js
    await team.addPokemon(idPokemon);

    // "Refresh" de team pour récupérer la team avec tous ses pokemons
    await team.reload({ include: pokemonsInclude });

    res.status(200).json(team);
  };

  // Supprimer un pokemon d'une équipe
  deletePokemon = async (req, res) => {
    const idTeam = req.params.idTeam;
    const idPokemon = req.params.idPokemon;

    // Recherche de la Team avec sa liste de pokemons à partir de :idTeam dans l'URL
    const team = await Team.findByPk(idTeam, { include: pokemonsInclude });

    if (!team) {
      throw new HttpError(MESSAGES.TEAM_NOT_FOUND, 404);
    }

    // Vérifie que l'équipe appartient bien à l'utilisateur connecté
    if (!isTeamOwner(team, req.user.id)) {
      throw new HttpError(MESSAGES.TEAM_FORBIDDEN_DELETE, 403);
    }
    // Recherche si le pokemon existe dans la Team
    const findPokemon = team.pokemons.find(
      (pokemon) => pokemon.id === Number(idPokemon)
    );

    if (!findPokemon) {
      throw new HttpError(MESSAGES.POKEMON_NOT_IN_TEAM, 404);
    }

    // Supprime le pokemon de la team
    await team.removePokemon(idPokemon);

    // "Refresh" de team pour récupérer la team avec tous ses pokemons
    await team.reload({ include: pokemonsInclude });

    res.status(200).json(team);
  };
}

export default new TeamPokemonController();
