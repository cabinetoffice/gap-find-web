/* eslint no-undef: 0 */
import cy_visit from '../../utils/cyVisit';
import subscribeToGrant from '../../utils/subscribeToGrant';
import clickEmailConfirmation from '../../utils/clickEmailConfirmation';
import { recurse } from 'cypress-recurse';
import run_accessibility from '../../utils/run_accessbility';
import accessEmail from '../../utils/accessEmail';
describe('Allow unsubscription', () => {
  let userEmail;
  before(() => {
    cy.task('getUserEmail').then((email) => {
      userEmail = email;
    });
  });

  it('should unsubscribe a grant when a cookie is present', () => {
    subscribeToGrant(userEmail);
    accessEmail(false);
    clickEmailConfirmation();
    cy_visit('/');

    cy.get('[data-cy="cyManageNotificationsHomeLink"]').click();
    run_accessibility();

    // Check the links takes you to the correct page.
    cy.get('[data-cy="cyManageYourNotificationsHeading"]', {
      timeout: 10000,
    }).should('be.visible');
    cy.url().should('include', '/notifications/manage-notifications');
    cy.get('[data-cy="cyManageYourNotificationsHeading"]').should('exist');
    run_accessibility();
    cy.get(
      '[data-cy="cyChargepoint Grant for people renting and living in flatsUnsubscriptionTableName"]',
    ).should('exist');

    cy.get(
      '[data-cy="cyChargepoint Grant for people renting and living in flatsUnsubscribeLink"]',
    )
      .eq(0)
      .click();
    cy.get('[data-cy="cyUnsubscribeConfirmationGrantsDetail"]').contains(
      'Chargepoint Grant for people renting and living in flats',
    );

    run_accessibility();
    cy.get('[data-cy="cyUnsubscribeConfirmationButton"]').click();

    cy.url().should('include', '/notifications/manage-notifications');
    cy.get('[data-cy="cyManageYourNotificationsHeading"]').should('not.exist');

    cy.get('[data-cy="cySubscribeSuccessMessageContent"]').should('exist');
    cy.get('[data-cy="cySubscribeSuccessMessageContent"]').contains(
      'You have been unsubscribed from "Chargepoint Grant for people renting and living in flats"',
    );
    run_accessibility();
  });

  it('should unsubscribe a grant when a cookie is not present', () => {
    subscribeToGrant(userEmail);
    accessEmail(false);
    clickEmailConfirmation();
    cy_visit('/');
    cy.clearCookies();
    cy.get('[data-cy="cyManageNotificationsHomeLink"]').click();
    run_accessibility();
    cy.get('[data-cy="cyManageNotificationsEmailInput"]').type(userEmail);
    cy.get('[data-cy="cyManageNotificationsSubmitButton"]').click();
    cy.url().should('include', '/notifications/check-email');

    // Put in checks about the page that tells you that you've just submitted
    cy.get('[data-cy="cyCheckUnsubscribeEmailHeading"]').contains(
      'Check your email',
    );
    cy.get('[data-cy="cyUnsubscribeEmail"]').contains(
      `We’ve sent an email to ${userEmail}`,
    );
    run_accessibility();
    //fetch the email
    recurse(
      () => cy.task('getLastEmail', { keepEmails: false }), // Cypress commands to retry
      Cypress._.isObject, // keep retrying until the task returns an object
      {
        timeout: 15000, // retry up to 15 seconds
        delay: 5000, // wait 5 seconds between attempts
      },
    )
      .its('html')
      .then((html) => {
        cy.document({ log: false }).invoke({ log: false }, 'write', html);
      });

    clickEmailConfirmation();

    // Check the links takes you to the correct page.
    cy.get('[data-cy="cyManageYourNotificationsHeading"]', {
      timeout: 10000,
    }).should('be.visible');
    cy.url().should('include', '/notifications/manage-notifications');
    cy.get('[data-cy="cyManageYourNotificationsHeading"]').should('exist');
    run_accessibility();
    cy.get(
      '[data-cy="cyChargepoint Grant for people renting and living in flatsUnsubscriptionTableName"]',
    ).should('exist');

    cy.get(
      '[data-cy="cyChargepoint Grant for people renting and living in flatsUnsubscribeLink"]',
    )
      .eq(0)
      .click();
    cy.get('[data-cy="cyUnsubscribeConfirmationGrantsDetail"]').contains(
      'Chargepoint Grant for people renting and living in flats',
    );

    run_accessibility();
    cy.get('[data-cy="cyUnsubscribeConfirmationButton"]').click();

    cy.url().should('include', '/notifications/manage-notifications');
    cy.get('[data-cy="cyManageYourNotificationsHeading"]').should('not.exist');

    cy.get('[data-cy="cySubscribeSuccessMessageContent"]').should('exist');
    cy.get('[data-cy="cySubscribeSuccessMessageContent"]').contains(
      'You have been unsubscribed from "Chargepoint Grant for people renting and living in flats"',
    );
    run_accessibility();
  });
});

describe('Validate the email input for manage notifications', () => {
  it('should show validation error if you do not enter an email', () => {
    cy_visit('/');
    cy.get('[data-cy="cyManageNotificationsHomeLink"]').click();
    cy.get('[data-cy="cyManageNotificationsSubmitButton"]').click();
    cy.url().should('include', '/notifications/check-email');

    cy.get('[data-cy="cyErrorBanner"]').should('exist');

    cy.get('[data-cy="cyErrorBannerHeading"]').should(
      'contain',
      'There is a problem',
    );
    cy.get(
      '[data-cy="cyManageNotificationsInputValidationErrorDetails"]',
    ).should('exist');
    cy.get(
      '[data-cy="cyManageNotificationsInputValidationErrorDetails"]',
    ).should('contain', 'You must enter an email address.');

    cy.get('[data-cy="cyError_email"]').click();
    cy.focused().should('have.attr', 'name', 'email');
    run_accessibility();
  });

  it('should show validation error if you do not enter a valid email', () => {
    cy_visit('/');
    cy.get('[data-cy="cyManageNotificationsHomeLink"]').click();
    cy.get('[data-cy="cyManageNotificationsEmailInput"]').type('chris.palmer');
    cy.get('[data-cy="cyManageNotificationsSubmitButton"]').click();

    cy.url().should('include', '/notifications/check-email');

    cy.get('[data-cy="cyErrorBanner"]').should('exist');

    cy.get('[data-cy="cyErrorBannerHeading"]').should(
      'contain',
      'There is a problem',
    );
    cy.get(
      '[data-cy="cyManageNotificationsInputValidationErrorDetails"]',
    ).should('exist');
    cy.get(
      '[data-cy="cyManageNotificationsInputValidationErrorDetails"]',
    ).should(
      'contain',
      'Enter an email address in the correct format, like name@example.com',
    );
    cy.get('[data-cy="cyManageNotificationsInputValidationError"]').should(
      'exist',
    );
    cy.get(
      '[data-cy="cyManageNotificationsInputValidationErrorDetails"]',
    ).should(
      'contain',
      'Enter an email address in the correct format, like name@example.com',
    );
    cy.get('[data-cy="cyError_email"]').click();
    cy.focused().should('have.attr', 'name', 'email');
    cy.focused().should('have.attr', 'value', 'chris.palmer');
    run_accessibility();
  });
});
