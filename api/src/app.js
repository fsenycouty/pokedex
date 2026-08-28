/** app.js **/

// Swagger UI : sert la documentation interactive de l'API, générée à
// partir des commentaires @openapi présents dans les routeurs
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.js";

// Configuration de app
import 'dotenv/config';
import express from 'express';
import authRouter from './routers/auth.router.js';
import teamRouter from './routers/team.router.js';
import teamPokemonRouter from './routers/team.pokemon.router.js';
import pokemonRouter from './routers/pokemon.router.js';
import errorController from './controllers/ErrorController.js';

// Express app
const app = express();

// Pour parser le contenu des requetes en JSON
app.use(express.json());

// Route register et login utilisateur
app.use(authRouter);

// Routes team, pokemon et team_pokemon
app.use(teamRouter);
app.use(teamPokemonRouter);
app.use(pokemonRouter);

// swaggerUi.serve : charge les assets statiques de l'interface Swagger UI
// swaggerUi.setup(swaggerSpec) : génère la page à partir de la spec OpenAPI
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Route par défaut si aucune route n'a été trouvée
app.use(errorController.route404);

// Gestion des erreur
// Toutes les routes qui lancent une erreur gérées par ce controller
app.use(errorController.errorHandler);

export default app;