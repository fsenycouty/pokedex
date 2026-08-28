// Tests unitaires pour checkTeamPokemon (services/team.pokemon.service.js).
// Fonction pure : pas de BDD, pas de serveur — juste des objets `team`
// fabriqués à la main. Couvre les deux règles métier du Jalon 1 :
// la limite de 6 Pokémons par équipe, et l'unicité d'un Pokémon dans l'équipe.
import { describe, it } from "node:test";
import assert from "node:assert";
import { checkTeamPokemon } from "../../services/team.pokemon.service.js";

describe("checkTeamPokemon", () => {
  it("autorise l'ajout si l'équipe a moins de 6 Pokémons et que celui-ci n'y est pas déjà", () => {
    // Équipe à 3 Pokémons (sous la limite), on tente d'ajouter le Pokémon 42 (absent)
    const team = {
      pokemons: [{ id: 1 }, { id: 2 }, { id: 3 }],
    };

    const result = checkTeamPokemon(team, 42);

    assert.deepEqual(result, { allowed: true });
  });

  it("refuse l'ajout si l'équipe a déjà 6 Pokémons", () => {
    // Cas limite exact (6 Pokémons) : c'est ce cas précis qui avait révélé
    // le bug off-by-one d'origine (`length > 6` au lieu de `< 6`)
    const team = {
      pokemons: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }, { id: 6 }],
    };

    const result = checkTeamPokemon(team, 7);

    assert.deepEqual(result, { allowed: false, reason: "TEAM_FULL" });
  });

  it("refuse l'ajout si le Pokémon est déjà dans l'équipe", () => {
    // Équipe volontairement sous la limite de 6, pour isoler la cause du
    // refus : c'est bien l'unicité qui est testée ici, pas la taille
    const team = {
      pokemons: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }],
    };

    const result = checkTeamPokemon(team, 5);

    assert.deepEqual(result, { allowed: false, reason: "ALREADY_IN_TEAM" });
  });
});