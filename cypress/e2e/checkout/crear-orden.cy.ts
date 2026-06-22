// Módulo: Checkout → Crear orden
import { CatalogPage } from "../../support/pages/CatalogPage";
import { CartPage } from "../../support/pages/CartPage";
import { CheckoutPage } from "../../support/pages/CheckoutPage";
import orders from "../../fixtures/orders.json";

const catalog = new CatalogPage();
const cart = new CartPage();
const checkout = new CheckoutPage();

describe("Checkout · Crear orden", () => {
  beforeEach(() => {
    // Punto 3: login vía API directamente, sin pasar por la UI
    cy.loginAs("cliente");
    cy.intercept("GET", "**/rest/v1/products*", { fixture: "products.json" }).as("products");
    catalog.visit();
    cy.wait("@products");
    catalog.addFirstToCart();
    cart.visit();
    cart.checkout();
  });

  it("crea una orden con datos válidos (POST orders interceptado)", () => {
  cy.intercept("POST", "**/rest/v1/orders*", {
    statusCode: 201,
    body: { id: "00000000-0000-0000-0000-000000000999" },  // ← objeto, no array
  }).as("createOrder");

  cy.intercept("POST", "**/rest/v1/order_items*", {
    statusCode: 201,
    body: [],
  }).as("createItems");

  cy.intercept("PATCH", "**/rest/v1/products*", {
    statusCode: 204,
    body: "",
  }).as("updateStock");

  cy.intercept("PATCH", "**/rest/v1/profiles*", {
    statusCode: 204,
    body: "",
  }).as("updateProfile");

  checkout
    .fillShipping(orders.valid.shipping)
    .fillCard(orders.valid.card)
    .submit();

  cy.wait("@createOrder");
  cy.wait("@createItems");

  checkout.successHeading().should("be.visible");
});

  it("muestra error cuando el backend falla al crear orden", () => {
    cy.intercept("POST", "**/rest/v1/orders*", {
      statusCode: 500,
      body: { message: "boom" },
    }).as("orderFail");

    checkout
      .fillShipping(orders.valid.shipping)
      .fillCard(orders.valid.card)
      .submit();

    cy.wait("@orderFail");
    cy.contains(/error|boom/i).should("be.visible");
  });

  it("bloquea el envío con datos inválidos", () => {
    checkout
      .fillShipping(orders.invalid.shipping as never)
      .fillCard(orders.invalid.card as never)
      .submit();
    cy.contains(/revisa los campos/i).should("be.visible");
  });
});
