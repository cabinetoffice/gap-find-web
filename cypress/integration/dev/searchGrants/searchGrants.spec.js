/* eslint no-undef: 0 */
import cy_visit from '../../../utils/cyVisit';
import run_accessibility from '../../../utils/run_accessbility';

describe('searchGrants', () => {
  beforeEach(() => {
    cy_visit('/');
    cy.get('[data-cy=cyHomePageSearchInput]')
      .should('have.attr', 'placeholder')
      .should('contains', 'enter a keyword or search term here');
    cy.get('[data-cy=cyHomePageSearchInput]').click();
  });

  it('should search for the inputted search term', () => {
    // Should search correctly using the search bar on the landing page
    cy.get('[data-cy=cyHomePageSearchInput]').type('Chargepoint');
    cy.get('[data-cy=cySearchGrantsBtn]').click();
    cy.get('[data-cy=cyGrantNameAndLink]').should('exist');
    cy.get('[data-cy=cyGrantNameAndLink]').should(
      'contain',
      'Workplace Charging Scheme'
    );
    cy.get('[data-cy=cyGrantNameAndLink]').should('have.length.greaterThan', 0);
    cy.get('[data-cy=cyGrantsFoundMessage]').should('exist');
    cy.get('[data-cy=cySearchAgainInput]').should('have.value', 'Chargepoint');

    // should search for the inputted search term via the eligibility

    cy.get('[data-cy=cySearchAgainInput]').clear();
    cy.get('[data-cy=cySearchAgainInput]')
      .should('have.attr', 'placeholder')
      .should('contains', 'enter a keyword or search term here');
    cy.get('[data-cy=cySearchAgainInput]').type('TestingEligibility');
    cy.get('[data-cy=cySearchAgainButton]').click();
    cy.get('[data-cy=cyGrantNameAndLink]').should('exist');
    cy.get('[data-cy=cyGrantNameAndLink]').should('have.length.greaterThan', 0);
    cy.get('[data-cy=cyGrantsFoundMessage]').should('exist');
    cy.get('[data-cy=cyGrantsFoundMessage]').should('exist');

    // should search for the inputted search term via the summary
    cy.get('[data-cy=cySearchAgainInput]').clear().type('TestingSummary');
    cy.get('[data-cy=cySearchAgainButton]').click();
    cy.get('[data-cy=cyGrantNameAndLink]').should('have.length.greaterThan', 0);

    // should search for grants by short description

    cy.get('[data-cy=cySearchAgainInput]').clear().type('upfront');
    cy.get('[data-cy=cySearchAgainButton]').click();
    cy.get('[data-cy=cySearchAgainInput]').should('have.value', 'upfront');
    cy.get('[data-cy=cyGrantNameAndLink]').should('have.length.greaterThan', 0);
    cy.get(
      '[data-cy=cyGrantShortDescriptions-workplace-charging-scheme]'
    ).should('contain', 'upfront');

    // should search with an empty search input
    cy.get('[data-cy=cySearchAgainInput]').clear();
    cy.get('[data-cy=cySearchAgainButton]').click();
    cy.get('[data-cy=cyGrantNameAndLink]').should('have.length', '10');
    run_accessibility();

    // should return suitable message when search returns no grants'

    cy.get('[data-cy=cySearchAgainInput]').type('concrete');
    cy.get('[data-cy=cySearchAgainButton]').click();
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

  it('should search and maintain the last searched term when the back button is hit', () => {
    cy.get('[data-cy=cyHomePageSearchInput]').type('Solar');
    cy.get('[data-cy=cySearchGrantsBtn]').click();
    cy.get('[data-cy=cyBrowseBackText]').click();
    cy.url().should('eq', Cypress.config().baseUrl + '?searchTerm=Solar');
    cy.get('[data-cy=cyHomePageSearchInput]').click();
    cy.get('[data-cy=cyHomePageSearchInput]').should('have.value', 'Solar');
  });
});
