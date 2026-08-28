// Schema Joi : validation du body pour la connexion
// Vérifie juste que les champs nécessaires sont présents avant d'interroger la BDD
import Joi from "joi";

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});