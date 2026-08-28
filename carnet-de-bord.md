# Carnet de bord — Projet Pokédex (SB09)

## 2026-08-28
 
### Objectifs du jour
- Factorisation : messages d'erreur centralisés
- Revue d'architecture et de qualité de code sur l'ensemble du projet avec Claude Code, avant mise en ligne effective du repo GitHub
- Corriger les incohérences trouvées et rajouter des tests

### Travail réalisé
- Nettoyage : tokens JWT réels retirés des fichiers `.http` (`rest-client/`), remplacés par du chaînage de requêtes REST Client (`# @name login` + `{{login.response.body.token}}`)
- `package.json` : `description`/`author`/`keywords` renseignés, `nodemon` déplacé en `devDependencies`, `engines` ajouté (`node >=20`, contrainte réelle de `joi`/`swagger-jsdoc`)
- Messages d'erreur dupliqués (5 occurrences de "L'équipe n'existe pas !" entre `TeamController` et `TeamPokemonController`, etc.) centralisés dans `utils/messages.js`
- Couverture de tests renforcée (générés par Claude Code) : passage de 6 à 37 tests — CRUD `Team` complet (ownership, unicité), `TeamPokemonController` complet (limite de 6, unicité, ownership), cas limites de `validateToken` (header absent/mal formé, token invalide, expiré, utilisateur supprimé après émission du token), tests unitaires pour `password.service` et `team.owner.service`

### Difficultés rencontrées / corrigées
- En ajoutant les nouveaux fichiers de test d'intégration, la suite est devenue instable (`SequelizeUniqueConstraintError`, `relation "user" does not exist`) : plusieurs fichiers de test exécutaient chacun leur propre `sequelize.sync({force:true})` **en parallèle** sur la même BDD `pokedex_test`, et se marchaient dessus. Invisible avant car un seul fichier touchait la BDD jusqu'ici. Corrigé en forçant l'exécution séquentielle des fichiers (`--test-concurrency=1` dans le script `test`)

