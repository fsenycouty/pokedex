# Pokédex API

## API REST professionnelle pour un Pokédex avec système d'équipes

`projet réalisé dans le cadre de la formation **Concepteur Développeur d'Applications** (O'Clock)`

Permet de consulter un Pokédex complet, créer des comptes utilisateurs, et
gérer des équipes de Pokémon (création, composition, respect des règles du
jeu) via une API REST sécurisée.

🔗 **API en ligne :** pokedex-api-vqq0.onrender.com —> [documentation Swagger](https://pokedex-api-vqq0.onrender.com/api/docs)
*(hébergée sur le plan gratuit de Render : après une période d'inactivité, la première requête peut prendre quelques secondes le temps que le service se réveille)*

## Sommaire

- [Pokédex API](#pokédex-api)
  - [API REST professionnelle pour un Pokédex avec système d'équipes](#api-rest-professionnelle-pour-un-pokédex-avec-système-déquipes)
  - [Sommaire](#sommaire)
  - [Fonctionnalités](#fonctionnalités)
  - [Stack technique](#stack-technique)
  - [Installation](#installation)
    - [Avec Docker (recommandé)](#avec-docker-recommandé)
      - [Développement avec rechargement à chaud](#développement-avec-rechargement-à-chaud)
    - [Installation native](#installation-native)
      - [Prérequis](#prérequis)
      - [Étapes](#étapes)
  - [Variables d'environnement](#variables-denvironnement)
    - [`.env.docker` (racine du projet — utilisé par `docker compose`)](#envdocker-racine-du-projet--utilisé-par-docker-compose)
    - [`api/.env` (installation native, ou exécution de l'API/scripts directement sur la machine hôte)](#apienv-installation-native-ou-exécution-de-lapiscripts-directement-sur-la-machine-hôte)
  - [Scripts disponibles](#scripts-disponibles)
  - [Structure du projet](#structure-du-projet)
  - [Documentation de l'API](#documentation-de-lapi)
  - [Authentification](#authentification)
    - [Endpoints d'authentification](#endpoints-dauthentification)
    - [Endpoints principaux](#endpoints-principaux)
  - [Tests](#tests)
  - [Déploiement](#déploiement)
  - [Conception](#conception)

```drawio width=800
<mxfile>
  <diagram id="default" name="Page-1">
    <mxGraphModel>
      <root>
        <mxCell id="0"/>
        <mxCell id="1" parent="0"/>
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>
```


## Fonctionnalités

- **Pokédex** : consultation de la liste et du détail de 151 Pokémon, avec leurs types et statistiques
- **Équipes** : CRUD complet, limitées à un propriétaire authentifié
- **Composition d'équipe** : ajout/retrait de Pokémon, avec deux règles métier vérifiées en couche Service :
  - maximum 6 Pokémon par équipe
  - un même Pokémon ne peut apparaître qu'une fois dans une équipe
- **Authentification** : inscription, connexion (JWT), déconnexion
- **Autorisation** : seul le propriétaire d'une équipe peut la modifier, la supprimer, ou en gérer les Pokémon
- **Validation stricte** des entrées (Joi) sur l'inscription, la connexion et la gestion des équipes
- **Gestion d'erreur centralisée**, avec des codes HTTP cohérents (400/401/403/404/409/500)
- **Documentation interactive** de l'API (Swagger), avec URL de base adaptée automatiquement à l'environnement (local ou déployé)
- **Arrêt propre du serveur** (`SIGTERM`/`SIGINT`) : ferme la connexion à la base de données avant extinction, notamment en prévision des mises en veille automatiques d'un hébergeur cloud
- **Tests automatisés** (unitaires et intégration), sur une base de données dédiée et isolée

## Stack technique

- **Runtime** : Node.js, Express 5
- **Base de données** : PostgreSQL, via l'ORM Sequelize
- **Authentification** : JWT (`jsonwebtoken`), hachage des mots de passe avec Argon2id
- **Validation** : Joi
- **Documentation** : Swagger (`swagger-jsdoc` + `swagger-ui-express`)
- **Tests** : test runner natif de Node (`node:test`)
- **Conteneurisation** : Docker / Docker Compose (API + PostgreSQL + Adminer)
- **Déploiement** : Render (API, via Docker) + Neon (PostgreSQL managé)

## Installation

### Avec Docker (recommandé)

Prérequis : [Docker](https://docs.docker.com/get-docker/) (Docker Compose est inclus avec Docker Desktop).

```bash
git clone https://github.com/fsenycouty/pokedex.git
cd pokedex
```

Créez un fichier `.env.docker` à la racine du projet (voir [Variables d'environnement](#variables-denvironnement) pour le détail des clés attendues), puis lancez la stack :

```bash
docker compose --env-file .env.docker up -d
```

Cela démarre trois services : l'API (`api`), la base PostgreSQL (`db`), et Adminer (`adminer`), une interface web pour consulter/gérer la base — utile uniquement en développement, jamais exposée en production.

Au premier lancement, créez les tables et peuplez la base avec le jeu de données de départ (151 Pokémon, 17 types, comptes de démonstration) :

```bash
docker compose --env-file .env.docker exec api npm run db:reset
```

- L'API est accessible sur `http://localhost:3000`, la documentation Swagger sur `http://localhost:3000/api/docs`.
- Adminer est accessible sur `http://localhost:<ADMINER_PORT>` (se connecter avec l'hôte `db`, et les identifiants définis dans `.env.docker`).

Aucune installation de Node.js ou PostgreSQL n'est nécessaire sur la machine hôte.

#### Développement avec rechargement à chaud

Le service `api` n'est pas configuré pour refléter les changements de code en direct : chaque modification nécessite de reconstruire l'image Docker. Pour un cycle de développement plus rapide, il est possible de ne démarrer que la base de données via Docker, puis de lancer l'API directement sur la machine hôte avec `nodemon` :

```bash
docker compose --env-file .env.docker up -d db
cd api
npm install
npm run dev
```

Le port `5432` du service `db` étant publié vers l'hôte, `api/.env` peut alors pointer vers `postgresql://<user>:<password>@localhost:5432/<db>` — l'API tourne en local avec rechargement automatique, tout en utilisant la même base Postgres que l'environnement Docker. Les requêtes peuvent être testées avec les fichiers `.http` du dossier [`rest-client/`](./rest-client) (extension REST Client), ou via Swagger UI.

### Installation native

#### Prérequis

- Node.js 20+
- PostgreSQL

#### Étapes

```bash
git clone https://github.com/fsenycouty/pokedex.git
cd pokedex/api
npm install
```

Créez les bases de données PostgreSQL :

```sql
CREATE USER admin_pokedex WITH LOGIN PASSWORD 'votre_mot_de_passe';
CREATE DATABASE pokedex WITH OWNER admin_pokedex;
CREATE DATABASE pokedex_test WITH OWNER admin_pokedex;
```

Copiez les fichiers d'environnement et renseignez vos propres valeurs :

```bash
cp .env.example .env
cp .env.test.example .env.test
```

Créez les tables et peuplez la base avec le jeu de données de départ (151 Pokémon, 17 types, comptes de démonstration) :

```bash
npm run db:create
npm run db:seed
```

Lancez le serveur :

```bash
npm run dev
```

L'API est accessible sur `http://localhost:3000` (ou le port défini dans `.env`).

## Variables d'environnement

### `.env.docker` (racine du projet — utilisé par `docker compose`)

| Variable | Description |
|---|---|
| `POSTGRES_USER` | Utilisateur PostgreSQL du conteneur `db` |
| `POSTGRES_PASSWORD` | Mot de passe PostgreSQL du conteneur `db` |
| `POSTGRES_DB` | Nom de la base créée au démarrage du conteneur (base de développement) |
| `PORT` | Port d'écoute de l'API à l'intérieur du conteneur |
| `DATABASE_URL` | Chaîne de connexion PostgreSQL utilisée par l'API (hôte `db`, réseau interne Docker) |
| `JWT_SECRET` | Clé de signature des tokens JWT |
| `ADMINER_PORT` | Port d'accès à l'interface Adminer depuis la machine hôte |

### `api/.env` (installation native, ou exécution de l'API/scripts directement sur la machine hôte)

| Variable | Description |
|---|---|
| `PORT` | Port d'écoute du serveur *(optionnel, 3000 par défaut si absent)* |
| `DATABASE_URL` | Chaîne de connexion PostgreSQL (base de développement) |
| `JWT_SECRET` | Clé de signature des tokens JWT |

`api/.env.test` définit sa propre `DATABASE_URL`, pointant vers une base de test isolée (`pokedex_test`), jamais utilisée en développement.

Voir `.env.example`, `api/.env.example` et `api/.env.test.example` pour le détail des clés attendues.

## Scripts disponibles

| Commande | Description |
|---|---|
| `npm run dev` | Démarre le serveur en mode développement (rechargement automatique) |
| `npm start` | Démarre le serveur en mode production |
| `npm test` | Exécute la suite de tests automatisés (unitaires + intégration) |
| `npm run db:create` | Crée les tables en base |
| `npm run db:seed` | Peuple la base avec le jeu de données de départ |
| `npm run db:reset` | Enchaîne `db:create` puis `db:seed` |
| `npm run lint` | Analyse le code avec ESLint |
| `npm run format` | Reformate le code avec Prettier |

## Structure du projet

```
api/
├── data/                  # Jeu de données de seed
├── src/
│   ├── app.js             # Configuration Express (routes, middlewares)
│   ├── server.js          # Point d'entrée : démarrage et arrêt propre du serveur
│   ├── config/            # Connexion BDD (Sequelize), configuration Swagger
│   ├── models/            # Modèles Sequelize et leurs associations
│   ├── routers/           # Définition des routes
│   ├── controllers/       # Logique de traitement des requêtes
│   ├── services/          # Logique métier réutilisable
│   ├── middlewares/       # Authentification, validation
│   ├── schemas/           # Schémas de validation Joi
│   ├── utils/              # Classe d'erreur personnalisée, helpers
│   ├── migrations/        # Création des tables et seed
│   └── tests/
│       ├── unit/           # Tests unitaires (logique métier isolée)
│       ├── integration/    # Tests d'intégration (routes, vraie BDD de test)
│       └── setup/          # Helpers de configuration des tests
├── .env.example
├── .env.test.example
└── Dockerfile
```

## Documentation de l'API

Une documentation interactive (Swagger UI) est disponible une fois le serveur démarré :

```
http://localhost:3000/api/docs
```

Elle liste tous les endpoints, leurs paramètres, les schémas de requête/réponse attendus, et permet de tester l'API directement depuis le navigateur ou depuis son déploiement en ligne (l'URL de base s'adapte automatiquement).

## Authentification

L'API utilise des tokens JWT. Une fois connecté, le token doit être transmis dans l'en-tête `Authorization` de chaque requête protégée :

```
Authorization: Bearer <token>
```

### Endpoints d'authentification

| Méthode | Route | Description | Protégée |
|---|---|---|---|
| POST | `/auth/register` | Créer un compte | Non |
| POST | `/auth/login` | Se connecter | Non |
| POST | `/auth/logout` | Se déconnecter | Oui |

### Endpoints principaux

| Méthode | Route | Description | Protégée |
|---|---|---|---|
| GET | `/pokemons` | Liste des Pokémon | Non |
| GET | `/pokemons/:id` | Détail d'un Pokémon | Non |
| GET | `/teams` | Liste des équipes | Non |
| GET | `/teams/:id` | Détail d'une équipe | Non |
| POST | `/teams` | Créer une équipe | Oui |
| PATCH | `/teams/:id` | Modifier une équipe | Oui (propriétaire) |
| DELETE | `/teams/:id` | Supprimer une équipe | Oui (propriétaire) |
| POST | `/teams/:idTeam/pokemons` | Ajouter un Pokémon à une équipe | Oui (propriétaire) |
| DELETE | `/teams/:idTeam/pokemons/:idPokemon` | Retirer un Pokémon d'une équipe | Oui (propriétaire) |

## Tests

```bash
npm test
```

La suite couvre :
- **Tests unitaires** sur les règles métier (limite de 6 Pokémon par équipe, unicité), testées en isolation sans dépendance à la base de données
- **Tests d'intégration** sur l'authentification (message d'erreur identique à la connexion, absence du mot de passe dans la réponse d'inscription), avec une base de données de test dédiée (`pokedex_test`), remise à zéro avant chaque test

En environnement Docker, le port `5432` du service `db` est publié vers la machine hôte, ce qui permet de lancer `npm test` directement depuis `api/` (hors conteneur) tout en ciblant la base de test.

## Déploiement

L'API est déployée en production sur [Render](https://render.com), à l'adresse

`https://pokedex-api-vqq0.onrender.com` : [se rendre sur documentation Swagger](https://pokedex-api-vqq0.onrender.com/api/docs),

avec une base PostgreSQL managée sur [Neon](https://neon.com) — trois environnements

strictement séparés :


| Environnement | Base de données | Hébergement API |
|---|---|---|
| Développement | Conteneur Docker local (`pokedex`) | Local (`docker compose`) |
| Test | Conteneur Docker local (`pokedex_test`) | Local (`npm test`) |
| Production | Neon (PostgreSQL managé) | Render (Web Service, build Docker depuis `api/Dockerfile`) |

Points clés de la configuration de production :
- Connexion chiffrée (SSL) à la base Neon, via `sslmode=require` dans `DATABASE_URL` et `dialectOptions.ssl` en secours côté Sequelize (`NODE_ENV=production`)
- Variables sensibles (`DATABASE_URL`, `JWT_SECRET`) définies uniquement dans les variables d'environnement Render, jamais committées
- Arrêt propre du serveur sur `SIGTERM`, envoyé par Render lors de la mise en veille du service (plan gratuit) après une période d'inactivité

## Conception

La conception des données (MCD, MLD, MPD) est disponible dans le dossier [`_conception/`](./_conception). La charte de nommage du projet est disponible dans [`NAMING_CONVENTION.md`](./NAMING_CONVENTION.md).

---

Projet réalisé par Fabrice Seny-Couty, dans le cadre de la formation CDA — O'Clock.

[github.com/fsenycouty](https://github.com/fsenycouty)