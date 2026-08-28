// Helper de test : crée un utilisateur et le connecte, retourne son token + son id
// (évite de dupliquer le couple register/login dans chaque fichier de test d'intégration)
import { getBaseUrl } from "./server.setup.js";

export async function registerAndLogin(overrides = {}) {
  const user = {
    username: "Testeur",
    email: "testeur@mail.io",
    password: "Azertyuiop1234",
    ...overrides,
  };

  await fetch(`${getBaseUrl()}/auth/register`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(user),
  });

  const response = await fetch(`${getBaseUrl()}/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: user.email, password: user.password }),
  });
  const body = await response.json();

  return { token: body.token, userId: body.id };
}
