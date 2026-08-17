import { faker } from '@faker-js/faker';

describe('Session form spec', () => {
  const getToken = (): Cypress.Chainable<string> =>
    cy
      .request('POST', '/api/auth/login', {
        email: 'yoga@studio.com',
        password: 'test!1234',
      })
      .its('body.token');

  it('should redirect to /sessions if user not admin', () => {
    cy.visit('/sessions/create');
    cy.url().should('include', '/login');
  });

  it('should display the form if admin user logged', () => {
    cy.loginAsAdmin();
    cy.getByTestId('session-create-button').click();
    cy.url().should('include', '/sessions/create');
    cy.getByTestId('session-form').should('be.visible');
  });

  it('should not display create/update buttons if user is not admin', () => {
    cy.loginAsUser();
    cy.getByTestId('session-create-button').should('not.exist');
    cy.getByTestId('session-edit-button').should('not.exist');
  });

  it('should create a session successfully', () => {
    cy.intercept('POST', '/api/session').as('create');

    cy.loginAsAdmin();
    cy.getByTestId('session-create-button').click();
    cy.url().should('include', '/sessions/create');

    cy.getByTestId('name-input').type(faker.lorem.words(3));
    cy.getByTestId('date-input').type(
      faker.date.soon().toISOString().split('T')[0],
    );
    cy.getByTestId('teacher-select').click();
    cy.get('mat-option').first().click();
    cy.getByTestId('description-input').type(faker.lorem.sentence(10));

    cy.getByTestId('submit-button').click();

    cy.wait('@create').then(({ response }) => {
      const createdId = response?.body?.id;

      if (createdId) {
        getToken().then((token) => {
          cy.request({
            method: 'DELETE',
            url: `/api/session/${createdId}`,
            headers: { Authorization: `Bearer ${token}` },
            failOnStatusCode: false,
          });
        });
      }

      expect(response?.statusCode).to.eq(200);
      cy.url().should('include', '/sessions');
    });
  });

  it('should update an existing session successfully', () => {
    getToken().then((token) => {
      cy.request({
        method: 'POST',
        url: '/api/session',
        headers: { Authorization: `Bearer ${token}` },
        body: {
          name: 'Session à modifier',
          date: faker.date.soon().toISOString(),
          teacher_id: 1,
          description: 'Description initiale',
        },
      }).then(({ body: session }) => {
        cy.intercept('GET', `/api/session/${session.id}`).as(
          'getSessionDetail',
        );
        cy.intercept('PUT', `/api/session/${session.id}`).as('updateSession');

        cy.loginAsAdmin();

        cy.contains('[data-testid=session-card]', session.name).within(() => {
          cy.getByTestId('session-edit-button').click();
        });

        cy.wait('@getSessionDetail');
        cy.getByTestId('name-input').should('have.value', session.name);

        cy.getByTestId('name-input').clear().type('Session modifiée');
        cy.getByTestId('submit-button').click();

        cy.wait('@updateSession').then(({ response }) => {
          cy.request({
            method: 'DELETE',
            url: `/api/session/${session.id}`,
            headers: { Authorization: `Bearer ${token}` },
            failOnStatusCode: false,
          });
          expect(response?.statusCode).to.eq(200);
        });

        cy.url().should('include', '/sessions');
      });
    });
  });

  it('should display required field error when a mandatory field is missing', () => {
    cy.loginAsAdmin();
    cy.getByTestId('session-create-button').click();

    cy.getByTestId('submit-button').should('be.disabled');

    cy.getByTestId('name-input').type(faker.lorem.words(2));
    cy.getByTestId('submit-button').should('be.disabled');

    cy.getByTestId('date-input').type(
      faker.date.soon().toISOString().split('T')[0],
    );
    cy.getByTestId('submit-button').should('be.disabled');
  });
});
