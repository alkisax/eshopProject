describe('Todo App E2E', () => {
  const testUsername = 'cypressUser';
  const testTodo = 'Write Cypress test';

  it('can create a new todo, delete it, then visit health page', () => {
    // Visit home page
    cy.visit('http://localhost:5173');

    // Type username
    cy.get('#username').clear().type(testUsername);

    // Type new todo
    cy.get('#new-todo').clear().type(testTodo);

    // Click Add button
    cy.get('#addButton').click();

    // Wait and check if the new todo is visible in the list
    cy.contains(testTodo).should('be.visible');

    cy.wait(2000)
    // Delete the todo by clicking the delete button with id `delete_<todo_id>`
    // Since the id contains _id generated dynamically, find the list item by text, then find the button inside it
    cy.contains('li', testTodo).within(() => {
      cy.get('button[aria-label="delete"]').click();
    });

    // Check that the todo is no longer in the list
    cy.contains(testTodo).should('not.exist');

    // Click the Health button in the header
    cy.get('#healthButton').click();

    // Confirm that the Health page shows backend status (you can adjust based on your page)
    cy.contains('Health Check').should('be.visible');
    cy.contains('Backend status:').should('exist');
    cy.contains('ok').should('exist');
    cy.wait(2000)

    cy.get('#HomeButton').click();
  });
});
