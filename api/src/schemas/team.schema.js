// Schema Joi : validation du nom de l'équipe
import Joi from "joi";

export const teamSchema = Joi.object({
  name: Joi.string().min(1).max(50).required(),
  description: Joi.string().optional(),
});