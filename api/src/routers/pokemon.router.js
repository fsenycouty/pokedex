import { Router } from "express";
import controller from "../controllers/PokemonController.js";

const router = Router();

/**
 * @openapi
 * /pokemons:
 *   get:
 *     tags: [Pokemon]
 *     summary: Liste tous les Pokémons
 *     responses:
 *       200:
 *         description: Liste des Pokémons
 */
router.get("/pokemons", controller.getAll);

/**
 * @openapi
 * /pokemons/{id}:
 *   get:
 *     tags: [Pokemon]
 *     summary: Récupère les détails d'un Pokémon par son ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du Pokémon
 *     responses:
 *       200:
 *         description: Détails du Pokémon
 *       404:
 *         description: Le Pokémon n'existe pas
 */
router.get("/pokemons/:id", controller.getById);

export default router;
