// Schema Joi : validation du body pour l'inscription utilisateur
import Joi from "joi";

export const registerSchema = Joi.object({
  // 3-20 caractères, uniquement lettres/chiffres, obligatoire
  username: Joi.string().alphanum().min(3).max(20).required(),

  // Format email valide, obligatoire
  email: Joi.string().email().required(),

  // 8-128 caractères, obligatoire
  // Lookaheads (?=...) : imposent la présence d'au moins une minuscule, une majuscule
  // et un chiffre n'importe où dans la chaîne, sans restreindre les caractères autorisés
  password: Joi.string()
    .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,128}$"))
    .required(),
});