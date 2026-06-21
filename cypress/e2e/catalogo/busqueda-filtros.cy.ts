// Módulo: Catálogo → Búsqueda y filtros
import { CatalogPage } from "../../support/pages/CatalogPage";

const catalog = new CatalogPage();

describe("Catálogo · Búsqueda y filtros", () => {
  beforeEach(() => {
    cy.intercept("GET", "**/rest/v1/products*", { fixture: "products.json" }).as("products");
    catalog.visit();
    cy.wait("@products");
  });

  it("filtra por categoría 'Res'", () => {
    catalog.selectCategory("Res");
    catalog.productCards().should("have.length", 1);
    cy.contains("E2E Ribeye").should("be.visible");
  });

  it("busca por nombre (debounced)", () => {
    catalog.search("pollo");
    catalog.productCards().should("have.length", 1);
    cy.contains("E2E Pechuga de Pollo").should("be.visible");
  });

  it("muestra vacío cuando no hay resultados", () => {
    catalog.search("zzzzzzzz");
    catalog.empty().should("be.visible");
  });
});
