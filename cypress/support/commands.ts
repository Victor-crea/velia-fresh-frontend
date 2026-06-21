/// <reference types="cypress" />
import "cypress-axe";

// ---------- Tipado de comandos personalizados ----------
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      /** Selector basado SOLO en data-testid (punto 1 del checklist). */
      byTestId(id: string): Chainable<JQuery<HTMLElement>>;
      /** Login vía API directamente, inyectando la sesión en localStorage (punto 3). */
      loginAs(role: "cliente" | "admin"): Chainable<void>;
      /** Cierra sesión limpiando localStorage. */
      logout(): Chainable<void>;
      /** Resetea la BD llamando al endpoint de testing del backend (punto 7). */
      resetDb(): Chainable<void>;
      /** Crea un producto vía endpoint de testing (devuelve el id). */
      seedProduct(payload: Record<string, unknown>): Chainable<string>;
      /** Wrapper de cypress-axe para verificación de accesibilidad (punto 12). */
      a11y(context?: string): Chainable<void>;
    }
  }
}

// ---------- byTestId ----------
Cypress.Commands.add("byTestId", (id: string) =>
  cy.get(`[data-testid="${id}"]`)
);

// ---------- loginAs ----------
Cypress.Commands.add("loginAs", (role: "cliente" | "admin") => {
  const SUPABASE_URL = Cypress.env("SUPABASE_URL");
  const SUPABASE_ANON_KEY = Cypress.env("SUPABASE_ANON_KEY");
  const email =
    role === "admin" ? Cypress.env("TEST_ADMIN_EMAIL") : Cypress.env("TEST_USER_EMAIL");
  const password =
    role === "admin"
      ? Cypress.env("TEST_ADMIN_PASSWORD")
      : Cypress.env("TEST_USER_PASSWORD");

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !email || !password) {
    throw new Error(
      `Faltan variables de entorno para loginAs(${role}). ` +
        `Define SUPABASE_URL, SUPABASE_ANON_KEY, TEST_${role.toUpperCase()}_EMAIL y _PASSWORD.`
    );
  }

  cy.request({
    method: "POST",
    url: `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
    headers: {
      apikey: SUPABASE_ANON_KEY,
      "Content-Type": "application/json",
    },
    body: { email, password },
  }).then((res) => {
    expect(res.status, `login API ${role}`).to.eq(200);
    const session = res.body;
    // La key de storage usada por @supabase/supabase-js es `sb-<project-ref>-auth-token`.
    const projectRef = new URL(SUPABASE_URL).host.split(".")[0];
    const storageKey = `sb-${projectRef}-auth-token`;
    const payload = {
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      expires_at: session.expires_at,
      expires_in: session.expires_in,
      token_type: session.token_type ?? "bearer",
      user: session.user,
    };
    cy.window().then((win) => {
      win.localStorage.setItem(storageKey, JSON.stringify(payload));
    });
  });
});

// ---------- logout ----------
Cypress.Commands.add("logout", () => {
  cy.window().then((win) => win.localStorage.clear());
});

// ---------- resetDb ----------
Cypress.Commands.add("resetDb", () => {
  const BACKEND_URL = Cypress.env("BACKEND_URL");
  const token = Cypress.env("TESTING_RESET_TOKEN");
  if (!token) {
    cy.log("⚠️  TESTING_RESET_TOKEN no configurado, se omite reset.");
    return;
  }
  cy.request({
    method: "POST",
    url: `${BACKEND_URL}/api/testing/reset`,
    headers: { "x-testing-token": token },
    failOnStatusCode: false,
  }).then((res) => {
    if (res.status >= 400) {
      cy.log(`⚠️  reset endpoint respondió ${res.status}`);
    }
  });
});

// ---------- seedProduct ----------
Cypress.Commands.add("seedProduct", (payload: Record<string, unknown>) => {
  const BACKEND_URL = Cypress.env("BACKEND_URL");
  const token = Cypress.env("TESTING_RESET_TOKEN");
  return cy
    .request({
      method: "POST",
      url: `${BACKEND_URL}/api/testing/seed-product`,
      headers: { "x-testing-token": token },
      body: payload,
    })
    .then((res) => res.body?.data?.id as string);
});

// ---------- a11y ----------
Cypress.Commands.add("a11y", (context?: string) => {
  cy.injectAxe();
  cy.checkA11y(context, {
    includedImpacts: ["critical", "serious"],
  });
});

export {};
