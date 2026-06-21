export class CatalogPage {
  visit() {
    cy.visit("/catalogo");
    return this;
  }
  search(term: string) {
    cy.byTestId("catalog-search").clear().type(term);
    return this;
  }
  selectCategory(name: string) {
    cy.byTestId(`category-${name}`).click();
    return this;
  }
  productCards() {
    return cy.byTestId("product-card");
  }
  empty() {
    return cy.byTestId("catalog-empty");
  }
  loading() {
    return cy.byTestId("catalog-loading");
  }
  addFirstToCart() {
    cy.byTestId("product-card").first().find('[data-testid^="add-to-cart-"]').click();
    return this;
  }
}
