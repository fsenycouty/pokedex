import HttpError from "../utils/HttpError.js";
import jwt from "jsonwebtoken";
import { User } from "../models/index.js";

export async function validateToken(req, res, next) {
  // 1. Dans l'entête de la requête HTTP, on attend ==> "Authorization": "Bearer <token>"
  // Donc, dans les entêtes de la requête, prendre la valeur de la clé "authorization"
  const bearerToken = req.headers.authorization;

  // 2. Vérifie que bearerToken n'est pas null et qu'il commence par la string "Bearer "
  if (!bearerToken || !bearerToken.startsWith("Bearer ")) {
    throw new HttpError("Autorisation manquante ou invalide", 401);
  }

  // 3. bearerToken n'est pas null et commence par "Bearer "
  // Découpe la string autour de l'espace " " et prendre la deuxième partie : tableau index 1
  const token = bearerToken.split(" ")[1];

  // 4. Utilise JWT pour vérifier le token
  let tokenPayload;
  try {
    tokenPayload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    console.error(err.message);
    throw new HttpError("Autorisation manquante ou invalide", 401);
  }

  // Rechercher le user
  const user = await User.findByPk(tokenPayload.user_id, {
    attributes: ["id", "username"],
  });

  if (!user) {
    throw new HttpError("L'utilisateur n'existe pas !", 401); // 401 unauthorized
  }

  req.user = user;

  next();
}
