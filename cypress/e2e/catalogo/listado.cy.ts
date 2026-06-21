// Módulo: Catálogo → Listado
import { CatalogPage } from "../../support/pages/CatalogPage";

const catalog = new CatalogPage();

describe("Catálogo · Listado", () => {
  beforeEach(() => {
    cy.logout();
    // Punto 4: control de red con cy.intercept + Punto 5: fixture compartido
    cy.intercept("GET", "**/rest/v1/products*", { fixture: "products.json" }).as("products");
  });

  it("renderiza las tarjetas de productos desde la fixture", () => {
    catalog.visit();
    cy.wait("@products");
    catalog.productCards().should("have.length", 3);
    cy.contains("E2E Ribeye").should("be.visible");
  });

  it("muestra estado de carga inicialmente", () => {
    cy.intercept("GET", "**/rest/v1/products*", (req) => {
      req.on("response", (res) => res.setDelay(500));
      req.reply({ fixture: "products.json" });
    });
    catalog.visit();
    catalog.loading().should("be.visible");
    catalog.productCards().should("have.length", 3);
  });

  it("a11y básico en el catálogo", () => {
    catalog.visit();
    cy.wait("@products");
    cy.a11y();
  });
});
