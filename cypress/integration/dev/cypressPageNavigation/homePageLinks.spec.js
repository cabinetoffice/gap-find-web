/* eslint no-undef: "off"*/
import { APPLY_FOR_A_GRANT_APPLICANT_URL } from '../../../constants/constants';
import cy_visit from '../../../utils/cyVisit';

describe('Links on the homepage', () => {
  beforeEach(() => {
    cy_visit('/');
  });
  it('should be able to access the home page', () => {
    cy.url().should('eq', Cypress.config().baseUrl);
    cy.get('[data-cy=cyHomePageTitle').should('exist');
  });

  it('should have links to the grants via the browse grants text link', () => {
    cy.get('[data-cy=cyBrowseGrantsHomePageTextLink]').click();
    cy.url().should('eq', Cypress.config().baseUrl + 'grants');
  });

  it('should be able to access the feedback form from the home page', () => {
    cy_visit('/');
    cy.get('[data-cy=cyBetaFeedbackLinkHomePage]').should('exist');
    cy.get('[data-cy=cyBetaFeedbackLinkHomePage]').invoke(
      'removeAttr',
      'target'
    );
    cy.get('[data-cy=cyBetaFeedbackLinkHomePage]').click();
    cy.url().should(
      'eq',
      'https://docs.google.com/forms/d/e/1FAIpQLSe6H5atE1WQzf8Fzjti_OehNmTfY0Bv_poMSO-w8BPzkOqr-A/viewform'
    );
  });

  it('Should be able to view and navigate to Apply using the CTA on home page', () => {
    cy_visit('/');
    cy.get('[data-cy="cySignInAndApply-header"]')
      .contains('Sign in and apply')
      .should('have.prop', 'tagName')
      .and('eq', 'H2');

    cy.get('[data-cy="cySignInAndApply-body"]')
      .contains('See your grant applications or start a new one.')
      .should('have.prop', 'tagName')
      .and('eq', 'P');

    cy.get('[data-cy="cySignInAndApply-Link"]')
      .contains('Sign in and apply')
      .should('have.attr', 'href', APPLY_FOR_A_GRANT_APPLICANT_URL)
      .click();

    cy.url().should('eq', APPLY_FOR_A_GRANT_APPLICANT_URL);
  });
});
