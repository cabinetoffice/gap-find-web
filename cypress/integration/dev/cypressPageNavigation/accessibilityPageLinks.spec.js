import Cypress, { before } from 'cypress';
import cy_visit from '../../../utils/cyVisit';

describe('Links on the accessibility', () => {
  before(() => {
    cy_visit('/info/accessibility');
  });

  it('should be able to access the About Us page', () => {
    cy.url().should('eq', Cypress.config().baseUrl + '/info/accessibility');
    cy.get('[data-cy=cyAccessibilityTitle').should('exist');
  });

  it('should be able to access the AblityNet page', () => {
    cy.get('[data-cy="cyAccessibilityLink_https://mcmw.abilitynet.org.uk/"]')
      .should('have.attr', 'href')
      .and('eq', 'https://mcmw.abilitynet.org.uk/');
  });

  it('should be able to access the Gov Community Email', () => {
    cy.get(
      '[data-cy="cyAccessibilityLink_mailto:govtgrantscommunity@cabinetoffice.gov.uk"]'
    )
      .invoke('removeAttr', 'target')
      .invoke('attr', 'href')
      .should('eq', 'mailto:govtgrantscommunity@cabinetoffice.gov.uk');
  });

  it('should be able to access the Gov Community Email for Accessibility Issues', () => {
    cy.get(
      '[data-cy="cyAccessibilityLink_mailto:govtgrantscommunity@cabinetoffice.gov.uk"]'
    )
      .invoke('removeAttr', 'target')
      .invoke('attr', 'href')
      .should('eq', 'mailto:govtgrantscommunity@cabinetoffice.gov.uk');
  });

  it('should be able to access the EASS page', () => {
    cy.get(
      '[data-cy="cyAccessibilityLink_https://www.equalityadvisoryservice.com/"]'
    )
      .should('have.attr', 'href')
      .and('eq', 'https://www.equalityadvisoryservice.com/');
  });

  it('should be able to access the WCAG page', () => {
    cy.get('[data-cy="cyAccessibilityLink_https://www.w3.org/TR/WCAG21/"]')
      .should('have.attr', 'href')
      .and('eq', 'https://www.w3.org/TR/WCAG21/');
  });

  it('should be able to access the Gov Ukpage', () => {
    cy.get('[data-cy="cyAccessibilityLink_http://gov.uk/"]')
      .should('have.attr', 'href')
      .and('eq', 'http://gov.uk/');
  });
});
