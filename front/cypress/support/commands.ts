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
    /**
     * Get session token
     */
    getSessionToken(): Chainable<void>;
  }
}

Cypress.Commands.add('getByTestId', (id: string) => {
  return cy.get(`[data-testid=${id}]`);
});

function login(email: string, password: string, sessionName: string) {
  cy.session(
    sessionName,
    () => {
      cy.request('POST', '/api/auth/login', { email, password }).then(
        ({ body }) => {
          window.localStorage.setItem(
            'sessionInformation',
            JSON.stringify(body),
          );
        },
      );
    },
    {
      validate() {
        expect(localStorage.getItem('sessionInformation')).to.exist;
      },
    },
  );
  cy.visit('/sessions');
}

Cypress.Commands.add('loginAsAdmin', () =>
  login('yoga@studio.com', 'test!1234', 'adminSession'),
);
Cypress.Commands.add('loginAsUser', () =>
  login('user@studio.com', 'test!1234', 'userSession'),
);

Cypress.Commands.add('getSessionToken', () => {
  return cy.window().then((win) => {
    const session = win.localStorage.getItem('sessionInformation');
    if (!session) {
      throw new Error('Aucune session active dans le localStorage.');
    }
    return JSON.parse(session).token;
  });
});
