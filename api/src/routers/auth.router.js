import { Router } from "express";
import controller from "../controllers/AuthController.js";
import { validate } from "../middlewares/validation.middleware.js";
import { registerSchema } from "../schemas/register.schema.js";
import { loginSchema } from "../schemas/login.schema.js";
import { validateToken } from "../middlewares/auth.middleware.js";

const router = Router();

/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Crée un compte utilisateur
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, email, password]
 *             properties:
 *               username:
 *                 type: string
 *                 example: "Alice"
 *               email:
 *                 type: string
 *                 example: "alice@pokedex.io"
 *               password:
 *                 type: string
 *                 example: "Azertyuiop1234"
 *     responses:
 *       201:
 *         description: Compte utilisateur créé
 *       400:
 *         description: Données invalides (validation Joi)
 *       409:
 *         description: Nom d'utilisateur ou email déjà utilisé
 *         content:
 *           application/json:
 *             examples:
 *               usernameExists:
 *                 summary: Nom d'utilisateur déjà pris
 *                 value: { message: "l'utilisateur existe déjà" }
 *               emailExists:
 *                 summary: Email déjà utilisé
 *                 value: { message: "L'email existe déjà" }
 */
router.post(
  "/auth/register",
  validate(registerSchema),
  controller.registerUser,
);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Connexion d'un utilisateur
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: "alice@pokedex.io"
 *               password:
 *                 type: string
 *                 example: "Azertyuiop1234"
 *     responses:
 *       200:
 *         description: Utilisateur bien connecté
 *       400:
 *         description: Données invalides (validation Joi)
 *       401:
 *         description: Email ou mot de passe incorrect
 */
router.post("/auth/login", validate(loginSchema), controller.login);

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Déconnexion de l'utilisateur
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Utilisateur bien déconnecté
 *       401:
 *         description: Non authentifié
 */
router.post("/auth/logout", validateToken, controller.logout);

export default router;
