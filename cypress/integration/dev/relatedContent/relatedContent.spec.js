import cy_visit from '../../../utils/cyVisit';
describe('Related Content', () => {
  it('should go to the T&C page when the related content link is clicked', () => {
    cy_visit('/info/about-us');
    cy.get('[data-cy="cyTerms and conditionsTitle"]').should('not.exist');
    cy.get(
      '[data-cy="cyRelatedContentLinkFor_/info/terms-and-conditions"]'
    ).click();
    cy.url().should('include', '/info/terms-and-conditions');
    cy.get('[data-cy="cyTerms and conditionsTitle"]').should('exist');
  });

  it('should go to the privacy page when the related content link is clicked', () => {
    cy_visit('/info/about-us');
    cy.get('[data-cy="cyPrivacy noticeTitle"]').should('not.exist');
    cy.get('[data-cy="cyRelatedContentLinkFor_/info/privacy"]').click();
    cy.url().should('include', '/info/privacy');
    cy.get('[data-cy="cyPrivacy noticeTitle"]').should('exist');
  });

  it('should go to the about us when the related content link is clicked', () => {
    cy_visit('/info/privacy');
    cy.get('[data-cy="cyAbout usTitle"]').should('not.exist');
    cy.get('[data-cy="cyRelatedContentLinkFor_/info/about-us"]').click();
    cy.url().should('include', '/info/about-us');
    cy.get('[data-cy="cyAbout usTitle"]').should('exist');
  });

  it('should go to the grants page when the related content link is clicked', () => {
    cy_visit('/notifications/check-email');
    cy.get('[data-cy="cyGrantsPageTitle"]').should('not.exist');
    cy.get('[data-cy="cyRelatedContentLinkFor_/grants"]').click();
    cy.url().should('include', '/grants');
    cy.get('[data-cy="cyGrantsPageTitle"]').should('exist');
  });
});
