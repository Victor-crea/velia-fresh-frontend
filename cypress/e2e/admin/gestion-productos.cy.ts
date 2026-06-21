// Módulo: Admin → Gestión de productos
import { AdminPage } from "../../support/pages/AdminPage";

const admin = new AdminPage();

describe("Admin · Gestión de productos", () => {
  beforeEach(() => {
    cy.loginAs("admin");
    cy.intercept("GET", "**/rest/v1/products*", { fixture: "products.json" }).as("products");
  });

  it("muestra el listado de productos en la pestaña Productos", () => {
    admin.visit();
    admin.goToTab("products");
    cy.wait("@products");
    admin.productRows().should("have.length", 3);
  });

  it("abre el diálogo para crear un nuevo producto", () => {
    admin.visit();
    admin.goToTab("products");
    cy.wait("@products");
    admin.openNewProduct();
    cy.byTestId("admin-form-name").should("be.visible");
  });

  it("envía un POST al crear producto (interceptado)", () => {
    cy.intercept("POST", "**/rest/v1/products*", { statusCode: 201, body: [{}] }).as("create");
    admin.visit();
    admin.goToTab("products");
    cy.wait("@products");
    admin.openNewProduct();
    admin
      .fillProductForm({
        name: "E2E Nuevo",
        description: "Producto creado por Cypress",
        price: 199.5,
        stock: 10,
      })
      .saveProduct();
    cy.wait("@create").its("request.body.name").should("eq", "E2E Nuevo");
  });
});
