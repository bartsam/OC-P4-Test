import { faker } from '@faker-js/faker';

describe('Me spec', () => {
  it('should display user informations', () => {
    cy.loginAsAdmin();
    cy.getByTestId('account-button').click();
    cy.url().should('include', '/me');

    cy.getByTestId('user-name').should('be.visible');
    cy.getByTestId('user-email').should('contain', 'yoga@studio.com');
    cy.getByTestId('admin-message').should('contain', 'You are admin');
    cy.getByTestId('delete-button').should('not.exist');
  });

  it('should delete the user if not admin', () => {
    const disposableUser = {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email(),
      password: 'test!1234',
    };

    cy.request('POST', '/api/auth/register', disposableUser);

    cy.visit('/login');
    cy.getByTestId('email-input').type(disposableUser.email);
    cy.getByTestId('password-input').type(`${disposableUser.password}{enter}`);
    cy.url().should('include', '/sessions');

    cy.getByTestId('account-button').click();
    cy.url().should('include', '/me');

    cy.getByTestId('delete-button').should('be.visible').click();

    cy.url().should('include', '/login');
    cy.getByTestId('login-button').should('be.visible');
  });

  it('should display delete button when user is not admin', () => {
    cy.loginAsUser();
    cy.getByTestId('account-button').click();
    cy.url().should('include', '/me');

    cy.getByTestId('delete-button').should('be.visible');
  });

  it('should navigate to the previous page when back button is clicked', () => {
    cy.loginAsUser();
    cy.getByTestId('account-button').click();
    cy.url().should('include', '/me');

    cy.getByTestId('back-button').click();
    cy.url().should('include', '/sessions');
  });
});
