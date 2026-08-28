// Tests unitaires pour isTeamOwner (services/team.owner.service.js).
// Fonction pure : pas de BDD, juste un objet `team` fabriqué à la main.
import { describe, it } from "node:test";
import assert from "node:assert";
import { isTeamOwner } from "../../services/team.owner.service.js";

describe("isTeamOwner", () => {
  it("renvoie true si l'équipe appartient à l'utilisateur", () => {
    const team = { user_id: 1 };

    assert.strictEqual(isTeamOwner(team, 1), true);
  });

  it("renvoie false si l'équipe appartient à un autre utilisateur", () => {
    const team = { user_id: 1 };

    assert.strictEqual(isTeamOwner(team, 2), false);
  });
});
