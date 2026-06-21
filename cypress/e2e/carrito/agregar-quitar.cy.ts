// Módulo: Carrito → Agregar / Quitar
import { CatalogPage } from "../../support/pages/CatalogPage";
import { CartPage } from "../../support/pages/CartPage";

const catalog = new CatalogPage();
const cart = new CartPage();

describe("Carrito · Agregar y quitar productos", () => {
  beforeEach(() => {
    cy.logout();
    cy.intercept("GET", "**/rest/v1/products*", { fixture: "products.json" }).as("products");
  });

  it("agrega un producto desde el catálogo y aparece en el carrito", () => {
    catalog.visit();
    cy.wait("@products");
    catalog.addFirstToCart();
    cy.byTestId("nav-cart-count").should("be.visible");
    cart.visit();
    cart.items().should("have.length.at.least", 1);
    cart.total().should("be.visible");
  });

  it("quita un producto del carrito", () => {
    catalog.visit();
    cy.wait("@products");
    catalog.addFirstToCart();
    cart.visit();
    cart.removeFirst();
    cy.contains(/carrito está vacío/i).should("be.visible");
  });

  it("a11y básico del carrito con items", () => {
    catalog.visit();
    cy.wait("@products");
    catalog.addFirstToCart();
    cart.visit();
    cy.a11y();
  });
});
