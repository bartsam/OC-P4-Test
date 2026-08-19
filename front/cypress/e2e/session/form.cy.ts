import { faker } from '@faker-js/faker';
import {
  createTestSession,
  deleteTestSession,
} from '../../support/session.utils';

describe('Session form spec', () => {
  let createdSessionIds: number[] = [];

  afterEach(() => {
    createdSessionIds.forEach((id) => {
      deleteTestSession(id);
    });
    createdSessionIds.length = 0;
  });

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
    cy.loginAsAdmin();
    cy.intercept('POST', '/api/session').as('create');

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
      const createdSessionId = response?.body?.id;

      if (createdSessionId) {
        createdSessionIds.push(createdSessionId);
      }

      expect(response?.statusCode).to.eq(200);
      cy.url().should('include', '/sessions');
    });
  });

  it('should update an existing session successfully', () => {
    cy.loginAsAdmin();
    createTestSession().then((session) => {
      createdSessionIds.push(session.id);

      cy.intercept('GET', `/api/session/${session.id}`).as('getSessionDetail');
      cy.intercept('PUT', `/api/session/${session.id}`).as('updateSession');

      cy.visit(`/sessions/update/${session.id}`);

      cy.wait('@getSessionDetail');
      cy.getByTestId('name-input').should('have.value', session.name);

      cy.getByTestId('name-input').clear().type('Session modifiée');
      cy.getByTestId('submit-button').click();

      cy.wait('@updateSession').then(({ response }) => {
        expect(response?.statusCode).to.eq(200);
      });

      cy.url().should('include', '/sessions');
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
