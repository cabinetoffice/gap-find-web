/* eslint no-undef: 0 */
import cy_visit from '../../utils/cyVisit';
import run_accessibility from '../../utils/run_accessbility';
// import checkSaveSearchData from '../../utils/checkSaveSearchData';
// import deleteSavedSearches from '../../utils/deleteSavedSearches';
import accessEmail from '../../utils/accessEmail';
import clickEmailConfirmation from '../../utils/clickEmailConfirmation';
// import insertSavedSearch from '../../utils/insertSavedSearch';
import { userEmail } from '../../constants/constants';

describe('saveSearch', () => {
  let userEmailFromAuth;
  before(() => {
    cy.task('getUserEmail').then((email) => {
      userEmailFromAuth = email;
    });
    cy_visit('/');
  });

  afterEach(() => {
    // deleteSavedSearches();
  });

  it.skip('should view the manage notifications page (no notifications)', () => {
    cy.get('[data-cy="cyManageNotificationsHomeLink"]').click();

    cy.url().should('include', 'check-email');
    run_accessibility();

    cy.get('[data-cy="cyManageNotificationsEmailInput"]').type(userEmail);
    cy.get('[data-cy="cyManageNotificationsSubmitButton"]').click();

    accessEmail();
    clickEmailConfirmation();

    cy.get('[data-cy="cyManageYourNotificationsHeading"]', {
      timeout: 10000,
    }).should('be.visible');
    cy.url().should('include', '/notifications/manage-notifications');
    cy.get('[data-cy="cyManageYourNotificationsHeading"]').should('exist');

    cy.get('[data-cy="cyManageYourNotificationsNoData"]').should(
      'have.text',
      `You are not signed up for any notifications, and you don't have any saved searches.`,
    );

    cy.get('[data-cy="cySearchForGrantsLink"]').click();
    cy.url().should('include', 'grants');
  });

  it.skip('should save a search term and filters with the name', () => {
    cy_visit('/');
    cy.get('[data-cy=cyHomePageSearchInput]')
      .should('have.attr', 'placeholder')
      .should('contains', 'enter a keyword or search term here');
    cy.get('[data-cy=cyHomePageSearchInput]').click();

    run_accessibility();

    cy.get('[data-cy=cyHomePageSearchInput]').type('Chargepoint');
    cy.get('[data-cy=cySearchGrantsBtn]').click();
    cy.get('[data-cy=cyGrantNameAndLink]').should('exist');
    cy.get('[data-cy=cyGrantNameAndLink]').should(
      'contain',
      'Workplace Charging Scheme',
    );
    cy.get('[data-cy=cyGrantNameAndLink]').should('have.length.greaterThan', 0);
    cy.get('[data-cy=cyGrantsFoundMessage]').should('exist');

    cy.get('[data-cy="cyNon profitCheckbox"]').click();
    cy.get('[data-cy=cyApplyFilter]').click();
    cy.get('[data-cy=cyGrantNameAndLink]').should('have.length.greaterThan', 0);
    cy.get('[data-cy=cyGrantsFoundMessage]').should('exist');
    cy.get('[data-cy=cyGrantsFoundMessage]').should('exist');
    cy.wait(2000);
    cy.get('[data-cy="cySaveSearchLink"]').click();

    run_accessibility();

    cy.get('[data-cy=cySaveSearchHeader]').should(
      'have.text',
      'Save your search',
    );
    cy.get('[data-cy=cySaveSearchFilters]').should(
      'have.text',
      'The filters you have chosen include:',
    );
    cy.get('[data-cy="cyFilterKeyWho can apply"]').should(
      'have.text',
      'Who can apply',
    );
    cy.get('[data-cy="cyFilterValueNon profit"]').should(
      'have.text',
      'Non profit',
    );
    cy.get('[data-cy=cyNameThisSearchLabel]').should(
      'have.text',
      'Name this search',
    );
    cy.get('[data-cy=cyNameThisSearchDescription]').should(
      'have.text',
      'You can save more than one search. Add a name so it is easier to tell your searches apart.',
    );
    cy.get('[data-cy=cyNameThisSearchInput]').type('Cypress Notification Yes');
    cy.get('[data-cy=cySaveAndContinueButton]').click();

    cy.wait(2000);
    run_accessibility();

    cy.get('[ data-cy="cy-save-search-consent-header"]').should(
      'have.text',
      'Sign up for email updates',
    );

    cy.get('[data-cy="cy-save-search-notifications-description"]').should(
      'have.text',
      "Select 'Yes' if you want to be updated when grants that match your saved search are added.",
    );

    cy.get('[data-cy="cySubmitNotificationsChoice"]').click();

    cy.url().should('include', 'save-search/notifications');

    cy.get('[data-cy="cyErrorBanner"]').should('exist');
    cy.get('[data-cy="cyManageNotificationsInputValidationErrorDetails"]')
      .should('exist')
      .should('have.text', "Select 'Yes' or 'No'");
    cy.get('[data-cy="cy-error-wrapper"]').should(
      'have.class',
      'govuk-form-group--error',
    );
    cy.get('[data-cy="cyError_consent-radio"]')
      .should('have.text', "Select 'Yes' or 'No'")
      .should('have.attr', 'href', '#consent-radio');

    run_accessibility();
    cy.get('[data-cy="cy-radio-yes"]').click();

    cy.get('[data-cy="cySubmitNotificationsChoice"]').click();

    cy.get('[data-cy=cyEmailAddressHeader]').should(
      'have.text',
      'Enter your email address',
    );
    cy.get('[data-cy=cyEmailAddressLabel]').should(
      'have.text',
      'To save your search, enter your email address below.',
    );
    cy.get('[data-cy=cyNotificationPrivacyCheckbox]').click();
    cy.get('[data-cy=cyEmailAddressInput]').type(userEmail);
    cy.get('[data-cy=cySaveAndContinueButton]').click();

    cy.wait(2000);
    run_accessibility();

    cy.get('[data-cy="cyCheckEmailHeading"]').contains('Check your email');
    cy.get('[data-cy="cyCheckEmailValue"]').contains(userEmailFromAuth);

    // Connect to the database and check that the values are correct.

    checkSaveSearchData('Cypress Notification Yes', true);

    accessEmail();
    clickEmailConfirmation();

    cy.get('[data-cy="cyManageYourNotificationsHeading"]', {
      timeout: 10000,
    }).should('be.visible');
    cy.url().should('include', '/notifications/manage-notifications');
    cy.get('[data-cy="cyManageYourNotificationsHeading"]').should('exist');

    cy.get('[data-cy="cyCypress Notification YesSavedSearchTableName"]')
      .should('exist')
      .click();

    cy.get('[data-cy=cyGrantsFoundMessage]').should('exist');
    cy.get('[data-cy="cyNon profitCheckbox"]').should('be.checked');
  });

  it.skip('should work correctly if the back buttons are used but the notifications are kept the same', () => {
    cy.visit('/');
    run_accessibility();
    cy.get('[data-cy=cyHomePageSearchInput]').type('Chargepoint');
    cy.get('[data-cy=cySearchGrantsBtn]').click();
    cy.get('[data-cy=cyGrantNameAndLink]').should('exist');
    cy.get('[data-cy=cyGrantNameAndLink]').should(
      'contain',
      'Workplace Charging Scheme',
    );

    cy.get('[data-cy=cyGrantsFoundMessage]').should('exist');

    cy.get('[data-cy="cyNon profitCheckbox"]').click();
    cy.get('[data-cy=cyApplyFilter]').click();
    cy.get('[data-cy=cyGrantsFoundMessage]').should('exist');
    cy.wait(2000);
    cy.get('[data-cy="cySaveSearchLink"]').click();

    run_accessibility();

    cy.get('[data-cy=cySaveSearchHeader]').should(
      'have.text',
      'Save your search',
    );
    cy.get('[data-cy=cySaveSearchFilters]').should(
      'have.text',
      'The filters you have chosen include:',
    );
    cy.get('[data-cy="cyFilterKeyWho can apply"]').should(
      'have.text',
      'Who can apply',
    );
    cy.get('[data-cy="cyFilterValueNon profit"]').should(
      'have.text',
      'Non profit',
    );
    cy.get('[data-cy=cyNameThisSearchLabel]').should(
      'have.text',
      'Name this search',
    );
    cy.get('[data-cy=cyNameThisSearchDescription]').should(
      'have.text',
      'You can save more than one search. Add a name so it is easier to tell your searches apart.',
    );
    cy.get('[data-cy=cyNameThisSearchInput]').type(
      'Cypress Notification Yes - back used',
    );
    cy.get('[data-cy=cySaveAndContinueButton]').click();

    cy.wait(2000);
    run_accessibility();

    cy.get('[ data-cy="cy-save-search-consent-header"]').should(
      'have.text',
      'Sign up for email updates',
    );

    cy.get('[data-cy="cy-save-search-notifications-description"]').should(
      'have.text',
      "Select 'Yes' if you want to be updated when grants that match your saved search are added.",
    );

    cy.get('[data-cy="cySubmitNotificationsChoice"]').click();

    cy.url().should('include', 'save-search/notifications');

    cy.get('[data-cy="cyErrorBanner"]').should('exist');
    cy.get('[data-cy="cyManageNotificationsInputValidationErrorDetails"]')
      .should('exist')
      .should('have.text', "Select 'Yes' or 'No'");
    cy.get('[data-cy="cy-error-wrapper"]').should(
      'have.class',
      'govuk-form-group--error',
    );
    cy.get('[data-cy="cyError_consent-radio"]')
      .should('have.text', "Select 'Yes' or 'No'")
      .should('have.attr', 'href', '#consent-radio');

    run_accessibility();
    cy.get('[data-cy="cy-radio-yes"]').click();

    cy.get('[data-cy="cySubmitNotificationsChoice"]').click();

    cy.get('[data-cy="cy-back-link"]').click();
    cy.get('[data-cy="cy-radio-yes"]').click();
    cy.get('[data-cy="cySubmitNotificationsChoice"]').click();
    //

    cy.get('[data-cy=cyEmailAddressHeader]').should(
      'have.text',
      'Enter your email address',
    );
    cy.get('[data-cy=cyEmailAddressLabel]').should(
      'have.text',
      'To save your search, enter your email address below.',
    );
    cy.get('[data-cy=cyNotificationPrivacyCheckbox]').click();
    cy.get('[data-cy=cyEmailAddressInput]').type(userEmail);
    cy.get('[data-cy=cySaveAndContinueButton]').click();

    cy.wait(2000);
    run_accessibility();

    cy.get('[data-cy="cyCheckEmailHeading"]').contains('Check your email');
    cy.get('[data-cy="cyCheckEmailValue"]').contains(userEmailFromAuth);

    // Connect to the database and check that the values are correct.

    checkSaveSearchData('Cypress Notification Yes - back used', true);

    accessEmail();
    clickEmailConfirmation();

    cy.get('[data-cy="cyManageYourNotificationsHeading"]', {
      timeout: 10000,
    }).should('be.visible');
    cy.url().should('include', '/notifications/manage-notifications');
    cy.get('[data-cy="cyManageYourNotificationsHeading"]').should('exist');
  });

  it.skip('should work correctly if the back buttons are used but the notifications are changed', () => {
    cy.visit('/');
    run_accessibility();
    cy.get('[data-cy=cyHomePageSearchInput]').type('Chargepoint');
    cy.get('[data-cy=cySearchGrantsBtn]').click();
    cy.get('[data-cy=cyGrantNameAndLink]').should('exist');
    cy.get('[data-cy=cyGrantNameAndLink]').should(
      'contain',
      'Workplace Charging Scheme',
    );
    cy.get('[data-cy=cyGrantNameAndLink]').should('have.length.greaterThan', 0);
    cy.get('[data-cy=cyGrantsFoundMessage]').should('exist');

    cy.get('[data-cy="cyNon profitCheckbox"]').click();
    cy.get('[data-cy=cyApplyFilter]').click();
    cy.get('[data-cy=cyGrantNameAndLink]').should('have.length.greaterThan', 0);
    cy.get('[data-cy=cyGrantsFoundMessage]').should('exist');
    cy.get('[data-cy=cyGrantsFoundMessage]').should('exist');
    cy.wait(2000);
    cy.get('[data-cy="cySaveSearchLink"]').click();

    run_accessibility();

    cy.get('[data-cy=cySaveSearchHeader]').should(
      'have.text',
      'Save your search',
    );
    cy.get('[data-cy=cySaveSearchFilters]').should(
      'have.text',
      'The filters you have chosen include:',
    );
    cy.get('[data-cy="cyFilterKeyWho can apply"]').should(
      'have.text',
      'Who can apply',
    );
    cy.get('[data-cy="cyFilterValueNon profit"]').should(
      'have.text',
      'Non profit',
    );
    cy.get('[data-cy=cyNameThisSearchLabel]').should(
      'have.text',
      'Name this search',
    );
    cy.get('[data-cy=cyNameThisSearchDescription]').should(
      'have.text',
      'You can save more than one search. Add a name so it is easier to tell your searches apart.',
    );
    cy.get('[data-cy=cyNameThisSearchInput]').type(
      'Cypress Notification No - back used',
    );
    cy.get('[data-cy=cySaveAndContinueButton]').click();

    cy.wait(2000);
    run_accessibility();

    cy.get('[ data-cy="cy-save-search-consent-header"]').should(
      'have.text',
      'Sign up for email updates',
    );

    cy.get('[data-cy="cy-save-search-notifications-description"]').should(
      'have.text',
      "Select 'Yes' if you want to be updated when grants that match your saved search are added.",
    );

    cy.get('[data-cy="cySubmitNotificationsChoice"]').click();

    cy.url().should('include', 'save-search/notifications');

    cy.get('[data-cy="cyErrorBanner"]').should('exist');
    cy.get('[data-cy="cyManageNotificationsInputValidationErrorDetails"]')
      .should('exist')
      .should('have.text', "Select 'Yes' or 'No'");
    cy.get('[data-cy="cy-error-wrapper"]').should(
      'have.class',
      'govuk-form-group--error',
    );
    cy.get('[data-cy="cyError_consent-radio"]')
      .should('have.text', "Select 'Yes' or 'No'")
      .should('have.attr', 'href', '#consent-radio');

    run_accessibility();
    cy.get('[data-cy="cy-radio-yes"]').click();

    cy.get('[data-cy="cySubmitNotificationsChoice"]').click();

    cy.get('[data-cy="cy-back-link"]').click();
    cy.get('[data-cy="cy-radio-no"]').click();
    cy.get('[data-cy="cySubmitNotificationsChoice"]').click();
    //

    cy.get('[data-cy=cyEmailAddressHeader]').should(
      'have.text',
      'Enter your email address',
    );
    cy.get('[data-cy=cyEmailAddressLabel]').should(
      'have.text',
      'To save your search, enter your email address below.',
    );
    cy.get('[data-cy=cyNotificationPrivacyCheckbox]').click();
    cy.get('[data-cy=cyEmailAddressInput]').type(userEmail);
    cy.get('[data-cy=cySaveAndContinueButton]').click();

    cy.wait(2000);
    run_accessibility();

    cy.get('[data-cy="cyCheckEmailHeading"]').contains('Check your email');
    cy.get('[data-cy="cyCheckEmailValue"]').contains(userEmailFromAuth);

    // Connect to the database and check that the values are correct.

    checkSaveSearchData('Cypress Notification No - back used', false);

    accessEmail();
    clickEmailConfirmation();

    cy.get('[data-cy="cyManageYourNotificationsHeading"]', {
      timeout: 10000,
    }).should('be.visible');
    cy.url().should('include', '/notifications/manage-notifications');
    cy.get('[data-cy="cyManageYourNotificationsHeading"]').should('exist');
  });

  it.skip('should save a search term and filters - without notifications', () => {
    cy.visit('/');
    run_accessibility();
    cy.get('[data-cy=cyHomePageSearchInput]').type('Chargepoint');
    cy.get('[data-cy=cySearchGrantsBtn]').click();

    cy.get('[data-cy="cyNon profitCheckbox"]').click();
    cy.get('[data-cy=cyApplyFilter]').click();

    cy.wait(2000);
    cy.get('[data-cy="cySaveSearchLink"]').click();

    run_accessibility();

    cy.get('[data-cy=cyNameThisSearchInput]').type('Cypress Notification No');
    cy.get('[data-cy=cySaveAndContinueButton]').click();

    cy.wait(2000);
    run_accessibility();

    cy.get('[data-cy="cy-radio-no"]').click();

    cy.get('[data-cy="cySubmitNotificationsChoice"]').click();

    cy.get('[data-cy=cyEmailAddressHeader]').should(
      'have.text',
      'Enter your email address',
    );
    cy.get('[data-cy=cyEmailAddressLabel]').should(
      'have.text',
      'To save your search, enter your email address below.',
    );
    cy.get('[data-cy=cyNotificationPrivacyCheckbox]').click();
    cy.get('[data-cy=cyEmailAddressInput]').type(userEmail);
    cy.get('[data-cy=cySaveAndContinueButton]').click();

    cy.wait(2000);
    run_accessibility();

    cy.get('[data-cy="cyCheckEmailHeading"]').contains('Check your email');
    cy.get('[data-cy="cyCheckEmailValue"]').contains(userEmailFromAuth);

    checkSaveSearchData('Cypress Notification No', false);
  });

  it.skip('should delete a saved search if user has authenticated their email address', () => {
    cy.visit('/');
    run_accessibility();
    cy.get('[data-cy=cyHomePageSearchInput]').type('Chargepoint');
    cy.get('[data-cy=cySearchGrantsBtn]').click();

    cy.get('[data-cy="cyNon profitCheckbox"]').click();
    cy.get('[data-cy=cyApplyFilter]').click();

    cy.wait(2000);
    cy.get('[data-cy="cySaveSearchLink"]').click();

    run_accessibility();

    cy.get('[data-cy=cyNameThisSearchInput]').type('Delete Search');
    cy.get('[data-cy=cySaveAndContinueButton]').click();

    cy.wait(2000);
    run_accessibility();

    cy.get('[data-cy="cy-radio-no"]').click();

    cy.get('[data-cy="cySubmitNotificationsChoice"]').click();

    cy.get('[data-cy=cyEmailAddressHeader]').should(
      'have.text',
      'Enter your email address',
    );
    cy.get('[data-cy=cyEmailAddressLabel]').should(
      'have.text',
      'To save your search, enter your email address below.',
    );
    cy.get('[data-cy=cyNotificationPrivacyCheckbox]').click();
    cy.get('[data-cy=cyEmailAddressInput]').type(userEmail);
    cy.get('[data-cy=cySaveAndContinueButton]').click();

    cy.wait(2000);
    run_accessibility();

    cy.get('[data-cy="cyCheckEmailHeading"]').contains('Check your email');
    cy.get('[data-cy="cyCheckEmailValue"]').contains(userEmailFromAuth);

    checkSaveSearchData('Delete Search', false);

    accessEmail();
    clickEmailConfirmation();

    cy.get('[data-cy="cyManageYourNotificationsHeading"]', {
      timeout: 10000,
    }).should('be.visible');
    cy.url().should('include', '/notifications/manage-notifications');
    cy.get('[data-cy="cyManageYourNotificationsHeading"]').should('exist');

    cy.get('[data-cy="cyDelete SearchSavedSearchTableName"]').should('exist');

    cy.get('[data-cy="cyDelete SearchDeleteLink"]').click();

    cy.wait(2000);
    run_accessibility();

    cy.get('[data-cy="cyConfirmSavedSearchDelete"]').should('exist');

    cy.get('[data-cy="cyCancelUnsubscribe"]').click();

    cy.get('[data-cy="cyDelete SearchSavedSearchTableName"]').should('exist');

    cy.get('[data-cy="cyDelete SearchDeleteLink"]').click();

    cy.get('[data-cy="cyDeleteConfirmationButton"]').click();

    cy.wait(2000);
    run_accessibility();

    cy.get('[data-cy="cySubscribeSuccessMessageContent"]').should(
      'have.text',
      'You have deleted the saved search called:  Delete Search',
    );

    cy.get('[data-cy="cyManageYourNotificationsNoData"]').should('exist');
  });

  it.skip('should redirect you if you try to delete but are not logged in', () => {
    insertSavedSearch();
    cy.wait(1000);
    cy.visit('notifications/delete-saved-search/999');
    cy.url().should('include', 'notifications/check-email');
    cy.get('[data-cy="cyUnsubscribeTitle"]').should(
      'have.text',
      'Manage notifications and saved searches',
    );
  });

  it.skip('should not delete a search that a user does not have access to', () => {
    insertSavedSearch();
    cy.wait(1000);
    cy.visit('/');
    cy.get('[data-cy="cyManageNotificationsHomeLink"]').click();
    cy.get('[data-cy="cyManageNotificationsEmailInput"]').type(userEmail);
    cy.get('[data-cy="cyManageNotificationsSubmitButton"]').click();

    accessEmail();
    clickEmailConfirmation();
    cy.visit('/notifications/delete-saved-search/999');

    cy.get('[data-cy="cyDeleteConfirmationButton"]').click();

    cy.get('[data-cy="cyErrorMessage"]').should(
      'have.text',
      'You do not have permission to delete this saved search.',
    );
  });
});
