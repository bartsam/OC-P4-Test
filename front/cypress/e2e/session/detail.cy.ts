import { faker } from '@faker-js/faker';

describe('Session detail spec', () => {
  const createTestSession = () =>
    cy
      .request('POST', '/api/auth/login', {
        email: 'yoga@studio.com',
        password: 'test!1234',
      })
      .its('body.token')
      .then((token) =>
        cy
          .request({
            method: 'POST',
            url: '/api/session',
            headers: { Authorization: `Bearer ${token}` },
            body: {
              name: faker.lorem.words(3),
              date: faker.date.soon().toISOString(),
              teacher_id: 1,
              description: faker.lorem.sentence(10),
            },
          })
          .then(({ body: session }) => ({ session, token })),
      );

  const deleteTestSession = (id: number, token: string) =>
    cy.request({
      method: 'DELETE',
      url: `/api/session/${id}`,
      headers: { Authorization: `Bearer ${token}` },
      failOnStatusCode: false,
    });

  it('should display the session information correctly', () => {
    createTestSession().then(({ session, token }) => {
      cy.loginAsUser();
      cy.contains('[data-testid=session-card]', session.name).within(() => {
        cy.getByTestId('session-detail-button').click();
      });
      cy.getByTestId('session-title')
        .contains(session.name, { matchCase: false })
        .should('be.visible');
      cy.getByTestId('session-description')
        .contains(session.description)
        .should('be.visible');
      deleteTestSession(session.id, token);
    });
  });

  it('should display the delete button for an admin user', () => {
    createTestSession().then(({ session, token }) => {
      cy.loginAsAdmin();
      cy.contains('[data-testid=session-card]', session.name).within(() => {
        cy.getByTestId('session-detail-button').click();
      });

      cy.getByTestId('delete-button').should('be.visible');
      cy.getByTestId('participate-button').should('not.exist');
      cy.getByTestId('unparticipate-button').should('not.exist');
      deleteTestSession(session.id, token);
    });
  });

  it('should display the participate button if user is not admin', () => {
    createTestSession().then(({ session, token }) => {
      cy.loginAsUser();
      cy.contains('[data-testid=session-card]', session.name).within(() => {
        cy.getByTestId('session-detail-button').click();
      });

      cy.getByTestId('participate-button').should('be.visible');
      cy.getByTestId('delete-button').should('not.exist');
      deleteTestSession(session.id, token);
    });
  });

  it('should allow user to participate and unParticipate', () => {
    createTestSession().then(({ session, token }) => {
      cy.loginAsUser();
      cy.contains('[data-testid=session-card]', session.name).within(() => {
        cy.getByTestId('session-detail-button').click();
      });

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
      deleteTestSession(session.id, token);
    });
  });

  it('should delete the session when admin clicks delete', () => {
    createTestSession().then(({ session, token }) => {
      cy.loginAsAdmin();
      cy.contains('[data-testid=session-card]', session.name).within(() => {
        cy.getByTestId('session-detail-button').click();
      });

      cy.intercept('DELETE', `/api/session/${session.id}`).as('delete');
      cy.getByTestId('delete-button').click();

      cy.wait('@delete').its('response.statusCode').should('eq', 200);
      cy.url().should('include', '/sessions');
      cy.url().should('not.include', '/detail');
      deleteTestSession(session.id, token);
    });
  });

  it('should navigate back to the previous page when click on back button', () => {
    createTestSession().then(({ session, token }) => {
      cy.loginAsAdmin();
      cy.contains('[data-testid=session-card]', session.name).within(() => {
        cy.getByTestId('session-detail-button').click();
      });

      cy.getByTestId('back-button').click();
      cy.url().should('include', '/sessions');
      cy.url().should('not.include', '/detail');
      deleteTestSession(session.id, token);
    });
  });
});
