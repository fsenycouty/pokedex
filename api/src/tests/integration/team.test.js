// Tests d'intégration pour le CRUD Team (GET/POST/PATCH/DELETE /teams).
// Couvre aussi l'ownership (403/404) et les cas de non-régression sur les
// bugs corrigés : unicité du nom au renommage, tokens invalides/expirés.
import { describe, it } from "node:test";
import assert from "node:assert";
import jwt from "jsonwebtoken";
import { getBaseUrl } from "../setup/server.setup.js";
import { registerAndLogin } from "../setup/auth.helper.js";
import { User } from "../../models/index.js";

describe("Team", () => {
  describe("GET /teams", () => {
    it("renvoie un tableau vide quand il n'y a aucune équipe", async () => {
      const response = await fetch(`${getBaseUrl()}/teams`);
      const body = await response.json();

      assert.strictEqual(response.status, 200);
      assert.deepStrictEqual(body, []);
    });
  });

  describe("GET /teams/:id", () => {
    it("renvoie 404 si l'équipe n'existe pas", async () => {
      const response = await fetch(`${getBaseUrl()}/teams/999`);
      const body = await response.json();

      assert.strictEqual(response.status, 404);
      assert.strictEqual(body.message, "L'équipe n'existe pas !");
    });
  });

  describe("POST /teams", () => {
    it("crée une équipe pour l'utilisateur connecté", async () => {
      const { token } = await registerAndLogin();

      const response = await fetch(`${getBaseUrl()}/teams`, {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: "AlphaSquad" }),
      });
      const body = await response.json();

      assert.strictEqual(response.status, 201);
      assert.strictEqual(body.name, "AlphaSquad");
    });

    it("renvoie 401 sans token", async () => {
      const response = await fetch(`${getBaseUrl()}/teams`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: "AlphaSquad" }),
      });

      assert.strictEqual(response.status, 401);
    });

    it("renvoie 400 si le nom est manquant (validation Joi)", async () => {
      const { token } = await registerAndLogin();

      const response = await fetch(`${getBaseUrl()}/teams`, {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
        body: JSON.stringify({}),
      });

      assert.strictEqual(response.status, 400);
    });

    it("renvoie 409 si le nom est déjà pris", async () => {
      const { token } = await registerAndLogin();

      await fetch(`${getBaseUrl()}/teams`, {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: "AlphaSquad" }),
      });

      const response = await fetch(`${getBaseUrl()}/teams`, {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: "AlphaSquad" }),
      });
      const body = await response.json();

      assert.strictEqual(response.status, 409);
      assert.strictEqual(body.message, "L'équipe existe déjà !");
    });
  });

  describe("PATCH /teams/:id", () => {
    it("renomme l'équipe de son propriétaire", async () => {
      const { token } = await registerAndLogin();
      const created = await fetch(`${getBaseUrl()}/teams`, {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: "AlphaSquad" }),
      }).then((r) => r.json());

      const response = await fetch(`${getBaseUrl()}/teams/${created.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: "OmegaSquad" }),
      });
      const body = await response.json();

      assert.strictEqual(response.status, 200);
      assert.strictEqual(body.name, "OmegaSquad");
    });

    it("renvoie 403 si l'équipe appartient à un autre utilisateur", async () => {
      const owner = await registerAndLogin({ username: "Owner", email: "owner@mail.io" });
      const team = await fetch(`${getBaseUrl()}/teams`, {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${owner.token}` },
        body: JSON.stringify({ name: "AlphaSquad" }),
      }).then((r) => r.json());

      const intruder = await registerAndLogin({ username: "Intruder", email: "intruder@mail.io" });

      const response = await fetch(`${getBaseUrl()}/teams/${team.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json", authorization: `Bearer ${intruder.token}` },
        body: JSON.stringify({ name: "OmegaSquad" }),
      });

      assert.strictEqual(response.status, 403);
    });

    it("renvoie 409 si on renomme avec le nom d'une AUTRE équipe existante", async () => {
      const { token } = await registerAndLogin();
      await fetch(`${getBaseUrl()}/teams`, {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: "AlphaSquad" }),
      });
      const team2 = await fetch(`${getBaseUrl()}/teams`, {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: "BetaSquad" }),
      }).then((r) => r.json());

      const response = await fetch(`${getBaseUrl()}/teams/${team2.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: "AlphaSquad" }),
      });
      const body = await response.json();

      assert.strictEqual(response.status, 409);
      assert.strictEqual(body.message, "L'équipe existe déjà !");
    });

    it("accepte de renommer une équipe avec son propre nom actuel", async () => {
      const { token } = await registerAndLogin();
      const team = await fetch(`${getBaseUrl()}/teams`, {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: "AlphaSquad" }),
      }).then((r) => r.json());

      const response = await fetch(`${getBaseUrl()}/teams/${team.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: "AlphaSquad" }),
      });

      assert.strictEqual(response.status, 200);
    });
  });

  describe("DELETE /teams/:id", () => {
    it("supprime l'équipe de son propriétaire avec un message de confirmation", async () => {
      const { token } = await registerAndLogin();
      const team = await fetch(`${getBaseUrl()}/teams`, {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: "AlphaSquad" }),
      }).then((r) => r.json());

      const response = await fetch(`${getBaseUrl()}/teams/${team.id}`, {
        method: "DELETE",
        headers: { authorization: `Bearer ${token}` },
      });
      const body = await response.json();

      assert.strictEqual(response.status, 200);
      assert.strictEqual(body.message, "Équipe supprimée avec succès.");
    });

    it("renvoie 403 si l'équipe appartient à un autre utilisateur", async () => {
      const owner = await registerAndLogin({ username: "Owner", email: "owner@mail.io" });
      const team = await fetch(`${getBaseUrl()}/teams`, {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${owner.token}` },
        body: JSON.stringify({ name: "AlphaSquad" }),
      }).then((r) => r.json());

      const intruder = await registerAndLogin({ username: "Intruder", email: "intruder@mail.io" });

      const response = await fetch(`${getBaseUrl()}/teams/${team.id}`, {
        method: "DELETE",
        headers: { authorization: `Bearer ${intruder.token}` },
      });

      assert.strictEqual(response.status, 403);
    });
  });

  describe("Authentification (validateToken)", () => {
    it("renvoie 401 avec un header Authorization mal formé (sans 'Bearer ')", async () => {
      const response = await fetch(`${getBaseUrl()}/teams`, {
        method: "POST",
        headers: { "content-type": "application/json", authorization: "not-a-bearer-token" },
        body: JSON.stringify({ name: "AlphaSquad" }),
      });

      assert.strictEqual(response.status, 401);
    });

    it("renvoie 401 avec un token invalide (mal signé)", async () => {
      const response = await fetch(`${getBaseUrl()}/teams`, {
        method: "POST",
        headers: { "content-type": "application/json", authorization: "Bearer valeur.invalide.ici" },
        body: JSON.stringify({ name: "AlphaSquad" }),
      });

      assert.strictEqual(response.status, 401);
    });

    it("renvoie 401 avec un token expiré", async () => {
      const { userId } = await registerAndLogin();
      const expiredToken = jwt.sign({ user_id: userId }, process.env.JWT_SECRET, { expiresIn: -10 });

      const response = await fetch(`${getBaseUrl()}/teams`, {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${expiredToken}` },
        body: JSON.stringify({ name: "AlphaSquad" }),
      });

      assert.strictEqual(response.status, 401);
    });

    it("renvoie 401 si l'utilisateur du token n'existe plus", async () => {
      const { token, userId } = await registerAndLogin();
      await User.destroy({ where: { id: userId } });

      const response = await fetch(`${getBaseUrl()}/teams`, {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: "AlphaSquad" }),
      });
      const body = await response.json();

      assert.strictEqual(response.status, 401);
      assert.strictEqual(body.message, "L'utilisateur n'existe pas !");
    });
  });
});
