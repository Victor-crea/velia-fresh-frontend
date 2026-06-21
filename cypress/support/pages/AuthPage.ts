export class AuthPage {
  visit() {
    cy.visit("/login");
    return this;
  }
  switchTo(tab: "login" | "register") {
    cy.byTestId(`auth-tab-${tab}`).click();
    return this;
  }
  fillLogin(email: string, password: string) {
    cy.byTestId("auth-email").clear().type(email);
    cy.byTestId("auth-password").clear().type(password, { log: false });
    return this;
  }
  fillRegister(name: string, email: string, password: string) {
    this.switchTo("register");
    cy.byTestId("auth-fullname").clear().type(name);
    this.fillLogin(email, password);
    return this;
  }
  submit() {
    cy.byTestId("auth-submit").click();
    return this;
  }
}
