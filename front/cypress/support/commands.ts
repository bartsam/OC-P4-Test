// ***********************************************
// This example namespace declaration will help
// with Intellisense and code completion in your
// IDE or Text Editor.
// ***********************************************
// declare namespace Cypress {
//   interface Chainable<Subject = any> {
//     customCommand(param: any): typeof customCommand;
//   }
// }
//
// function customCommand(param: any): void {
//   console.warn(param);
// }
//
// NOTE: You can use it like so:
// Cypress.Commands.add('customCommand', customCommand);
//
// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

declare namespace Cypress {
  interface Chainable<Subject = any> {
    /**
     * Select a HTML element with data-cy attribut
     * @example cy.getByTestId('submit-btn')
     */
    getByTestId(id: string): Chainable<JQuery<HTMLElement>>;
    /**
     * Log in as an admin account (yoga@studio.com)
     */
    loginAsAdmin(): Chainable<void>;
    /**
     * Log in as user account (user@studio.com)
     */
    loginAsUser(): Chainable<void>;
  }
}

Cypress.Commands.add('getByTestId', (id: string) => {
  return cy.get(`[data-testid=${id}]`);
});

Cypress.Commands.add('loginAsAdmin', () => {
  cy.visit('/login');
  cy.getByTestId('email-input').type('yoga@studio.com');
  cy.getByTestId('password-input').type('test!1234{enter}');
  cy.url().should('include', '/sessions');
});

Cypress.Commands.add('loginAsUser', () => {
  cy.visit('/login');
  cy.getByTestId('email-input').type('user@studio.com');
  cy.getByTestId('password-input').type('test!1234{enter}');
  cy.url().should('include', '/sessions');
});
