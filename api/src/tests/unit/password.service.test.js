// Tests unitaires pour password.service.js (hash/verify Argon2id).
// Fonctions pures autour d'argon2 : pas de BDD, pas de serveur.
import { describe, it } from "node:test";
import assert from "node:assert";
import {
  hashPassword,
  verifyPassword,
} from "../../services/password.service.js";

describe("password.service", () => {
  it("hashPassword ne renvoie pas le mot de passe en clair", async () => {
    const hash = await hashPassword("Azertyuiop1234");

    assert.notStrictEqual(hash, "Azertyuiop1234");
  });

  it("verifyPassword renvoie true pour le bon mot de passe", async () => {
    const hash = await hashPassword("Azertyuiop1234");

    const result = await verifyPassword(hash, "Azertyuiop1234");

    assert.strictEqual(result, true);
  });

  it("verifyPassword renvoie false pour un mauvais mot de passe", async () => {
    const hash = await hashPassword("Azertyuiop1234");

    const result = await verifyPassword(hash, "MauvaisMotDePasse1");

    assert.strictEqual(result, false);
  });
});
