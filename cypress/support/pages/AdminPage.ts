export class AdminPage {
  visit() {
    cy.visit("/admin");
    return this;
  }
  goToTab(id: "dashboard" | "products" | "orders" | "users") {
    cy.byTestId(`admin-tab-${id}`).click();
    return this;
  }
  openNewProduct() {
    cy.byTestId("admin-new-product").click();
    return this;
  }
  fillProductForm(p: { name: string; description: string; price: number; stock: number }) {
    cy.byTestId("admin-form-name").clear().type(p.name);
    cy.byTestId("admin-form-description").clear().type(p.description);
    cy.byTestId("admin-form-price").clear().type(String(p.price));
    cy.byTestId("admin-form-stock").clear().type(String(p.stock));
    return this;
  }
  saveProduct() {
    cy.byTestId("admin-form-save").click();
    return this;
  }
  productRows() {
    return cy.byTestId("admin-product-row");
  }
}
