// Schema Joi : validation du body pour l'ajout d'un pokemon à une équipe
import Joi from "joi";

export const teamPokemonSchema = Joi.object({
  id: Joi.number().integer().required(),
});
