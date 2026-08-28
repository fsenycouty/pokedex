# Pokédex API

API REST professionnelle pour un Pokédex avec système d'équipes — projet
réalisé dans le cadre de la formation **Concepteur Développeur d'Applications**
(O'Clock), projet SB09.

Permet de consulter un Pokédex complet, créer des comptes utilisateurs, et
gérer des équipes de Pokémon (création, composition, respect des règles du
jeu) via une API REST sécurisée.

## Sommaire

- [Pokédex API](#pokédex-api)
  - [Sommaire](#sommaire)
  - [Fonctionnalités](#fonctionnalités)
  - [Stack technique](#stack-technique)
  - [Installation](#installation)
    - [Prérequis](#prérequis)
    - [Étapes](#étapes)
  - [Variables d'environnement](#variables-denvironnement)
  - [Scripts disponibles](#scripts-disponibles)
  - [Structure du projet](#structure-du-projet)
  - [Documentation de l'API](#documentation-de-lapi)
  - [Authentification](#authentification)
    - [Endpoints d'authentification](#endpoints-dauthentification)
    - [Endpoints principaux](#endpoints-principaux)
  - [Tests](#tests)
  - [Conception](#conception)

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
- **Documentation interactive** de l'API (Swagger)
- **Tests automatisés** (unitaires et intégration)

## Stack technique

- **Runtime** : Node.js, Express 5
- **Base de données** : PostgreSQL, via l'ORM Sequelize
- **Authentification** : JWT (`jsonwebtoken`), hachage des mots de passe avec Argon2id
- **Validation** : Joi
- **Documentation** : Swagger (`swagger-jsdoc` + `swagger-ui-express`)
- **Tests** : test runner natif de Node (`node:test`)

## Installation

### Prérequis

- Node.js 20+
- PostgreSQL

### Étapes

```bash
git clone https://github.com/fsenycouty/pokedex.git
cd pokedex/api
npm install
```

Crée les bases de données PostgreSQL :

```sql
CREATE USER admin_pokedex WITH LOGIN PASSWORD 'ton_mot_de_passe';
CREATE DATABASE pokedex WITH OWNER admin_pokedex;
CREATE DATABASE pokedex_test WITH OWNER admin_pokedex;
```

Copie les fichiers d'environnement et renseigne tes propres valeurs :

```bash
cp .env.example .env
cp .env.test.example .env.test
```

Crée les tables et peuple la base avec le jeu de données de départ (151 Pokémon, 17 types, comptes de démonstration) :

```bash
npm run db:create
npm run db:seed
```

Lance le serveur :

```bash
npm run dev
```

L'API est accessible sur `http://localhost:3050` (ou le port défini dans `.env`).

## Variables d'environnement

| Variable | Description |
|---|---|
| `PORT` | Port d'écoute du serveur |
| `DATABASE_URL` | Chaîne de connexion PostgreSQL (base de développement) |
| `JWT_SECRET` | Clé de signature des tokens JWT |

`.env.test` définit sa propre `DATABASE_URL`, pointant vers une base de test isolée (`pokedex_test`), jamais utilisée en développement.

Voir `.env.example` et `.env.test.example` pour le détail des clés attendues.

## Scripts disponibles

| Commande | Description |
|---|---|
| `npm run dev` | Démarre le serveur en mode développement (rechargement automatique) |
| `npm start` | Démarre le serveur en mode production |
| `npm test` | Exécute la suite de tests automatisés (unitaires + intégration) |

## Structure du projet

```
api/
├── data/                  # Jeu de données de seed
├── src/
│   ├── app.js             # Configuration Express (routes, middlewares)
│   ├── server.js          # Point d'entrée : démarrage du serveur
│   ├── config/            # Connexion BDD, configuration Swagger
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
└── .env.test.example
```

## Documentation de l'API

Une documentation interactive (Swagger UI) est disponible une fois le serveur démarré :

```
http://localhost:3050/api/docs
```

Elle liste tous les endpoints, leurs paramètres, les schémas de requête/réponse attendus, et permet de tester l'API directement depuis le navigateur.

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
- **Tests d'intégration** sur l'authentification (message d'erreur identique à la connexion, absence du mot de passe dans la réponse d'inscription), avec une base de données de test dédiée, remise à zéro avant chaque test

## Conception

La conception des données (MCD, MLD, MPD) est disponible dans le dossier [`_conception/`](./_conception). La charte de nommage du projet est disponible dans [`NAMING_CONVENTION.md`](./NAMING_CONVENTION.md).

---

Projet réalisé par Fabrice Seny-Couty, dans le cadre de la formation CDA — O'Clock.

[github.com/fsenycouty](https://github.com/fsenycouty)