import { faker } from '@faker-js/faker';

describe('Session form spec', () => {
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
    cy.getByTestId('session-create-button').click();
    cy.url().should('include', '/sessions/create');

    cy.intercept('POST', '/api/session').as('create');

    cy.getByTestId('name-input').type(faker.lorem.words(3));
    cy.getByTestId('date-input').type(
      faker.date.soon().toISOString().split('T')[0],
    );
    cy.getByTestId('teacher-select').click();
    cy.get('mat-option').first().click();
    cy.getByTestId('description-input').type(faker.lorem.sentence(10));

    cy.getByTestId('submit-button').click();
    cy.wait('@create').then(({ response }) => {
      console.log(response);
      expect(response?.statusCode).to.eq(200);
      createdSessionIds.push(response!.body.id);
    });
    cy.url().should('include', '/sessions');
    cy.url().should('not.include', '/create');
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

  it('should update an existing session successfully', () => {
    cy.request({
      method: 'POST',
      url: '/api/session',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        name: 'Session à modifier',
        date: faker.date.soon().toISOString(),
        teacher_id: 1,
        description: 'Description initiale',
      },
    }).then(({ body: session }) => {
      createdSessionIds.push(session.id);

      cy.loginAsAdmin();

      cy.intercept('GET', `/api/session/${session.id}`).as('getSessionDetail');
      cy.intercept('PUT', `/api/session/${session.id}`).as('updateSession');

      cy.contains('[data-testid=session-card]', session.name).within(() => {
        cy.getByTestId('session-edit-button').click();
      });
      cy.url().should('include', `/sessions/update/${session.id}`);

      cy.wait('@getSessionDetail');
      cy.getByTestId('name-input').should('have.value', session.name);

      const updatedName = 'Session modifiée';
      cy.getByTestId('name-input').clear().type(updatedName);
      cy.getByTestId('submit-button').click();

      cy.wait('@updateSession').its('response.statusCode').should('eq', 200);

      cy.url().should('include', '/sessions');
      cy.url().should('not.include', '/update');
    });
  });
});
