export class HomePage {
  visit() {
    cy.visit("/");
    return this;
  }
  goToCatalog() {
    cy.byTestId("nav-catalog").click();
    return this;
  }
  goToCart() {
    cy.byTestId("nav-cart").click();
    return this;
  }
}
