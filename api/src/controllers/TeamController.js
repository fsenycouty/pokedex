import { Team } from "../models/index.js";
import HttpError from "../utils/HttpError.js";
import { isTeamOwner } from "../services/team.owner.service.js";
import { MESSAGES } from "../utils/messages.js";

class TeamController {
  // Consulter la liste des Team
  getAll = async (req, res) => {
    // Résumé : uniquement id et name
    const teams = await Team.findAll({
      attributes: ["id", "name"],
    });

    res.status(200).json(teams);
  };

  // Consulter les détails d'une Team
  getById = async (req, res) => {
    // Détail complet + liste des pokemons associés
    // (sans les attributs de la table pivot)
    const team = await Team.findByPk(req.params.id, {
      attributes: ["id", "name", "description"],
      include: [
        {
          association: "pokemons",
          through: { attributes: [] },
          attributes: ["id", "name"],
        },
      ],
    });

    if (!team) {
      throw new HttpError(MESSAGES.TEAM_NOT_FOUND, 404);
    }

    res.status(200).json(team);
  };

  // Créer une nouvelle Team
  create = async (req, res) => {
    const { name, description } = req.body;

    // Vérifie qu'aucune équipe n'a déjà ce nom
    const existingTeam = await Team.findOne({
      where: { name },
    });

    if (existingTeam) {
      throw new HttpError(MESSAGES.TEAM_ALREADY_EXISTS, 409);
    }

    // user_id vient de req.user (injecté par validateToken), jamais du body :
    // (pour qu'un utilisateur ne puisse pas créer une équipe au nom d'un autre)
    const newTeam = await Team.create({
      name,
      description,
      user_id: req.user.id,
    });

    res.status(201).json(newTeam);
  };

  // Modifier le nom d'une équipe
  updateById = async (req, res) => {
    // Charge l'équipe en mémoire
    // (nécessaire pour vérifier le propriétaire ensuite)
    const team = await Team.findByPk(req.params.id);

    if (!team) {
      throw new HttpError(MESSAGES.TEAM_NOT_FOUND, 404);
    }

    // Vérifie que l'équipe appartient bien à l'utilisateur connecté
    // 403 : l'équipe existe mais l'utilisateur n'a juste pas de droit dessus
    if (!isTeamOwner(team, req.user.id)) {
      throw new HttpError(MESSAGES.TEAM_FORBIDDEN_UPDATE, 403);
    }

    // Vérifie qu'aucune AUTRE équipe n'a déjà ce nom
    // (exclut l'équipe elle-même, sinon un renommage à l'identique échouerait)
    const teamsWithSameName = await Team.findAll({
      where: { name: req.body.name },
    });

    const existingTeam = teamsWithSameName.find((t) => t.id !== team.id);

    if (existingTeam) {
      throw new HttpError(MESSAGES.TEAM_ALREADY_EXISTS, 409);
    }

    // Modifie l'instance en mémoire puis persiste le changement
    // (UPDATE ciblé sur les champs modifiés)
    team.name = req.body.name;
    await team.save();

    res.status(200).json(team);
  };

  // Supprimer une équipe
  delete = async (req, res) => {
    // Charge l'équipe en mémoire
    // (nécessaire pour vérifier le propriétaire ensuite)
    const team = await Team.findByPk(req.params.id);

    if (!team) {
      throw new HttpError(MESSAGES.TEAM_NOT_FOUND, 404);
    }

    // Vérifie que l'équipe appartient bien à l'utilisateur connecté
    if (!isTeamOwner(team, req.user.id)) {
      throw new HttpError(MESSAGES.TEAM_FORBIDDEN_DELETE, 403);
    }

    await team.destroy();

    res.status(200).json({ message: "Équipe supprimée avec succès." });
  };
}

export default new TeamController();
