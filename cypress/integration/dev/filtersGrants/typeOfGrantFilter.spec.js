import cy_visit from '../../../utils/cyVisit';
describe('typeOfGrantFilter', () => {
  beforeEach(() => {
    cy_visit('/');
    cy.get('[data-cy=cyHomePageSearchInput]').click();
  });

  it('should allow single selection on type of grant filter', () => {
    cy.get('[data-cy=cySearchGrantsBtn]').click();
    cy.get('[data-cy="cyCompeted grantCheckbox"]').click();
    cy.get('[data-cy=cyApplyFilter]').click();

    cy.get('[data-cy="cyGrantsFoundMessage"]').should('exist');
    cy.get('[data-cy=cyGrantNameAndLink]')
      .eq(0)
      .contains('BFI Development Fund');
  });

  it('should allow multi filters on type of grant filter', () => {
    cy.get('[data-cy=cySearchGrantsBtn]').click();
    cy.get('[data-cy="cyCompeted grantCheckbox"]').click();
    cy.get('[data-cy="cyEmergency grantCheckbox"]').click();

    cy.get('[data-cy=cyApplyFilter]').click();

    cy.get('[data-cy="cyGrantsFoundMessage"]').should('contain', 'We’ve found');
    cy.get('[data-cy=cyGrantNameAndLink]').should('have.length', '10');
    cy.get('[data-cy="cyNoGrantFoundMessage"]').should('not.exist');
  });

  it('should allow chain filter who can apply with search filters', () => {
    cy.get('[data-cy=cyHomePageSearchInput]').type('chargepoint');
    cy.get('[data-cy=cySearchGrantsBtn]').click();
    cy.get('[data-cy=cyGrantNameAndLink]').should('have.length.greaterThan', 0);

    cy.get('[data-cy="cyEmergency grantCheckbox"]').click();

    cy.get('[data-cy=cyApplyFilter]').click();

    cy.get('[data-cy=cyGrantNameAndLink]').should('have.length.greaterThan', 0);
    cy.get('[data-cy="cyGrantsFoundMessage"]').should('exist');
  });

  it('should retain selected who can apply filters even when no results found', () => {
    cy.get('[data-cy=cySearchGrantsBtn]').click();
    cy.get('[data-cy=cyGrantNameAndLink]').should('have.length', '10');

    cy.get('[data-cy="cyCovid grantCheckbox"]').click();
    cy.get('[data-cy="cyPersonal / individualCheckbox"]').click();

    cy.get('[data-cy=cyApplyFilter]').click();

    cy.get('[data-cy="cyGrantsFoundMessage"]').should(
      'contain',
      'We’ve found 0 grants'
    );
    cy.get('[data-cy="cyNoGrantFoundMessage"]').should(
      'contain',
      'No grants found'
    );
    cy.get('[data-cy=cyGrantNameAndLink]').should('not.exist');
    cy.get('[data-cy="cyCovid grantCheckbox"]').should('be.checked');
    cy.get('[data-cy="cyPersonal / individualCheckbox"]').should('be.checked');
  });
});
