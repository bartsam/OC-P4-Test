import { faker } from '@faker-js/faker';

describe('Login spec', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('should login admin successfuly', () => {
    cy.intercept('POST', '/api/auth/login').as('login');
    cy.intercept('GET', '/api/session').as('session');

    cy.getByTestId('email-input').type('yoga@studio.com');
    cy.getByTestId('password-input').type(`${'test!1234'}{enter}`);

    cy.wait('@login').its('response.statusCode').should('eq', 200);
    cy.wait('@session').its('response.statusCode').should('eq', 200);
    cy.url().should('include', '/sessions');
  });

  it('should login user successfully', () => {
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 200,
      body: {
        id: faker.number.int(),
        username: faker.internet.email(),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        admin: false,
      },
    }).as('login');
    cy.intercept('GET', '/api/session', []).as('session');

    cy.getByTestId('email-input').type(faker.internet.email());
    cy.getByTestId('password-input').type(
      `${faker.internet.password({ length: 10 })}{enter}`,
    );

    cy.wait('@login');
    cy.wait('@session');
    cy.url().should('include', '/sessions');
  });

  it('should fail login with wrong credentials', () => {
    cy.intercept('POST', '/api/auth/login').as('login');

    cy.getByTestId('email-input').type('wrong@studio.com');
    cy.getByTestId('password-input').type('wrongPassword');
    cy.getByTestId('submit-button').click();

    cy.wait('@login').its('response.statusCode').should('eq', 401);
    cy.getByTestId('error-message').should('be.visible');
    cy.url().should('include', '/login');
  });

  it('should displays required field error when submitting', () => {
    cy.getByTestId('submit-button').should('be.disabled');

    cy.getByTestId('email-input').type('yoga@studio.com');
    cy.getByTestId('submit-button').should('be.disabled');

    cy.getByTestId('email-input').clear();
    cy.getByTestId('password-input').type('test!1234');
    cy.getByTestId('submit-button').should('be.disabled');
  });
});
