// Tests d'intégration pour l'authentification (POST /auth/register, POST /auth/login).
// S'appuie sur un serveur HTTP démarré sur un port libre.
// BDD de test isolée (pokedex_test) remise à zéro avant chaque test.
import { describe, it } from "node:test";
import assert from "node:assert";
import { getBaseUrl } from "../setup/server.setup.js";

describe("Auth", () => {
  describe("POST /auth/register", () => {
    it("ne renvoie pas le mot de passe dans la réponse", async () => {
      // 1. Arrange : données d'inscription valides
      const userData = {
        username: "Alice",
        email: "alice@mail.io",
        password: "Azertyuiop1234",
      };

      // 2. Act : appel réel à l'API
      const response = await fetch(`${getBaseUrl()}/auth/register`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(userData),
      });
      const body = await response.json();

      // 3. Assert :
      // inscription réussie, champs attendus présents, mot de passe (clair ou hashé) absent de la réponse
      assert.strictEqual(response.status, 201);
      assert.strictEqual(body.username, "Alice");
      assert.strictEqual(body.email, "alice@mail.io");
      assert.strictEqual(body.password, undefined);
      assert.strictEqual(body.password_hash, undefined);
    });
  });

  describe("POST /auth/login", () => {
    it("renvoie 401 avec le bon message pour un email inexistant", async () => {
      // 1. Arrange : aucun user n'a été créé (beforeEach a vidé la BDD)
      const userLog = {
        email: "alice@mail.io",
        password: "Azertyuiop1234",
      };

      // 2. Act
      const response = await fetch(`${getBaseUrl()}/auth/login`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(userLog),
      });
      const body = await response.json();

      // 3. Assert :
      // message volontairement flou, ne révèle pas que c'est l'email qui est en cause
      assert.strictEqual(response.status, 401);
      assert.strictEqual(body.message, "Email ou mot de passe incorrect");
    });

    it("renvoie 401 avec le même message pour un mot de passe incorrect", async () => {
      // 1. Arrange : on crée un vrai utilisateur au préalable
      const userData = {
        username: "Alice",
        email: "alice@mail.io",
        password: "Azertyuiop1234",
      };

      await fetch(`${getBaseUrl()}/auth/register`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(userData),
      });

      // 2. Act :
      // tentative de connexion avec le bon email mais un mauvais mot de passe
      const userLog = {
        email: "alice@mail.io",
        password: "Azertyuiop5678",
      };

      const response = await fetch(`${getBaseUrl()}/auth/login`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(userLog),
      });
      const body = await response.json();

      // 3. Assert :
      // message volontairement flou, ne révèle pas que c'est le mot de passe qui est en cause
      assert.strictEqual(response.status, 401);
      assert.strictEqual(body.message, "Email ou mot de passe incorrect");
    });
  });
});
