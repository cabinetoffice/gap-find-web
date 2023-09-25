import cy_visit from '../../../utils/cyVisit';
describe('pagination', () => {
  it('should show pagination component, dynamic next and prev buttons and redirect the user to the correct page', () => {
    cy_visit('/grants');

    // Check pagination exists
    cy.get('[data-cy="cyPaginationComponent"]').should('exist');
    cy.get('[data-cy="cyPaginationNextButton"]').should('exist');
    cy.get('[data-cy="cyPaginationPreviousButton"]').should('not.exist');
    cy.get('[data-cy="cyPaginationShowingGrants"]')
      .should('exist')
      .contains('Showing 1 to 10 of');
    cy.get('[data-cy=cyGrantNameAndLink]').should('have.length', '10');
    cy.get('[data-cy="cyGrantsFoundMessage"]').should('exist');

    // Check the next button works
    cy.get('[data-cy="cyPaginationNextButton"]').should('exist').click();
    cy.get('[data-cy="cyPaginationShowingGrants"]')
      .should('exist')
      .contains('Showing 11 to');
    cy.get('[data-cy="cyPaginationComponent"]').should('exist');
    cy.get('[data-cy="cyPaginationPreviousButton"]').should('exist');
    cy.get('[data-cy=cyGrantNameAndLink]').should('have.length.lessThan', 11);

    // Check previous button works
    cy.get('[data-cy="cyPaginationPreviousButton"]').should('exist').click();
    cy.get('[data-cy="cyPaginationShowingGrants"]')
      .should('exist')
      .contains('Showing 1 to 10 of');
    cy.get('[data-cy=cyGrantNameAndLink]').should('have.length', '10');

    // Navigate to page number
    cy.get('[data-cy="cyPaginationPageNumber2"]').should('exist').click();
    cy.get('[data-cy="cyPaginationShowingGrants"]')
      .should('exist')
      .contains('Showing 11 to');
    cy.get('[data-cy=cyGrantNameAndLink]').should('have.length.lessThan', 11);
    cy.get('[data-cy="cyPaginationPreviousButton"]').should('exist').click();
    cy.get('[data-cy="cyPaginationComponent"]').should('exist');
    cy.get('[data-cy="cyPaginationNextButton"]').should('exist');
    cy.get('[data-cy="cyPaginationPreviousButton"]').should('not.exist');
    cy.get('[data-cy="cyGrantsFoundMessage"]').should('exist');

    // Pagination not rendered
    cy.get('[data-cy="cy£10,001 to £50,000Checkbox"]').click();
    cy.get('[data-cy="cy£10,001 to £50,000Checkbox"]').should('be.checked');
    cy.get('[data-cy="cyApplyFilter"').click();
    cy.get('[data-cy="cyPaginationComponent"]').should('not.exist');
    cy.get('[data-cy="cyPaginationNextButton"]').should('not.exist');
    cy.get('[data-cy="cyPaginationPreviousButton"]').should('not.exist');
  });
});
