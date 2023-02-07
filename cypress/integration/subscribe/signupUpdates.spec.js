/* eslint no-undef: 0 */
import subscribeToGrant from '../../utils/subscribeToGrant';
import clickEmailConfirmation from '../../utils/clickEmailConfirmation';
import accessEmail from '../../utils/accessEmail';
import cleanUpSubscribe from '../../utils/cleanUpSubscribe';
import cy_visit from '../../utils/cyVisit';
import run_accessibility from '../../utils/run_accessbility';
import { userEmail } from '../../constants/constants';

describe('Successfully subscribe to a grant and confirm using the email link', () => {
  it('should be able to sign up to grant updates', () => {
    cleanUpSubscribe();

    subscribeToGrant(userEmail);
    accessEmail();
    clickEmailConfirmation();

    // Assert that the email confirmation has worked and redirected to a page where all subscribed grants are kept.
    cy.get('[ data-cy="cySubscribeSuccessMessageContent"]', {
      timeout: 10000,
    }).should('be.visible');
    cy.get('[ data-cy="cySubscribeSuccessMessageContent"]').contains(
      'You have signed up for updates about "Chargepoint Grant for people renting and living in flats"'
    );

    cy.get(
      '[data-cy="cyChargepoint Grant for people renting and living in flatsUnsubscriptionTableName"]'
    ).should('exist');
  });
});

describe('Receive support when I make errors on the journey', () => {
  it('should be able to give me appropriate warnings if I make errors subscribing to updates', () => {
    // Nav to the signup page and press continue
    cy_visit(
      '/grants/chargepoint-grant-for-people-renting-and-living-in-flats'
    );
    cy.get('[data-cy="cySignupUpdatesLink"]').click();
    cy.get('[data-cy="cySignUpFormPrivacyLink"]')
      .should('have.attr', 'href')
      .and('include', '/info/privacy');
    cy.get('[data-cy="cySubmitSignupDetails"]').click();

    cy.url().should(
      'include',
      'chargepoint-grant-for-people-renting-and-living-in-flats'
    );

    // Check error messages exist
    cy.get('[data-cy="cyError_user_email"]').should('exist');
    cy.get('[data-cy="cyError_user_email"]').should(
      'contain',
      'You must enter an email address'
    );
    cy.get('[data-cy="cyError_notification_privacy"]').should('exist');
    run_accessibility();

    // Check state has been retained
    cy.get('[data-cy="cyNotificationPrivacyCheckbox"]').should(
      'not.be.checked'
    );
    cy.get('[data-cy="cyNotificationPrivacyEmail"]').should('have.value', '');

    // Correct privacy notice error and resubmit
    cy.get('[data-cy="cyError_notification_privacy"]').click();
    cy.focused().should('have.attr', 'name', 'notification_privacy');

    cy.get('[data-cy="cyNotificationPrivacyCheckbox"]').click();
    cy.get('[data-cy="cySubmitSignupDetails"]').click();

    // Checking reroute and state retained
    cy.get('[data-cy="cyNotificationPrivacyCheckbox"]').should('be.checked');
    cy.wait(1000);
    cy.get('[data-cy="cyNotificationPrivacyEmail"]').click();
    cy.get('[data-cy="cyNotificationPrivacyEmail"]').type('chris.palmer');
    cy.get('[data-cy="cySubmitSignupDetails"]').click();

    cy.get('[data-cy="cyNotificationPrivacyCheckbox"]').should('be.checked');
    cy.get('[data-cy="cyNotificationPrivacyEmail"]').should(
      'have.value',
      'chris.palmer'
    );

    cy.get('[data-cy="cyError_user_email"]').should('exist');
    cy.get('[data-cy="cyError_user_email"]').should(
      'contain',
      'Enter an email address in the correct format, like name@example.com'
    );
    cy.get('[data-cy="cyError_user_email"]').click();
    cy.focused().should('have.attr', 'name', 'user_email');
  });
});

describe('Should only assign an email address to a grant once', () => {
  it('should not re-subscribe if verification link is clicked more than once', () => {
    cleanUpSubscribe();
    subscribeToGrant(userEmail);
    accessEmail(true);
    clickEmailConfirmation();
    // Confirm only one grant subscribed too
    cy.get(
      '[data-cy="cyChargepoint Grant for people renting and living in flatsUnsubscriptionTableName"]'
    ).should('exist');
    cy.get(
      '[data-cy="cyChargepoint Grant for people renting and living in flatsUnsubscriptionTableName"]'
    ).should('have.length.greaterThan', 0);

    accessEmail(true);
    clickEmailConfirmation();

    // Confirm only one grant subscribed too
    cy.get(
      '[data-cy="cyChargepoint Grant for people renting and living in flatsUnsubscriptionTableName"]'
    ).should('exist');
    cy.get(
      '[data-cy="cyChargepoint Grant for people renting and living in flatsUnsubscriptionTableName"]'
    ).should('have.length.greaterThan', 0);
  });
});
