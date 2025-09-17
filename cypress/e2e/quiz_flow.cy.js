
describe('Quiz Flow', () => {
  it('User can enter quiz code and access quiz', () => {
    cy.visit('/EnterQuizCode');
    cy.get('input[name="quizCode"]').type('ABC123');
    cy.get('input[name="accessKey"]').type('KEY1');
    cy.get('button').contains('Join Quiz').click();
    cy.url().should('include', '/quiz-access');
  });
});
