/* eslint no-undef: 0 */
import cy_visit from '../../utils/cyVisit';
import run_accessibility from '../../utils/run_accessbility';
import accessEmail from '../../utils/accessEmail';
import clickEmailConfirmation from '../../utils/clickEmailConfirmation';
import { userEmail } from '../../constants/constants';

describe('signup to new grants newsletter', () => {
  it('should successfully subscribe and unsubscribe to a newsletter for new grants', () => {
    cy_visit('/');
    run_accessibility();
    cy.get('[data-cy="cySignUpNewsletter"]').click();
    cy.url().should('include', 'newsletter');

    run_accessibility();
    cy.get('[data-cy="cyContinueToNewsletterSignup"]').click();
    cy.url().should('include', 'newsletter/signup');

    run_accessibility();
    cy.get('[data-cy="cyNotificationPrivacyEmail"]').type(userEmail);
    cy.get('[data-cy="cyNotificationPrivacyCheckbox"]').click();
    cy.get('[data-cy="cySubmitSignupDetails"]').click();

    cy.url().should('include', 'newsletter/confirmation');
    cy.get('[data-cy="cySignUpCheckEmailMessage"]').should(
      'contain',
      'Click the link in the email to confirm you want updates about new grants.',
    );
    cy.get('[data-cy="cySignUpCheckSubscribedTo"]').should('not.exist');

    run_accessibility();
    accessEmail();
    clickEmailConfirmation();
    cy.url().should('include', '/notifications/manage-notifications');
    cy.get('[data-cy="cySubscribeSuccessMessageContent"]').should(
      'contain',
      'You have signed up for updates about new grants.',
    );

    //checks updates about new grants
    cy.get('[data-cy="cyViewWeeklyUpdatesButton"]')
      .should('contain', 'View Updates')
      .click();
    cy.url().should('contain', Cypress.config().baseUrl + '/grants');
    cy.get('[data-cy="cySearchDescription"]').should(
      'include.text',
      'Showing grants added between',
    );

    cy_visit('/notifications/manage-notifications');
    cy.get('[data-cy="cyUnsubscribeNewsGrantsLink"]')
      .should('contain', 'Unsubscribe from updates about new grants')
      .click();

    cy.get('[data-cy="cyUnsubscribeConfirmationButton"]').click();

    cy.get('[data-cy="cySubscribeSuccessMessageContent"]').should(
      'contain',
      'You have unsubscribed from updates about new grants.',
    );
    cy.get('[data-cy="cyUnsubscribeNewsGrantsLink"]').should('not.exist');
    run_accessibility();
  });
  it('should support the user if they make signup errors', () => {
    // Nav to the signup page and press continue
    cy_visit('/');
    cy.get('[data-cy="cySignUpNewsletter"]').click();
    cy.get('[data-cy="cyContinueToNewsletterSignup"]').click();
    cy.get('[data-cy="cySubmitSignupDetails"]').click();

    // Check error messages exist
    cy.get('[data-cy="cyError_user_email"]').should('exist');
    cy.get('[data-cy="cyError_user_email"]').should(
      'contain',
      'You must enter an email address',
    );
    cy.get('[data-cy="cyError_notification_privacy"]').should('exist');
    run_accessibility();

    // Check state has been retained
    cy.get('[data-cy="cyNotificationPrivacyCheckbox"]').should(
      'not.be.checked',
    );
    cy.get('[data-cy="cyNotificationPrivacyEmail"]').should('have.value', '');

    // Correct privacy notice error and resubmit
    cy.get('[data-cy="cyError_notification_privacy"]').click();
    cy.focused().should('have.attr', 'name', 'notification_privacy');

    cy.get('[data-cy="cyNotificationPrivacyCheckbox"]').click();
    cy.get('[data-cy="cySubmitSignupDetails"]').click();

    // Checking reroute and state retained
    cy.get('[data-cy="cyNotificationPrivacyCheckbox"]').should('be.checked');
    cy.wait(1500);
    cy.get('[data-cy="cyNotificationPrivacyEmail"]').click();
    cy.get('[data-cy="cyNotificationPrivacyEmail"]').type('chris.palmer');
    cy.get('[data-cy="cySubmitSignupDetails"]').click();

    cy.get('[data-cy="cyNotificationPrivacyCheckbox"]').should('be.checked');
    cy.get('[data-cy="cyNotificationPrivacyEmail"]').should(
      'have.value',
      'chris.palmer',
    );

    cy.get('[data-cy="cyError_user_email"]').should('exist');
    cy.get('[data-cy="cyError_user_email"]').should(
      'contain',
      'Enter an email address in the correct format, like name@example.com',
    );
    cy.get('[data-cy="cyError_user_email"]').click();
    cy.focused().should('have.attr', 'name', 'user_email');
  });

  it('should redirect to the previous page when user cancels signup journey', () => {
    //cancel journey from home
    cy_visit('/');
    cy.get('[data-cy="cySignUpNewsletter"]').click();
    cy.url().should('include', 'newsletter');
    cy.get('[data-cy="cyCancelNewsletterSignup"]').click();
    cy.url().should('eq', Cypress.config().baseUrl + '/?href=%2F&searchTerm=');

    //cancel journey from search grants page
    cy.get('[data-cy=cyHomePageSearchInput]').click();
    cy.get('[data-cy=cySearchGrantsBtn]').click();
    cy.wait(2000);
    cy.get('[data-cy="cySignUpNewsletter"]').click();
    cy.get('[data-cy="cyCancelNewsletterSignup"]').click();
    cy.url().should('contain', Cypress.config().baseUrl + '/grants');
  });
});
