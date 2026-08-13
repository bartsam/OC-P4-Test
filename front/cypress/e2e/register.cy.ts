import { faker } from '@faker-js/faker';
describe('Register spec', () => {
  const registeredEmails: string[] = [];
  const fakePassword = 'test!1234';
  beforeEach(() => {
    cy.visit('/register');
  });

  afterEach(() => {
    registeredEmails.forEach((email) => {
      cy.request({
        method: 'POST',
        url: '/api/auth/login',
        body: { email, password: fakePassword },
        failOnStatusCode: false,
      }).then((loginResponse) => {
        if (loginResponse.status === 200) {
          const { id, token } = loginResponse.body;
          cy.request({
            method: 'DELETE',
            url: `/api/user/${id}`,
            headers: { Authorization: `Bearer ${token}` },
          });
        }
      });
    });
    registeredEmails.length = 0;
  });

  it('should register successfully', () => {
    const email = faker.internet.email();
    cy.intercept('POST', '/api/auth/register').as('register');

    cy.getByTestId('firstName-input').type(faker.person.firstName());
    cy.getByTestId('lastName-input').type(faker.person.lastName());
    cy.getByTestId('email-input').type(email);
    cy.getByTestId('password-input').type(fakePassword);

    cy.getByTestId('submit-button').click();

    cy.wait('@register').its('response.statusCode').should('eq', 200);
    cy.url().should('include', '/login');

    registeredEmails.push(email);
  });

  it('should displays a message when a server error occurs', () => {
    const existingEmail = faker.internet.email();

    cy.request('POST', '/api/auth/register', {
      firstName: 'John',
      lastName: 'Doe',
      email: existingEmail,
      password: fakePassword,
    });
    registeredEmails.push(existingEmail);

    cy.intercept('POST', '/api/auth/register').as('register');

    cy.getByTestId('firstName-input').type('John');
    cy.getByTestId('lastName-input').type('Doe');
    cy.getByTestId('email-input').type(existingEmail);
    cy.getByTestId('password-input').type(fakePassword);
    cy.getByTestId('submit-button').click();

    cy.wait('@register').its('response.statusCode').should('eq', 400);
    cy.getByTestId('error-message').should('be.visible');
  });

  it('should displays disable submit when field are invalid', () => {
    cy.getByTestId('submit-button').should('be.disabled');

    cy.getByTestId('firstName-input').type('ab');
    cy.getByTestId('lastName-input').type('cd');
    cy.getByTestId('email-input').type('invalid-email');
    cy.getByTestId('password-input').type('12');
    cy.getByTestId('submit-button').should('be.disabled');
  });

  it('should toggle password visibility', () => {
    cy.getByTestId('password-input').should('have.attr', 'type', 'password');

    cy.getByTestId('password-button').click();
    cy.getByTestId('password-input').should('have.attr', 'type', 'text');

    cy.getByTestId('password-button').click();
    cy.getByTestId('password-input').should('have.attr', 'type', 'password');
  });
});
