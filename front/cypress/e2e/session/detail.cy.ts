import {
  createTestSession,
  deleteTestSession,
} from '../../support/session.utils';

describe('Session detail spec', () => {
  const createdSessionIds: number[] = [];

  afterEach(() => {
    createdSessionIds.forEach((id) => {
      deleteTestSession(id);
    });
    createdSessionIds.length = 0;
  });

  it('should display the session information correctly', () => {
    cy.loginAsUser();
    createTestSession().then((session) => {
      createdSessionIds.push(session.id);
      cy.visit(`/sessions/detail/${session.id}`);

      cy.getByTestId('session-title')
        .contains(session.name, { matchCase: false })
        .should('be.visible');
      cy.getByTestId('session-description')
        .contains(session.description)
        .should('be.visible');
    });
  });

  it('should display the delete button for an admin user', () => {
    cy.loginAsAdmin();
    createTestSession().then((session) => {
      createdSessionIds.push(session.id);
      cy.visit(`/sessions/detail/${session.id}`);

      cy.getByTestId('delete-button').should('be.visible');
      cy.getByTestId('participate-button').should('not.exist');
      cy.getByTestId('unparticipate-button').should('not.exist');
    });
  });

  it('should display the participate button if user is not admin', () => {
    cy.loginAsUser();
    createTestSession().then((session) => {
      createdSessionIds.push(session.id);
      cy.visit(`/sessions/detail/${session.id}`);

      cy.getByTestId('participate-button').should('be.visible');
      cy.getByTestId('delete-button').should('not.exist');
    });
  });

  it('should allow user to participate and unParticipate', () => {
    cy.loginAsUser();
    createTestSession().then((session) => {
      createdSessionIds.push(session.id);
      cy.visit(`/sessions/detail/${session.id}`);

      cy.intercept('POST', `/api/session/${session.id}/participate/*`).as(
        'participate',
      );
      cy.getByTestId('participate-button').click();
      cy.wait('@participate');

      cy.getByTestId('unparticipate-button').should('be.visible');
      cy.contains('1 attendees').should('be.visible');

      cy.intercept('DELETE', `/api/session/${session.id}/participate/*`).as(
        'unParticipate',
      );
      cy.getByTestId('unparticipate-button').click();
      cy.wait('@unParticipate');

      cy.getByTestId('participate-button').should('be.visible');
      cy.contains('0 attendees').should('be.visible');
    });
  });

  it('should delete the session when admin clicks delete', () => {
    cy.loginAsAdmin();
    createTestSession().then((session) => {
      createdSessionIds.push(session.id);
      cy.visit(`/sessions/detail/${session.id}`);

      cy.intercept('DELETE', `/api/session/${session.id}`).as('delete');
      cy.getByTestId('delete-button').click();

      cy.wait('@delete').its('response.statusCode').should('eq', 200);
      cy.url().should('include', '/sessions');
      cy.url().should('not.include', '/detail');
    });
  });

  it('should navigate back to the previous page when click on back button', () => {
    cy.loginAsAdmin();
    createTestSession().then((session) => {
      createdSessionIds.push(session.id);
      cy.visit(`/sessions/detail/${session.id}`);

      cy.getByTestId('back-button').click();
      cy.url().should('include', '/sessions');
      cy.url().should('not.include', '/detail');
    });
  });
});
