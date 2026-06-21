export class CheckoutPage {
  visit() {
    cy.visit("/checkout");
    return this;
  }
  fillShipping(data: { name: string; phone: string; address: string }) {
    cy.byTestId("checkout-name").clear().type(data.name);
    cy.byTestId("checkout-phone").clear().type(data.phone);
    cy.byTestId("checkout-address").clear().type(data.address);
    return this;
  }
  fillCard(data: { name: string; number: string; expiry: string; cvv: string }) {
    cy.byTestId("checkout-card-name").clear().type(data.name);
    cy.byTestId("checkout-card-number").clear().type(data.number);
    cy.byTestId("checkout-card-expiry").clear().type(data.expiry);
    cy.byTestId("checkout-card-cvv").clear().type(data.cvv);
    return this;
  }
  submit() {
    cy.byTestId("checkout-submit").click();
    return this;
  }
  successHeading() {
    return cy.byTestId("checkout-success");
  }
}
