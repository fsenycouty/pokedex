## MVP (Minimum Viable Product)

**Objectif** : Construire les fondations de l'API avec le CRUD complet de l'entité `team` (équipe) et les fonctionnalités de base de gestion des équipes. Ainsi que la liste des Pokémons.

| En tant que | je souhaite pouvoir                        | afin de                               |
| ----------- | ------------------------------------------ | ------------------------------------- |
| visiteur    | consulter la liste des équipes             | voir ce qui existe                    |
| visiteur    | consulter les détails d'une équipe         | connaître sa composition              |
| visiteur    | créer une équipe                           | l'administrer                         |
| visiteur    | modifier le nom d'une équipe               | l'administrer                         |
| visiteur    | ajouter un Pokémon à une équipe            | l'administrer                         |  
| visiteur    | retirer un Pokémon d'une équipe            | l'administrer                         |
| visiteur    | supprimer une équipe                       | l'administrer                         |
| visiteur    | consulter la liste des Pokémons            | en choisir un                         |
| visiteur    | consulter les détails d'un Pokémon         | connaître ses caractéristiques        |

### Contraintes

- **Limite des équipes** : Une équipe peut contenir 6 Pokémons au maximum
- **Unicité** : Un même Pokémon ne peut apparaître qu'une seule fois dans une équipe
- **Gestion de la limite** : Cette limite doit être vérifiée dans une couche Service, pas seulement au niveau du Controller
- **Messages de confirmation** : Renvoyer un message de confirmation lors de la suppression d'une équipe