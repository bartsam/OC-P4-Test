import { faker } from '@faker-js/faker';

describe('Session detail spec', () => {
  const createdSessionIds: number[] = [];
  let adminToken: string;

  before(() => {
    cy.request('POST', '/api/auth/login', {
      email: 'yoga@studio.com',
      password: 'test!1234',
    }).then(({ body }) => {
      console.log('Réponse login:', body);
      adminToken = body.token;
    });
  });

  afterEach(() => {
    if (createdSessionIds.length === 0) return;

    createdSessionIds.forEach((id) => {
      cy.request({
        method: 'DELETE',
        url: `/api/session/${id}`,
        headers: { Authorization: `Bearer ${adminToken}` },
        failOnStatusCode: false,
      });
    });
    createdSessionIds.length = 0;
  });

  const createSession = (overrides = {}) =>
    cy
      .request({
        method: 'POST',
        url: '/api/session',
        headers: { Authorization: `Bearer ${adminToken}` },
        body: {
          name: faker.lorem.words(3),
          date: faker.date.soon().toISOString(),
          teacher_id: 1,
          description: faker.lorem.sentence(10),
          ...overrides,
        },
      })
      .then(({ body: session }) => {
        createdSessionIds.push(session.id);
        return session;
      });

  it('should display the session information correctly', () => {
    createSession().then((session) => {
      cy.loginAsAdmin();
      cy.contains('[data-testid=session-card]', session.name).within(() => {
        cy.getByTestId('session-detail-button').click();
      });
      cy.getByTestId('session-title')
        .contains(session.name, { matchCase: false })
        .should('be.visible');
      cy.getByTestId('session-description')
        .contains(session.description)
        .should('be.visible');
    });
  });

  it('should display the delete button for an admin user', () => {
    createSession().then((session) => {
      cy.loginAsAdmin();
      cy.contains('[data-testid=session-card]', session.name).within(() => {
        cy.getByTestId('session-detail-button').click();
      });

      cy.getByTestId('delete-button').should('be.visible');
      cy.getByTestId('participate-button').should('not.exist');
      cy.getByTestId('unparticipate-button').should('not.exist');
    });
  });

  it('should display the participate button if user is not admin', () => {
    createSession().then((session) => {
      cy.loginAsUser();
      cy.contains('[data-testid=session-card]', session.name).within(() => {
        cy.getByTestId('session-detail-button').click();
      });

      cy.getByTestId('participate-button').should('be.visible');
      cy.getByTestId('delete-button').should('not.exist');
    });
  });

  it('should allow user to participate and unParticipate', () => {
    createSession().then((session) => {
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
    });
  });

  it('should delete the session when admin clicks delete', () => {
    createSession().then((session) => {
      cy.loginAsAdmin();
      cy.contains('[data-testid=session-card]', session.name).within(() => {
        cy.getByTestId('session-detail-button').click();
      });

      cy.intercept('DELETE', `/api/session/${session.id}`).as('delete');
      cy.getByTestId('delete-button').click();

      cy.wait('@delete').its('response.statusCode').should('eq', 200);
      cy.url().should('include', '/sessions');
      cy.url().should('not.include', '/detail');

      // Le back a déjà supprimé cette session, inutile de la nettoyer nous-mêmes.
      createdSessionIds.splice(createdSessionIds.indexOf(session.id), 1);
    });
  });

  it('should navigate back to the previous page when click on back button', () => {
    createSession().then((session) => {
      cy.loginAsAdmin();
      cy.contains('[data-testid=session-card]', session.name).within(() => {
        cy.getByTestId('session-detail-button').click();
      });

      cy.getByTestId('back-button').click();
      cy.url().should('include', '/sessions');
      cy.url().should('not.include', '/detail');
    });
  });
});
