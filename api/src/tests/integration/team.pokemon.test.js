// Tests d'intégration pour la gestion des Pokémon d'une équipe
// (POST/DELETE /teams/:idTeam/pokemons). Couvre l'ownership, les règles
// métier (limite de 6, unicité) au niveau HTTP, et la non-régression sur
// la validation Joi ajoutée après-coup sur POST.
import { describe, it } from "node:test";
import assert from "node:assert";
import { getBaseUrl } from "../setup/server.setup.js";
import { registerAndLogin } from "../setup/auth.helper.js";
import { Pokemon } from "../../models/index.js";

// Crée `count` Pokémon de test directement en BDD (pas d'endpoint de création)
async function createPokemons(count) {
  const data = [];

  for (let i = 0; i < count; i++) {
    data.push({
      name: `Pokemon${i}`,
      hp: 45,
      atk: 49,
      def: 49,
      atk_spe: 65,
      def_spe: 65,
      speed: 45,
    });
  }

  return Pokemon.bulkCreate(data);
}

async function createTeam(token, name = "AlphaSquad") {
  return fetch(`${getBaseUrl()}/teams`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name }),
  }).then((response) => response.json());
}

describe("TeamPokemon", () => {
  describe("POST /teams/:idTeam/pokemons", () => {
    it("ajoute un pokémon à l'équipe de son propriétaire", async () => {
      const { token } = await registerAndLogin();
      const team = await createTeam(token);
      const pokemons = await createPokemons(1);
      const pokemon = pokemons[0];

      const response = await fetch(
        `${getBaseUrl()}/teams/${team.id}/pokemons`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ id: pokemon.id }),
        },
      );
      const body = await response.json();

      assert.strictEqual(response.status, 200);
      assert.strictEqual(body.pokemons.length, 1);
      assert.strictEqual(body.pokemons[0].id, pokemon.id);
    });

    it("renvoie 400 si le body ne contient pas d'id (validation Joi)", async () => {
      const { token } = await registerAndLogin();
      const team = await createTeam(token);

      const response = await fetch(
        `${getBaseUrl()}/teams/${team.id}/pokemons`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({}),
        },
      );

      assert.strictEqual(response.status, 400);
    });

    it("renvoie 400 si l'id n'est pas un nombre", async () => {
      const { token } = await registerAndLogin();
      const team = await createTeam(token);

      const response = await fetch(
        `${getBaseUrl()}/teams/${team.id}/pokemons`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ id: "not-a-number" }),
        },
      );

      assert.strictEqual(response.status, 400);
    });

    it("renvoie 404 si le pokémon n'existe pas", async () => {
      const { token } = await registerAndLogin();
      const team = await createTeam(token);

      const response = await fetch(
        `${getBaseUrl()}/teams/${team.id}/pokemons`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ id: 999 }),
        },
      );

      assert.strictEqual(response.status, 404);
    });

    it("renvoie 403 si l'équipe appartient à un autre utilisateur", async () => {
      const owner = await registerAndLogin({
        username: "Owner",
        email: "owner@mail.io",
      });
      const team = await createTeam(owner.token);
      const pokemons = await createPokemons(1);
      const pokemon = pokemons[0];
      const intruder = await registerAndLogin({
        username: "Intruder",
        email: "intruder@mail.io",
      });

      const response = await fetch(
        `${getBaseUrl()}/teams/${team.id}/pokemons`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            authorization: `Bearer ${intruder.token}`,
          },
          body: JSON.stringify({ id: pokemon.id }),
        },
      );

      assert.strictEqual(response.status, 403);
    });

    it("renvoie 409 si le pokémon est déjà dans l'équipe", async () => {
      const { token } = await registerAndLogin();
      const team = await createTeam(token);
      const pokemons = await createPokemons(1);
      const pokemon = pokemons[0];

      await fetch(`${getBaseUrl()}/teams/${team.id}/pokemons`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: pokemon.id }),
      });

      const response = await fetch(
        `${getBaseUrl()}/teams/${team.id}/pokemons`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ id: pokemon.id }),
        },
      );
      const body = await response.json();

      assert.strictEqual(response.status, 409);
      assert.strictEqual(
        body.message,
        "Ce pokémon est déjà dans cette équipe.",
      );
    });

    it("renvoie 409 si l'équipe a déjà 6 pokémons", async () => {
      const { token } = await registerAndLogin();
      const team = await createTeam(token);
      const pokemons = await createPokemons(7);

      for (const pokemon of pokemons.slice(0, 6)) {
        await fetch(`${getBaseUrl()}/teams/${team.id}/pokemons`, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ id: pokemon.id }),
        });
      }

      const response = await fetch(
        `${getBaseUrl()}/teams/${team.id}/pokemons`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ id: pokemons[6].id }),
        },
      );
      const body = await response.json();

      assert.strictEqual(response.status, 409);
      assert.strictEqual(
        body.message,
        "L'équipe est déjà complète (6 Pokémons maximum).",
      );
    });
  });

  describe("DELETE /teams/:idTeam/pokemons/:idPokemon", () => {
    it("retire un pokémon de l'équipe de son propriétaire", async () => {
      const { token } = await registerAndLogin();
      const team = await createTeam(token);
      const pokemons = await createPokemons(1);
      const pokemon = pokemons[0];
      await fetch(`${getBaseUrl()}/teams/${team.id}/pokemons`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: pokemon.id }),
      });

      const response = await fetch(
        `${getBaseUrl()}/teams/${team.id}/pokemons/${pokemon.id}`,
        {
          method: "DELETE",
          headers: { authorization: `Bearer ${token}` },
        },
      );
      const body = await response.json();

      assert.strictEqual(response.status, 200);
      assert.strictEqual(body.pokemons.length, 0);
    });

    it("renvoie 404 si le pokémon n'est pas dans l'équipe", async () => {
      const { token } = await registerAndLogin();
      const team = await createTeam(token);
      const pokemons = await createPokemons(1);
      const pokemon = pokemons[0];

      const response = await fetch(
        `${getBaseUrl()}/teams/${team.id}/pokemons/${pokemon.id}`,
        {
          method: "DELETE",
          headers: { authorization: `Bearer ${token}` },
        },
      );

      assert.strictEqual(response.status, 404);
    });

    it("renvoie 403 si l'équipe appartient à un autre utilisateur", async () => {
      const owner = await registerAndLogin({
        username: "Owner",
        email: "owner@mail.io",
      });
      const team = await createTeam(owner.token);
      const pokemons = await createPokemons(1);
      const pokemon = pokemons[0];
      await fetch(`${getBaseUrl()}/teams/${team.id}/pokemons`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${owner.token}`,
        },
        body: JSON.stringify({ id: pokemon.id }),
      });
      const intruder = await registerAndLogin({
        username: "Intruder",
        email: "intruder@mail.io",
      });

      const response = await fetch(
        `${getBaseUrl()}/teams/${team.id}/pokemons/${pokemon.id}`,
        {
          method: "DELETE",
          headers: { authorization: `Bearer ${intruder.token}` },
        },
      );

      assert.strictEqual(response.status, 403);
    });
  });
});