### À poursuivre
- Mettre en place le CI (GitHub Actions, service container Postgres) — en cours
- Fonctionnalités (recherche, favoris, score d'équipe)

---

## 2026-08-27
 
### Objectifs du jour
- Finaliser la BDD de test et écrire les tests automatisés demandés par la roadmap (limite de 6, unicité, connexion, inscription)
- Réorganiser le projet en dossier `src/`
- Mettre en place la documentation Swagger de l'API

### Travail réalisé
- Finalisation de la BDD de test : `.env.test`, script de préchargement `env.setup.js` (chargé via `--import`), script `npm test` corrigé
- Réorganisation complète en dossier `src/` (`config`, `controllers`, `routers`, `services`, `middlewares`, `schemas`, `utils`, `migrations`, `models`, `tests`), en gardant `.env`, `package.json`, `data/` à la racine d'`api/`
- Tests unitaires sur `checkTeamPokemon` (3 tests : cas autorisé, limite de 6 atteinte, Pokémon déjà présent)
- Tests d'intégration sur l'authentification (`auth.test.js`, 3 tests) : inscription sans mot de passe dans la réponse, connexion avec message d'erreur identique pour email inexistant et mot de passe incorrect
- Setup de tests d'intégration (`server.setup.js`) : démarrage d'un serveur de test sur un port libre, synchronisation/vidage/suppression de la BDD de test — version avec hooks au niveau racine du fichier (appliqués automatiquement à tout fichier de test qui l'importe)
- Logs SQL Sequelize coupés pendant les tests (`logging` conditionné à `NODE_ENV`)
- 6 tests automatisés passent au total (3 unitaires + 3 intégrations)
- Documentation Swagger mise en place (approche JSDoc dans les routeurs, choisie après comparaison avec un fichier OpenAPI séparé) : `swagger-jsdoc` + `swagger-ui-express` installés, config `config/swagger.js`, montée sur `/api/docs` dans `app.js`
- Toutes les routes documentées avec `@openapi` : `pokemon.router.js`, `team.router.js`, `team.pokemon.router.js`, `auth.router.js` — tags, `security` (bearerAuth) sur les routes protégées, `requestBody`, codes de réponse détaillés (y compris exemples multiples pour un même code, ex. 409 sur l'inscription)

### Difficultés rencontrées / corrigées
- Plusieurs bugs de syntaxe dans les premiers jets des tests d'intégration : parenthèse en trop autour de `fetch(...)`, `{...}` littéral non remplacé, `response` (objet Response) comparé directement au lieu du `body` JSON extrait, assertion avec un `id` deviné en dur (fragile) — tous corrigés
- Mélange accidentel de la syntaxe Chai (`expect(...).to.equal(...)`) dans un fichier qui utilise `assert` natif de `node:test` — corrigé
- Documentation Swagger : deux erreurs d'indentation YAML

### À poursuivre
- Factorisation : messages d'erreur centralisés

---

## 2026-08-26
 
### Objectifs du jour
- Mettre en place l'authentification complète (connexion, déconnexion), l'autorisation ("mes propres équipes") et la validation stricte (Joi)
- Centraliser la gestion d'erreur
- Démarrer les tests automatisés

### Travail réalisé
- Gestion d'erreur centralisée : classe `HttpError` (statusCode validé via setter), `ErrorController` (`errorHandler` + `route404`), en tirant parti d'Express 5 (rejets de Promise async capturés nativement) — refactor complet des 4 controllers (Auth, Team, Pokemon, TeamPokemon) pour supprimer tous les `try/catch` au profit de `throw new HttpError(...)`
- Validation Joi mise en place : middleware générique `validate(schema)`, schémas `registerSchema`, `loginSchema`, `teamSchema`, branchés sur les routes correspondantes
- Middleware `validateToken` (JWT : extraction Bearer, vérification, recherche du user en BDD, injection `req.user`)
- Connexion (`POST /auth/login`) finalisée : message d'erreur flou et identique ("Email ou mot de passe incorrect"), code `401`
- Autorisation "propres équipes" : `TeamController` (`create` utilise `req.user.id`, `updateById`/`delete` vérifient la propriété : 404 si absente, 403 si pas propriétaire) et `TeamPokemonController` (même logique sur `addPokemon`/`deletePokemon`)
- Déconnexion (`POST /auth/logout`) implémentée en version minimale (pas de révocation serveur, décision assumée)
- `.gitignore` revu (`node_modules`, `.env`, `.vscode/`)
- Factorisation (piste 1) : `pokemonsInclude` extrait en constante dans `TeamPokemonController`, réutilisé aux 4 endroits — pistes 2 (service `isTeamOwner`)
- Mise en place d'une BDD de test dédiée (`pokedex_test`, même utilisateur `admin_pokedex`) en préparation des tests automatisés

### Difficultés rencontrées / corrigées
- `AuthController.registerUser` : le `catch` avalait les `HttpError` 409 volontaires pour les remplacer par une erreur générique — corrigé pour laisser remonter les `HttpError` telles quelles
- `ErrorController.errorHandler` : fuite du message SQL brut (`err.parent.message`) au client — corrigé (message générique au client, détail loggué côté serveur avec contexte de la route)
- Après suppression des `try/catch`, du code mort a été laissé dans `registerUser` (référence à une variable `error` qui n'existait plus) — corrigé
- `login` : `foundUser.password` au lieu de `foundUser.password_hash` — corrigé ; puis code HTTP `404` utilisé par erreur au lieu de `401`, message dévié du texte exact demandé par la roadmap — corrigés
- `validateToken` : `jwt.verify` utilisé avec callback, dont le `throw` ne remonte jamais — corrigé en forme synchrone avec `try/catch`
- tests unitaires sur `checkTeamPokemon` (limite de 6, unicité)

### À poursuivre
- Finaliser la BDD de test (`DATABASE_URL_TEST`, bascule sur `NODE_ENV=test` dans `sequelize.client.js`, script `npm test`)
- Écrire les tests : intégration sur `auth` (message d'erreur identique à la connexion, pas de mot de passe dans la réponse d'inscription)
- Factorisation : messages d'erreur centralisés
- Fonctionnalités à venir : recherche (nom/type), favoris, score d'équipe

---

## 2026-08-25

### Objectifs du jour
- Terminer la gestion des Pokémons d'une équipe avec les règles métier (limite de 6, unicité) en couche Service
- Faire évoluer la conception : entité `USER` et association à `TEAM`
- Démarrer l'authentification (inscription)

### Travail réalisé
- Endpoints liste/détail `Pokemon` implémentés (`PokemonController.js`, `pokemon.router.js`)
- Gestion des Pokémons d'une équipe (`TeamPokemonController.js` + `team.pokemon.router.js`) : ajout/retrait, avec vérification de l'existence de la Team et du Pokémon
- Couche Service `services/team.pokemon.service.js` : `checkTeamPokemon(team, idPokemon)` vérifie la limite de 6 Pokémons et l'unicité, intégrée au Controller avec réponse `409 Conflict` et message dédié selon la raison du refus
- Correction du message de confirmation à la suppression d'une équipe (`204` → `200` + message JSON, conformément à la roadmap)
- Conception (branche `docs/user-conception`) : entité `USER` (username, email, password_hash) ajoutée au MCD/MLD/MPD, association 1-N avec `TEAM` (`USER` 0,N — `TEAM` 0,1), FK `user_id` nullable avec `ON DELETE SET NULL`
- Model `User.js` créé, association `Team.belongsTo(User)` / `User.hasMany(Team)` dans `models/index.js`
- Seed enrichi : 2 users ajoutés à `dataset.json`, une équipe existante rattachée à un user via `user_id`
- Service `services/password.service.js` créé : `hashPassword`/`verifyPassword` avec Argon2id, intégré dans `seed.tables.js`
- Inscription utilisateur (`AuthController.registerUser`, `POST /auth/register`) : hash du mot de passe, vérification d'unicité `username` et `email`, réponse sans `password_hash`

### Difficultés rencontrées / corrigées
- `checkTeamPokemon` (première version) : bug off-by-one sur la limite de 6 et cas "déjà dans l'équipe" non géré — corrigés
- Bug dans le seed : mauvaise lecture du champ JSON (`user.password_hash` au lieu de `user.password`) lors du hachage — corrigé

### À poursuivre
- Connexion / déconnexion (login/logout)
- Validation stricte des entrées avec Joi + middleware de validation générique
- Ajouter les middlewares 404/500 globaux dans `app.js`
- Fonctionnalités à venir : documentation Swagger, tests automatisés, recherche (nom/type), favoris, score d'équipe

---

## 2026-08-24

### Objectifs du jour
- Poser la conception des données du projet : MCD → MLD → MPD
- Démarrer le CRUD `team`

### Travail réalisé
- MCD (Mocodo) : entités `POKEMON`, `TEAM`, `TYPE`, associations `IS_COMPOSED_OF` (0,N–0,N) et `BELONGS_TO` (1,N–0,N)
- MLD : traduction des associations N-N en tables de jonction
- MPD : script final avec clé primaire technique `id` sur chaque table, en conservant la structure du script SQL fourni dans l'exercice, FK avec `ON DELETE CASCADE`
- Charte de nommage (`NAMING_CONVENTION.md`), complétée en cours de session avec une exception documentée : les fichiers exportant une classe unique (Controllers, Models) restent en PascalCase, le reste (routers, services, configs) en kebab-case
- Connexion BDD (`sequelize.client.js`) et Models Sequelize (Pokemon, Type, Team) + associations N-N (`models/index.js`) créés sur la branche `feat/database-setup`
- Données de seed extraites du script SQL fourni et converties en JSON (`dataset.json`) : entités sans `id`
- Script `seed.tables.js` : `sequelize.sync({ force: true })` + `bulkCreate` (Pokemon/Type/Team) + boucle `findByPk` / `addType` / `addPokemon` pour les associations N-N
- Test minimal Express (`app.js` + route/controller 'hello world !') pour valider le setup Node/Express créés sur la branche `feat/crud-team`
- CRUD complet `Team` implémenté : `TeamController.js` + `team.router.js`, montés dans `app.js` — `getAll`, `getById`, `create`, `updateById`, `delete`
- Fichier de requêtes REST Client (`.http`) créé pour tester manuellement les 5 endpoints `Team` (GET liste, GET détails, POST, PUT, DELETE)

### Difficultés rencontrées / corrigées
- Bug dans `TeamController.delete` : `return` manquant avant la réponse 404, provoquait une double réponse HTTP (`ERR_HTTP_HEADERS_SENT`) sur un ID inexistant — corrigé
- Bug dans `TeamController.getById` : le bloc `catch` ne renvoyait aucune réponse au client en cas d'erreur (requête restait en attente) — corrigé

### À poursuivre
- Pas de contrainte d'unicité en base sur les tables de jonction (`pokemon_type`, `team_pokemon`) : la règle « un Pokémon unique par équipe » reste entièrement portée par la couche Service à venir
- Introduire une couche Service avant les endpoints "ajouter/retirer un Pokémon d'une équipe" (la roadmap impose explicitement que la limite de 6 Pokémons soit vérifiée en Service, pas seulement au Controller)
- Ajouter les middlewares 404/500 globaux dans `app.js`
- Endpoints à venir : ajouter/retirer un Pokémon d'une équipe, liste/détail des Pokémons