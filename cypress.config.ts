import { defineConfig } from "cypress";
import * as fs from "node:fs";
import * as path from "node:path";

/**
 * Carga simple de un archivo .env (sin dependencia externa). Soporta líneas
 * `KEY=VALUE`, ignora comentarios (#) y vacías. No reemplaza variables que
 * ya existan en `process.env`.
 */
function loadEnvFile(file: string) {
  const p = path.resolve(process.cwd(), file);
  if (!fs.existsSync(p)) return;
  const content = fs.readFileSync(p, "utf-8");
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

// Carga primero `cypress.env` (específico de pruebas) y luego `.env` del proyecto.
loadEnvFile("cypress.env");
loadEnvFile(".env");

export default defineConfig({
  e2e: {
    baseUrl: process.env.CYPRESS_BASE_URL ?? "http://localhost:8080",
    specPattern: "cypress/e2e/**/*.cy.{ts,tsx}",
    supportFile: "cypress/support/e2e.ts",
    fixturesFolder: "cypress/fixtures",
    setupNodeEvents(on, config) {
      config.env = {
        ...config.env,
        SUPABASE_URL: process.env.VITE_SUPABASE_URL ?? config.env.SUPABASE_URL,
        SUPABASE_ANON_KEY:
          process.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? config.env.SUPABASE_ANON_KEY,
        TEST_USER_EMAIL: process.env.TEST_USER_EMAIL ?? config.env.TEST_USER_EMAIL,
        TEST_USER_PASSWORD: process.env.TEST_USER_PASSWORD ?? config.env.TEST_USER_PASSWORD,
        TEST_ADMIN_EMAIL: process.env.TEST_ADMIN_EMAIL ?? config.env.TEST_ADMIN_EMAIL,
        TEST_ADMIN_PASSWORD:
          process.env.TEST_ADMIN_PASSWORD ?? config.env.TEST_ADMIN_PASSWORD,
        BACKEND_URL: process.env.BACKEND_URL ?? config.env.BACKEND_URL ?? "http://localhost:4000",
        TESTING_RESET_TOKEN:
          process.env.TESTING_RESET_TOKEN ?? config.env.TESTING_RESET_TOKEN,
        // Si se define A11Y_STRICT=true, las violaciones a11y harán fallar el test.
        // Por defecto sólo se reportan (no bloquean) para evitar romper el pipeline.
        A11Y_STRICT: process.env.A11Y_STRICT ?? config.env.A11Y_STRICT ?? "false",
      };
      return config;
    },
  },
  retries: { runMode: 2, openMode: 0 },
  video: true,
  videoCompression: 32,
  screenshotOnRunFailure: true,
  viewportWidth: 1280,
  viewportHeight: 800,
  defaultCommandTimeout: 8000,
});
