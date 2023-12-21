import cy_visit from '../utils/cyVisit';
import run_accessibility from './run_accessbility';

export default function subscribeToGrant(userEmail) {
  // Get to the signup for update page
  cy_visit('/grants/chargepoint-grant-for-people-renting-and-living-in-flats');
  cy.get('[data-cy="cySignupUpdatesLink"]').click();
  run_accessibility();

  // Fill out signup form
  cy.get('[data-cy="cyNotificationPrivacyCheckbox"]').click();
  cy.get('[data-cy="cyNotificationPrivacyEmail"]').type(userEmail);
  cy.get('[data-cy="cySubmitSignupDetails"]').click();

  // Check rerouted to the correct place with the correct details
  cy.url().should('include', 'subscriptions/confirmation');
  cy.get('[data-cy="cySignUpCheckEmail"]').should('contain', userEmail);
  cy.get('[data-cy="cySignUpCheckSubscribedTo"]').should(
    'contain',
    'Chargepoint Grant for people renting and living in flats',
  );

  // Back to browse all grants
  cy.get('[data-cy="cyRelatedContentLinkFor_/grants"]').click();
  cy.url().should('include', '/grants');
}
