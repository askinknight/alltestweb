describe('Full Login and Navigation Test', () => {
    it('should redirect to dashboard on successful login', () => {
      cy.visit('http://localhost:5500/index.html');
      cy.get('#username').type('admin');
      cy.get('#password').type('1234');
      cy.get('form').submit();
  
      // รอ redirect แล้วเช็คว่าอยู่ที่ dashboard แล้ว
      cy.url().should('include', '/dashboard.html');
      cy.get('h1').should('contain', 'Welcome to the Dashboard');
      cy.get('#welcome-msg').should('exist');
    });
  
    it('should stay on login page if login fails', () => {
      cy.visit('http://localhost:5500/index.html');
      cy.get('#username').type('wrong');
      cy.get('#password').type('wrong');
      cy.get('form').submit();
  
      cy.url().should('include', '/index.html');
      cy.get('#message').should('contain', 'Login failed!');
    });
  });
  