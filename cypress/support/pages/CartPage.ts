export class CartPage {
  visit() {
    cy.visit("/carrito");
    return this;
  }
  items() {
    return cy.byTestId("cart-item");
  }
  total() {
    return cy.byTestId("cart-total");
  }
  checkout() {
    cy.byTestId("cart-checkout").click();
    return this;
  }
  removeFirst() {
    cy.byTestId("cart-item").first().find('[data-testid^="cart-remove-"]').click();
    return this;
  }
}
