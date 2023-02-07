import accessEmail from './accessEmail';
import clickEmailConfirmation from './clickEmailConfirmation';
import cy_visit from './cyVisit';
import { userEmail } from '../constants/constants';

export default function cleanUpSubscribe() {
  cy_visit('/');
  cy.get('[data-cy="cyManageNotificationsHomeLink"]').click();
  cy.get('[data-cy="cyManageNotificationsEmailInput"]').type(userEmail);
  cy.get('[data-cy="cyManageNotificationsSubmitButton"]').click();

  accessEmail(false);
  clickEmailConfirmation();

  cy.get('body').then(($body) => {
    if (
      $body.find(
        '[data-cy="cyChargepoint Grant for people renting and living in flatsUnsubscribeLink"]'
      ).length
    ) {
      cy.get(
        '[data-cy="cyChargepoint Grant for people renting and living in flatsUnsubscribeLink"]'
      )
        .eq(0)
        .click();

      cy.get('[data-cy="cyUnsubscribeConfirmationButton"]').click();

      cy.get(
        '[data-cy="cyChargepoint Grant for people renting and living in flatsUnsubscribeLink"]'
      ).should('not.exist');
      console.log('Clean up successful');
    }

    console.log('Clean up not needed');
  });
}
