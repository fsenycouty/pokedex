import { User } from "../models/index.js";
import { hashPassword, verifyPassword } from "../services/password.service.js";
import HttpError from "../utils/HttpError.js";
import jwt from "jsonwebtoken";

class AuthController {
  registerUser = async (req, res) => {
    const { username, email, password } = req.body;

    // Cherche le user et l'email dans la BDD
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      throw new HttpError("l'utilisateur existe déjà", 409);
    }

    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) {
      throw new HttpError("L'email existe déjà", 409);
    }

    // Hash du mot de passe
    const password_hash = await hashPassword(password);

    // Enregistrer l'utilisateur dans la BDD avec le mot de passe hashé
    const newUser = await User.create({
      username,
      email,
      password_hash,
    });

    res.status(201).json({
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
    });
  };

  login = async (req, res) => {
    const { email, password } = req.body;

    // 1. Cherche le user dans la BDD à partir de son email et verifie si le password est valide
    const foundUser = await User.findOne({ where: { email } });

    if (
      !foundUser ||
      !(await verifyPassword(foundUser.password_hash, password))
    ) {
      throw new HttpError("Email ou mot de passe incorrect", 401);
    }

    // 2. Calcule du token JWT
    const token = jwt.sign({ user_id: foundUser.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({
      token,
      id: foundUser.id,
      username: foundUser.username,
    });
  };

  logout = async (req, res) => {
    res.status(200).json({ message: "Vous avez bien été déconnecté" });
  };
}

export default new AuthController();
