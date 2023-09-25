import cy_visit from '../../../utils/cyVisit';
describe('footer', () => {
  beforeEach(() => {
    cy_visit('/');
  });
  it('should go to the privacy page when the privacy link in the footer is linked', () => {
    cy.get('[data-cy="cyPrivacy noticeTitle"]').should('not.exist');
    cy.get('[data-cy="cyPrivacyLinkFooter"]').click();
    cy.url().should('include', '/info/privacy');
    cy.get('[data-cy="cyPrivacy noticeTitle"]').should('exist');
  });

  it('should go to the cookies page when the cookie link in the footer is linked', () => {
    cy.get('[data-cy="cyCookiesTitle"]').should('not.exist');
    cy.get('[data-cy="cyCookieLinkFooter"]').click();
    cy.url().should('include', '/info/cookies');
    cy.get('[data-cy="cyCookiesTitle"]').should('exist');
  });

  it('should go to the accessibility page when the accessibility link in the footer is linked', () => {
    cy.get('[data-cy="cyAccessibilityTitle"]').should('not.exist');
    cy.get('[data-cy="cyAccessibilityLinkFooter"]').click();
    cy.url().should('include', '/info/accessibility');
    cy.get('[data-cy="cyAccessibilityTitle"]').should('exist');
  });

  it('should go to the t&c page when the t&c link in the footer is linked', () => {
    cy.get('[data-cy="cyTerms and conditionsTitle"]').should('not.exist');
    cy.get('[data-cy="cyTCLinkFooter"]').click();
    cy.url().should('include', '/info/terms-and-conditions');
    cy.get('[data-cy="cyTerms and conditionsTitle"]').should('exist');
  });

  it('should go to the About us page when the About us link in the footer is linked', () => {
    cy.get('[data-cy="cyAbout usTitle"]').should('not.exist');
    cy.get('[data-cy="cyAboutUsLinkFooter"]').click();
    cy.url().should('include', '/info/about-us');
    cy.get('[data-cy="cyAbout usTitle"]').should('exist');
  });
});
