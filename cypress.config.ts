import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: process.env.CYPRESS_BASE_URL ?? "http://localhost:8080",
    specPattern: "cypress/e2e/**/*.cy.{ts,tsx}",
    supportFile: "cypress/support/e2e.ts",
    fixturesFolder: "cypress/fixtures",
    setupNodeEvents(on, config) {
      // Inyectar variables de entorno desde process.env (CI o local)
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
      };
      return config;
    },
  },
  // Punto 9 del checklist 5.2: retry máximo de 2 reintentos
  retries: { runMode: 2, openMode: 0 },
  // Punto 8: screenshots y videos siempre activos para análisis de fallos
  video: true,
  videoCompression: 32,
  screenshotOnRunFailure: true,
  viewportWidth: 1280,
  viewportHeight: 800,
  defaultCommandTimeout: 8000,
});
