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

  it("permite iniciar sesión exitosamente como cliente y redirige", () => {
    auth.visit().fillLogin(users.cliente.email, users.cliente.password).submit();
    cy.location("pathname", { timeout: 10000 }).should("match", /\/(perfil|admin|)$/);
  });

  it("no tiene violaciones de accesibilidad críticas", () => {
    auth.visit();
    cy.a11y();
  });
});
