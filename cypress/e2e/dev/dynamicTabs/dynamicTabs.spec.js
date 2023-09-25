import cy_visit from '../../../utils/cyVisit';
import { FAQ, AWARDS } from '../../../constants/constants';
import run_accessibility from '../../../utils/run_accessbility';

describe('Hidden Tabs', () => {
  it('should dynamically hide or show both the faqs tabs', () => {
    cy_visit(
      '/grants/chargepoint-grant-for-people-renting-and-living-in-flats',
    );
    run_accessibility();

    if (FAQ === 'false') {
      cy.get('[data-cy=cyTabs_faqs]').should('not.exist');
      cy.get('[data-cy=cyTabsContent_faqs]').should('not.exist');
    } else {
      cy.get('[data-cy=cyTabs_faqs]').should('exist');
      cy.get('[data-cy=cyTabs_faqs]').click();
      cy.get('[data-cy=cyTabsContent_faqs]').should('exist');
    }
  });

  it('should dynamically hide or show both the awarded tabs', () => {
    cy_visit(
      '/grants/chargepoint-grant-for-people-renting-and-living-in-flats',
    );
    if (AWARDS === 'false') {
      cy.get('[data-cy=cyTabs_awarded]').should('not.exist');
      cy.get('[data-cy=cyTabsContent_awarded]').should('not.exist');
    } else {
      cy.get('[data-cy=cyTabs_awarded]').should('exist');
      cy.get('[data-cy=cyTabs_awarded]').click();
      cy.get('[data-cy=cyTabsContent_awarded]').should('exist');
    }
  });
});
