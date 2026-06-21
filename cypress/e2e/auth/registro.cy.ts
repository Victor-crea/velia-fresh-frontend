// Módulo: Autenticación → Registro
import { AuthPage } from "../../support/pages/AuthPage";

const auth = new AuthPage();

describe("Auth · Registro", () => {
  beforeEach(() => {
    cy.logout();
  });

  it("valida campos requeridos del formulario de registro", () => {
    auth.visit().switchTo("register");
    cy.byTestId("auth-submit").click();
    // El form usa `required`; el browser bloquea el submit → seguimos en /login
    cy.location("pathname").should("eq", "/login");
  });

  it("envía signup con datos válidos (POST interceptado)", () => {
    cy.intercept("POST", "**/auth/v1/signup*", {
      statusCode: 200,
      body: { user: { id: "fake", email: "nuevo@e2e.com" }, session: null },
    }).as("signup");

    const unique = `nuevo+${Date.now()}@e2e.com`;
    auth.visit().fillRegister("Nuevo E2E", unique, "Cypress123!").submit();
    cy.wait("@signup").its("request.body.email").should("eq", unique);
  });
});
