import { Router } from 'express';
import controller from '../controllers/TeamPokemonController.js';
import { validateToken } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validation.middleware.js";
import { teamPokemonSchema } from "../schemas/team.pokemon.schema.js";

const router = Router();

/**
 * @openapi
 * /teams/{idTeam}/pokemons:
 *   post:
 *     tags: [TeamPokemon]
 *     summary: Ajoute un Pokémon à une équipe
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idTeam
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
 *             required: [id]
 *             properties:
 *               id:
 *                 type: integer
 *                 description: ID du Pokémon à ajouter
 *                 example: 25
 *     responses:
 *       200:
 *         description: Pokémon ajouté
 *       400:
 *         description: Données invalides (validation Joi)
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Vous n'êtes pas autorisé à modifier cette équipe
 *       404:
 *         description: L'équipe ou le Pokémon n'existe pas
 *       409:
 *         description: Équipe déjà complète (6 Pokémons maximum) ou Pokémon déjà présent dans l'équipe
 */
router.post("/teams/:idTeam/pokemons", validateToken, validate(teamPokemonSchema), controller.addPokemon);

/**
 * @openapi
 * /teams/{idTeam}/pokemons/{idPokemon}:
 *   delete:
 *     tags: [TeamPokemon]
 *     summary: Retire un Pokémon d'une équipe
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idTeam
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la Team
 *       - in: path
 *         name: idPokemon
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du Pokémon à retirer
 *     responses:
 *       200:
 *         description: Pokémon retiré de l'équipe
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Vous n'êtes pas autorisé à modifier cette équipe
 *       404:
 *         description: L'équipe n'existe pas, ou le Pokémon n'existe pas dans cette équipe
 */
router.delete("/teams/:idTeam/pokemons/:idPokemon", validateToken, controller.deletePokemon);

export default router;