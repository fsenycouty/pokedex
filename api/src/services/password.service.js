// Service pour le password
import argon2 from 'argon2';

// Hache le mot de passe en clair avec argon2
async function hashPassword(password) {
  const passwordHash = await argon2.hash(password, { type: argon2.argon2id });
  return passwordHash;
}

// Vérifie que le mot de passe saisi correspond à un hash stocké en bdd
async function verifyPassword(passwordHash, password) {
  const passwordVerified = await argon2.verify(passwordHash, password);
  return passwordVerified;
}

export { hashPassword, verifyPassword };