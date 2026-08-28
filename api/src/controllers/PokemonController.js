import { Pokemon } from "../models/index.js";
import HttpError from '../utils/HttpError.js';
import { MESSAGES } from "../utils/messages.js";

class PokemonController {
  // Consulter la listes des Pokemons
  getAll = async (req, res) => {
    const pokemons = await Pokemon.findAll({
      attributes: ["id", "name"],
    });

    res.status(200).json(pokemons);
  };

  // Consulter les détails d'un Pokemon
  getById = async (req, res) => {
    const pokemon = await Pokemon.findByPk(req.params.id, {
      include: [
        {
          association: "types",
          through: { attributes: [] },
          attributes: ["id", "name", "color"],
        },
      ],
    });

    if (!pokemon) {
      throw new HttpError(MESSAGES.POKEMON_NOT_FOUND, 404);
    }

    res.status(200).json(pokemon);
  };
}

export default new PokemonController();
