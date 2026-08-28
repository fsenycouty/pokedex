import { Router } from "express";
import controller from "../controllers/TeamController.js";
import { validateToken } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validation.middleware.js";
import { teamSchema } from "../schemas/team.schema.js";

const router = Router();

/**
 * @openapi
 * /teams:
 *   get:
 *     tags: [Team]
 *     summary: Liste tous les équipes
 *     responses:
 *       200:
 *         description: Liste des Teams
 */
router.get("/teams", controller.getAll);

/**
 * @openapi
 * /teams/{id}:
 *   get:
 *     tags: [Team]
 *     summary: Récupère les détails d'une équipe par son ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la Team
 *     responses:
 *       200:
 *         description: Détails de la Team
 *       404:
 *         description: L'équipe n'existe pas !
 */
router.get("/teams/:id", controller.getById);

/**
 * @openapi
 * /teams:
 *   post:
 *     tags: [Team]
 *     summary: Crée une nouvelle équipe
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Furious Team"
 *               description:
 *                 type: string
 *                 example: "The winner"
 *     responses:
 *       201:
 *         description: Équipe créée
 *       400:
 *         description: Données invalides (validation Joi)
 *       401:
 *         description: Non authentifié
 *       409:
 *         description: L'équipe existe déjà !
 */
router.post("/teams", validateToken, validate(teamSchema), controller.create);

/**
 * @openapi
 * /teams/{id}:
 *   patch:
 *     tags: [Team]
 *     summary: Modifier une équipe
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la Team
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Extravagant Team"
 *     responses:
 *       200:
 *         description: Le nom de l'équipe a bien été modifié
 *       400:
 *         description: Données invalides (validation Joi)
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Vous n'êtes pas autorisé à modifier cette équipe
 *       404:
 *         description: L'équipe n'existe pas !
 *       409:
 *         description: L'équipe existe déjà !
 */
router.patch(
  "/teams/:id",
  validateToken,
  validate(teamSchema),
  controller.updateById,
);

/**
 * @openapi
 * /teams/{id}:
 *   delete:
 *     tags: [Team]
 *     summary: Supprimer une équipe
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la Team
 *     responses:
 *       200:
 *         description: L'équipe a bien été supprimée
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Vous n'êtes pas autorisé à supprimer cette équipe
 *       404:
 *         description: L'équipe n'existe pas !
 */
router.delete("/teams/:id", validateToken, controller.delete);

export default router;
