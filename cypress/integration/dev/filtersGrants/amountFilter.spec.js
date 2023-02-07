import cy_visit from '../../../utils/cyVisit';
describe('Amount Filter', () => {
  beforeEach(() => {
    cy_visit('/');
    cy.get('[data-cy=cyHomePageSearchInput]').click();
  });

  it('should return suitable message when search returns no grants', () => {
    cy.get('[data-cy=cySearchGrantsBtn]').click();

    cy.get('[data-cy="cy£0 to £10,000Checkbox"]').click();
    cy.get('[data-cy="cy£0 to £10,000Checkbox"]').should('be.checked');
    cy.get('[data-cy="cyPersonal / individualCheckbox"]').click();
    cy.get('[data-cy="cyPersonal / individualCheckbox"]').should('be.checked');
    cy.get('[data-cy="cyApplyFilter"').click();
    cy.get('[data-cy="cyGrantsFoundMessage"]').should(
      'contain',
      'We’ve found 0 grants'
    );
    cy.get('[data-cy="cyNoGrantFoundMessage"]').should(
      'contain',
      'No grants found'
    );
    cy.get('[data-cy=cyGrantNameAndLink]').should('not.exist');
  });

  it('should allow single selection filter on amount ', () => {
    cy.get('[data-cy=cySearchGrantsBtn]').click();

    cy.get('[data-cy="cy£50,001 to £250,000Checkbox"]').click();
    cy.get('[data-cy="cy£50,001 to £250,000Checkbox"]').should('be.checked');
    cy.get('[data-cy="cyApplyFilter"').click();

    cy.get('[data-cy="cyGrantsFoundMessage"]').should('exist');
    cy.get('[data-cy=cyGrantNameAndLink]')
      .eq(0)
      .contains('BFI Development Fund');
    cy.get('[data-cy="cyNoGrantFoundMessage"]').should('not.exist');
  });

  it('should allow multiple filter selection on amount', () => {
    cy.get('[data-cy=cySearchGrantsBtn]').click();

    cy.get('[data-cy="cy£50,001 to £250,000Checkbox"]').click();
    cy.get('[data-cy="cy£50,001 to £250,000Checkbox"]').should('be.checked');

    cy.get('[data-cy="cy£10,001 to £50,000Checkbox"]').click();
    cy.get('[data-cy="cy£10,001 to £50,000Checkbox"]').should('be.checked');

    cy.get('[data-cy="cyApplyFilter"').click();

    cy.get('[data-cy="cyGrantsFoundMessage"]').should('exist');
    cy.get('[data-cy=cyGrantNameAndLink]')
      .eq(0)
      .contains('Workplace Charging Scheme');
    cy.get('[data-cy="cyNoGrantFoundMessage"]').should('not.exist');
  });

  it('should allow chain filter with search filters', () => {
    cy.get('[data-cy=cyHomePageSearchInput]').type('Chargepoint');
    cy.get('[data-cy=cySearchGrantsBtn]').click();
    cy.get('[data-cy=cyGrantNameAndLink]').should('have.length.greaterThan', 0);

    cy.get('[data-cy="cy£50,001 to £250,000Checkbox"]').click();

    cy.get('[data-cy=cyApplyFilter]').click();

    cy.get('[data-cy="cyGrantsFoundMessage"]').should('exist');
    cy.get('[data-cy="cy£50,001 to £250,000Checkbox"]').should('be.checked');
  });
});
