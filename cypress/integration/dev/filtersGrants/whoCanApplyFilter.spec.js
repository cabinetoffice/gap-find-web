import cy_visit from '../../../utils/cyVisit';
describe('whoCanApplyFilter', () => {
  beforeEach(() => {
    cy_visit('/');
    cy.get('[data-cy=cyHomePageSearchInput]').click();
  });

  it('should allow single selection on who can apply filter', () => {
    cy.get('[data-cy=cySearchGrantsBtn]').click();
    cy.get('[data-cy="cyPrivate sectorCheckbox"]').click();
    cy.get('[data-cy=cyApplyFilter]').click();

    cy.get('[data-cy="cyGrantsFoundMessage"]').should('exist');
    cy.get('[data-cy=cyGrantNameAndLink]')
      .eq(0)
      .contains('Workplace Charging Scheme');
  });

  it('should allow multi filters on who can apply filter', () => {
    cy.get('[data-cy=cySearchGrantsBtn]').click();
    cy.get('[data-cy="cyPublic sectorCheckbox"]').click();
    cy.get('[data-cy="cyPersonal / individualLabel"]').click();

    cy.get('[data-cy=cyApplyFilter]').click();

    cy.get('[data-cy="cyGrantsFoundMessage"]').should('exist');
    cy.get('[data-cy=cyGrantNameAndLink]')
      .eq(0)
      .contains('Workplace Charging Scheme');
    cy.get('[data-cy=cyGrantNameAndLink]')
      .eq(7)
      .contains('Chargepoint Grant for people renting and living in flats');
  });

  it('should allow chain filter with search filters', () => {
    cy.get('[data-cy=cyHomePageSearchInput]').type('Chargepoint');
    cy.get('[data-cy=cySearchGrantsBtn]').click();
    cy.get('[data-cy=cyGrantNameAndLink]').should('have.length.greaterThan', 0);

    cy.get('[data-cy="cyPrivate sectorCheckbox"]').click();

    cy.get('[data-cy=cyApplyFilter]').click();

    cy.get('[data-cy=cyGrantNameAndLink]').should('have.length.greaterThan', 0);
    cy.get('[data-cy="cyGrantsFoundMessage"]').should('exist');
    cy.get('[data-cy="cyNoGrantFoundMessage"]').should('not.exist');
  });

  it.only('should retain selected filters even when no results found', () => {
    cy.get('[data-cy=cyHomePageSearchInput]').type('UKTP');
    cy.get('[data-cy=cySearchGrantsBtn]').click();

    cy.get('[data-cy="cyPublic sectorCheckbox"]').click();

    cy.get('[data-cy=cyApplyFilter]').click();

    cy.get('[data-cy="cyNoGrantFoundMessage"]').should(
      'contain',
      'No grants found'
    );
    cy.get('[data-cy=cyGrantNameAndLink]').should('not.exist');
    cy.get('[data-cy="cyPublic sectorCheckbox"]').should('be.checked');
  });
});
