// Módulo: Autenticación → Login
// Cubre puntos 1, 2, 3, 4, 5, 6, 10, 11, 12 del checklist 5.2
import { AuthPage } from "../../support/pages/AuthPage";
import users from "../../fixtures/users.json";

const auth = new AuthPage();

describe("Auth · Login", () => {
  beforeEach(() => {
    cy.logout();
  });

  it("muestra error con credenciales inválidas (intercept simulado)", () => {
    cy.intercept("POST", "**/auth/v1/token*", {
      statusCode: 400,
      body: { error: "invalid_grant", error_description: "Invalid credentials" },
    }).as("loginFail");

    auth.visit().fillLogin(users.invalido.email, users.invalido.password).submit();
    cy.wait("@loginFail");
    cy.contains(/credenciales|invalid/i).should("be.visible");
  });

  // login.cy.ts
it("permite iniciar sesión exitosamente como cliente y redirige", () => {
  // Interceptar la llamada de auth y simular respuesta exitosa
  cy.intercept("POST", "**/auth/v1/token*", {
    statusCode: 200,
    body: {
      access_token: "fake-token",
      refresh_token: "fake-refresh",
      token_type: "bearer",
      expires_in: 3600,
      user: {
        id: "00000000-0000-0000-0000-000000000001",
        email: users.cliente.email,
        role: "authenticated",
      },
    },
  }).as("loginOk");

  // Interceptar la llamada que la app hace para obtener el perfil/rol
  cy.intercept("GET", "**/rest/v1/profiles*", {
    statusCode: 200,
    body: [{ id: "00000000-0000-0000-0000-000000000001", role: "cliente" }],
  }).as("profile");

  auth.visit().fillLogin(users.cliente.email, users.cliente.password).submit();
  cy.wait("@loginOk");
  cy.location("pathname", { timeout: 10000 }).should("match", /\/(perfil|admin|)$/);
});

  it("no tiene violaciones de accesibilidad críticas", () => {
    auth.visit();
    cy.a11y();
  });
});
