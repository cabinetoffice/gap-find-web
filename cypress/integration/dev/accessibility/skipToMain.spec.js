import cy_visit from '../../../utils/cyVisit';
describe('Skip to main content home page', () => {
  it('should be able to able to "skip" and the focus on the main title', () => {
    cy_visit('/');
    cy.get('[data-cy="cySkipLink"]').click({ force: true });
    cy.url().should('include', '/#main-content');
  });
});
