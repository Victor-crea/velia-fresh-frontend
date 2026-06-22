export class CheckoutPage {
  visit() {
    cy.visit("/checkout");
    return this;
  }

  fillShipping(data: { name: string; phone: string; address: string }) {
    cy.byTestId("checkout-name").clear();
    if (data.name)    cy.byTestId("checkout-name").type(data.name);

    cy.byTestId("checkout-phone").clear();
    if (data.phone)   cy.byTestId("checkout-phone").type(data.phone);

    cy.byTestId("checkout-address").clear();
    if (data.address) cy.byTestId("checkout-address").type(data.address);

    return this;
  }

  fillCard(data: { name: string; number: string; expiry: string; cvv: string }) {
    cy.byTestId("checkout-card-name").clear();
    if (data.name)    cy.byTestId("checkout-card-name").type(data.name);

    cy.byTestId("checkout-card-number").clear();
    if (data.number)  cy.byTestId("checkout-card-number").type(data.number);

    cy.byTestId("checkout-card-expiry").clear();
    if (data.expiry)  cy.byTestId("checkout-card-expiry").type(data.expiry);

    cy.byTestId("checkout-card-cvv").clear();
    if (data.cvv)     cy.byTestId("checkout-card-cvv").type(data.cvv);

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