/* eslint no-undef: 0 */
import cy_visit from '../../../utils/cyVisit';

describe('Header', () => {
  it('should be able to access the home page on the desktop menu', () => {
    cy_visit('/grants');
    cy.get('[data-cy=cyhomePageLink]').click();
    cy.get('[data-cy=cyHomePageTitle]').should('exist');
    cy.url().should('eq', Cypress.config().baseUrl);
  });

  it('should be able to access the home page on the mobile menu', () => {
    cy_visit('/grants');
    cy.viewport('ipad-2');
    cy.get('[data-cy=cyMobileMenuBtn]').click();
    cy.get('[data-cy=cyhomePageMobileLink]').click();
    cy.get('[data-cy=cyHomePageTitle]').should('exist');
    cy.url().should('eq', Cypress.config().baseUrl);
  });

  it('should be able to access the grants page on the desktop menu', () => {
    cy_visit('/');
    cy.get('[data-cy=cybrowseGrantsPageLink]').click();
    cy.get('[data-cy=cyGrantsPageTitle]').should('exist');
    cy.url().should('eq', Cypress.config().baseUrl + 'grants');
  });

  it('should be able to access the grants page on the mobile menu', () => {
    cy_visit('/');
    cy.viewport('ipad-2');
    cy.get('[data-cy=cyMobileMenuBtn]').click();
    cy.get('[data-cy=cybrowseGrantsPageMobileLink]').click();
    cy.get('[data-cy=cyGrantsPageTitle]').should('exist');
    cy.url().should('eq', Cypress.config().baseUrl + 'grants');
  });

  it('should be able to access the about find a grant page on the desktop menu', () => {
    cy_visit('/');
    cy.get('[data-cy=cyaboutGrantsPageLink]').click();
    cy.get('[data-cy="cyAbout usTitle"]').should('exist');
    cy.url().should('eq', Cypress.config().baseUrl + 'info/about-us');
  });

  it('should be able to access the about find a grant page on the mobile menu', () => {
    cy_visit('/');
    cy.viewport('ipad-2');
    cy.get('[data-cy=cyMobileMenuBtn]').click();
    cy.get('[data-cy=cyaboutGrantsPageMobileLink]').click();
    cy.get('[data-cy="cyAbout usTitle"]').should('exist');
    cy.url().should('eq', Cypress.config().baseUrl + 'info/about-us');
  });

  it('should be able to access the feedback form from the header', () => {
    cy_visit('/');
    cy.get('[data-cy=cyBetaFeedbackLinkBanner]').should('exist');
    cy.get('[data-cy=cyBetaFeedbackLinkBanner]').invoke('removeAttr', 'target');
    cy.get('[data-cy=cyBetaFeedbackLinkBanner]').click();
    cy.url().should(
      'eq',
      'https://docs.google.com/forms/d/e/1FAIpQLSe6H5atE1WQzf8Fzjti_OehNmTfY0Bv_poMSO-w8BPzkOqr-A/viewform'
    );
  });

  it('should be able to access the Gov.uk homepage form from the header', () => {
    cy_visit('/');
    cy.get('[data-cy=cyGovLogoLink]').should('exist');
    cy.get('[data-cy=cyGovLogoLink]').click();
    cy.url().should('eq', 'https://www.gov.uk/');
  });
});

describe('Back button', () => {
  it('should keep the user in the app when the back button is pressed', () => {
    cy_visit('/grants');
    cy.get('[data-cy=cyBrowseBackText]').click();
    cy.url().should('eq', Cypress.config().baseUrl + '?searchTerm=');
  });
});
