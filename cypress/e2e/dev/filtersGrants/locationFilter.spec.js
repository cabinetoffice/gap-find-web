import cy_visit from '../../../utils/cyVisit';
describe('Location Filter', () => {
  beforeEach(() => {
    cy_visit('/');
    cy.get('[data-cy=cyHomePageSearchInput]').click();
  });

  it('should return eligible when filtered by National location', () => {
    cy.get('[data-cy=cySearchGrantsBtn]').click();
    cy.get('[data-cy="cyNationalCheckbox"]').click();
    cy.get('[data-cy=cyApplyFilter]').click();

    cy.get('[data-cy="cyGrantsFoundMessage"]').should('exist');
    cy.get('[data-cy=cyGrantNameAndLink]')
      .eq(0)
      .contains('BFI Development Fund');
  });

  it('should allow multi filters on location', () => {
    cy.get('[data-cy=cySearchGrantsBtn]').click();
    cy.get('[data-cy="cyScotlandCheckbox"]').click();
    cy.get('[data-cy="cyEnglandCheckbox"]').click();

    cy.get('[data-cy=cyApplyFilter]').click();

    cy.get('[data-cy="cyGrantsFoundMessage"]').should('exist');
    cy.get('[data-cy=cyGrantNameAndLink]')
      .eq(0)
      .contains('Workplace Charging Scheme');
  });

  it('should allow chain filter with search filters', () => {
    cy.get('[data-cy=cyHomePageSearchInput]').type('Chargepoint');
    cy.get('[data-cy=cySearchGrantsBtn]').click();
    cy.get('[data-cy=cyGrantNameAndLink]').should('have.length.greaterThan', 0);

    cy.get('[data-cy="cyEnglandCheckbox"]').click();

    cy.get('[data-cy=cyApplyFilter]').click();

    cy.get('[data-cy=cyGrantNameAndLink]').should('have.length', '1');
    cy.get('[data-cy="cyGrantsFoundMessage"]').should('exist');
    cy.get('[data-cy="cyEnglandCheckbox"]').should('be.checked');
    cy.get('[data-cy="cyNoGrantFoundMessage"]').should('not.exist');
  });

  it('should retain selected filters even when no results found', () => {
    cy.get('[data-cy=cySearchGrantsBtn]').click();
    cy.get('[data-cy=cyGrantNameAndLink]').should('have.length.greaterThan', 0);

    cy.get('[data-cy="cyNorthern IrelandCheckbox"]').click();
    cy.get('[data-cy="cy£0 to £10,000Checkbox"]').click();

    cy.get('[data-cy=cyApplyFilter]').click();

    cy.get('[data-cy="cyGrantsFoundMessage"]').should(
      'contain',
      'We’ve found 0 grants',
    );
    cy.get('[data-cy="cyNoGrantFoundMessage"]').should(
      'contain',
      'No grants found',
    );
    cy.get('[data-cy=cyGrantNameAndLink]').should('not.exist');
    cy.get('[data-cy="cyNorthern IrelandCheckbox"]').should('be.checked');
  });
});
