import { resolve } from "node:path";
import { cwd } from "node:process";
import { config } from "dotenv";

// Charge .env.test AVANT tout le reste
// (avant que sequelize.client.js ne fasse son propre `import "dotenv/config"` qui lit .env)
config({ path: resolve(cwd(), ".env.test") });

// Désactive les logs SQL Sequelize pendant les tests
process.env.NODE_ENV ??= "test";
