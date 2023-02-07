export default function checkNoGrantsFound() {
  cy.get('[data-cy=cyGrantNameAndLink]').should('not.exist');
  cy.get('[data-cy=cyGrantsFoundMessage]').should(
    'contain',
    'We’ve found 0 grants'
  );
}
