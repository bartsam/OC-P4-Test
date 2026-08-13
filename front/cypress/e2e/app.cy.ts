describe('App spec', () => {
  it('should redirect to /login while not logged in', () => {
    cy.visit('/sessions');
    cy.url().should('include', '/login');
  });

  it('should display login and register links when not logged', () => {
    cy.visit('/');
    cy.getByTestId('login-button').should('be.visible');
    cy.getByTestId('register-button').should('be.visible');
    cy.getByTestId('logout-button').should('not.exist');
  });

  it('should display the logout link and hide login/register links when logged', () => {
    cy.loginAsAdmin();

    cy.getByTestId('logout-button').should('be.visible');
    cy.getByTestId('login-button').should('not.exist');
    cy.getByTestId('register-button').should('not.exist');
  });

  it('should logout and navigate back to the home page when click logout', () => {
    cy.loginAsAdmin();

    cy.getByTestId('logout-button').click();

    cy.url().should('contain', '/login');
    cy.getByTestId('login-button').should('be.visible');
    cy.getByTestId('logout-button').should('not.exist');
  });
});
