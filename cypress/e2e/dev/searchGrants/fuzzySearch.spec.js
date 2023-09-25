import checkNoGrantsFound from '../../../utils/checkNoGrantsFound';
import cy_visit from '../../../utils/cyVisit';
describe('successfully searches using fuzzy search parameters', () => {
  beforeEach(() => {
    cy_visit('/');
    cy.get('[data-cy=cyHomePageSearchInput]').click();
  });

  it('should use fuzzy search to find results', () => {
    cy.get('[data-cy=cyHomePageSearchInput]').clear().type('treas');
    cy.get('[data-cy=cySearchGrantsBtn]').click();
    cy.get('[data-cy=cyGrantNameAndLink]').should('exist');
    cy.get('[data-cy=cyGrantNameAndLink]').should(
      'contain',
      'Urban Tree Challenge Fund',
    );
    cy.get('[data-cy=cyGrantNameAndLink]').then((elements) => {
      cy.get(elements).should('have.length.greaterThan', 0);
    });
    cy.get('[data-cy=cyGrantsFoundMessage]').should('exist');

    // should allow 2 changes for keywords of lengths larger than 8

    cy.get('[data-cy="cySearchAgainInput"]').clear().type('chagrepoin');
    cy.get('[data-cy=cySearchAgainButton]').click();
    cy.get('[data-cy=cyGrantNameAndLink]').should('exist');
    cy.get('[data-cy=cyGrantNameAndLink]').should(
      'contain',
      'Workplace Charging Scheme',
    );
    cy.get('[data-cy=cyGrantNameAndLink]').then((elements) => {
      cy.get(elements).should('have.length.greaterThan', 0);
    });
    cy.get('[data-cy=cyGrantsFoundMessage]').should('exist');

    // should only allow 1 change for keywords of lengths 3-5

    cy.get('[data-cy=cySearchAgainInput]').clear().type('bfii');
    cy.get('[data-cy=cySearchAgainButton]').click();
    cy.get('[data-cy=cyGrantNameAndLink]').should('exist');
    cy.get('[data-cy=cyGrantNameAndLink]').should(
      'contain',
      'BFI Development Fund',
    );
    cy.get('[data-cy=cyGrantNameAndLink]').then((elements) => {
      cy.get(elements).should('have.length.greaterThan', 0);
    });
    cy.get('[data-cy=cyGrantsFoundMessage]').should('exist');
  });
});

describe('should not find grants if searches do not fit in fuzzy search parameters', () => {
  beforeEach(() => {
    cy_visit('/');
    cy.get('[data-cy=cyHomePageSearchInput]').click();
  });
  it('should not allow changes for keywords outside the fuzzy search', () => {
    cy.get('[data-cy=cyHomePageSearchInput]').clear().type('ot');
    cy.get('[data-cy=cySearchGrantsBtn]').click();
    checkNoGrantsFound();

    // should not allow >1 change for keywords of lengths 3-5'
    cy.get('[data-cy=cySearchAgainInput]').clear().type('bbfii');
    cy.get('[data-cy=cySearchAgainButton]').click();
    checkNoGrantsFound();

    // should not allow >2 changes for keywords of lengths 3-5

    cy.get('[data-cy=cySearchAgainInput]').clear().type('chagrepoi');
    cy.get('[data-cy=cySearchAgainButton]').click();
    checkNoGrantsFound();
  });
});
