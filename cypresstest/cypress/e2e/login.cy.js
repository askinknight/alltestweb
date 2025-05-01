describe('Login Page Test Cases', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5500/index.html');
  });

  it('Login success with correct username and password', () => {
    cy.get('#username').type('admin');
    cy.get('#password').type('1234');
    cy.get('form').submit();

    // ตรวจสอบว่าถูก redirect ไปหน้า dashboard จริง
    cy.url().should('include', '/dashboard.html');
    cy.get('h1').should('contain', 'Welcome to the Dashboard');
  });

  it('Login fails with incorrect password', () => {
    cy.get('#username').type('admin');
    cy.get('#password').type('wrong');
    cy.get('form').submit();
    cy.get('#message').should('contain', 'Login failed!');
    cy.url().should('include', '/index.html');
  });

  it('Login fails with empty username', () => {
    cy.get('#password').type('1234');
    cy.get('form').submit();
    cy.get('#message').should('contain', 'Login failed!');
    cy.url().should('include', '/index.html');
  });

  it('Login fails with empty password', () => {
    cy.get('#username').type('admin');
    cy.get('form').submit();
    cy.get('#message').should('contain', 'Login failed!');
    cy.url().should('include', '/index.html');
  });

  it('Login fails with empty form', () => {
    cy.get('form').submit();
    cy.get('#message').should('contain', 'Login failed!');
    cy.url().should('include', '/index.html');
  });

  it('Clears message when retyping username', () => {
    cy.get('#username').type('wrong');
    cy.get('#password').type('wrong');
    cy.get('form').submit();
    cy.get('#message').should('contain', 'Login failed!');

    cy.get('#username').clear().type('admin');
    cy.get('#password').clear().type('1234');
    cy.get('form').submit();

    cy.url().should('include', '/dashboard.html');
    cy.get('h1').should('contain', 'Welcome to the Dashboard');
  });
});
