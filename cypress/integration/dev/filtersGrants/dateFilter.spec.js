import clearFilterErrorMessages from '../../../utils/clearFilterErrorMessages';
import cy_visit from '../../../utils/cyVisit';
describe('Date Filter', () => {
  beforeEach(() => {
    cy_visit('/grants');
  });

  it('should let user select "From" date picker after they have navigated from a different page', () => {
    cy.get('[data-cy="cyDatePicker-from"]').click();
    cy.get('[data-cy="cyDatePicker-fromModal"]').should('be.visible');

    cy.get('[data-cy="cyGrantNameAndLink"]').eq(0).click();
    cy.get('[data-cy="cyGrantDetailsBackButton"]').click();

    cy.get('[data-cy="cyDatePicker-from"]').click();
    cy.get('[data-cy="cyDatePicker-fromModal"]').should('be.visible');
  });

  it('should let user select "To" date picker after they have navigated from a different page', () => {
    cy.get('[data-cy="cyDatePicker-to"]').click();
    cy.get('[data-cy="cyDatePicker-toModal"]').should('be.visible');

    cy.get('[data-cy="cyGrantNameAndLink"]').eq(0).click();
    cy.get('[data-cy="cyGrantDetailsBackButton"]').click();

    cy.get('[data-cy="cyDatePicker-to"]').click();
    cy.get('[data-cy="cyDatePicker-toModal"]').should('be.visible');
  });

  it('should retain filters when back button is clicked', () => {
    // Apply filters
    cy.get('[data-cy="cyDateFilter-fromDay"]').click().type('1');
    cy.get('[data-cy="cyDateFilter-fromMonth"]').click().type('1');
    cy.get('[data-cy="cyDateFilter-fromYear"]').click().type('1999');

    cy.get('[data-cy="cyDateFilter-toDay"]').click().type('1');
    cy.get('[data-cy="cyDateFilter-toMonth"]').click().type('03');
    cy.get('[data-cy="cyDateFilter-toYear"]').click().type('2022');

    cy.get('[data-cy="cyEnglandCheckbox"]').click();

    cy.get('[data-cy=cyApplyFilter]').click();

    // Select a grant and return
    cy.get('[data-cy="cyGrantNameAndLink"]').eq(0).click();
    cy.get('[data-cy="cyGrantDetailsBackButton"]').click();

    // Assertions
    cy.get('[data-cy="cyDateFilter-fromDay"]').should('have.value', '1');
    cy.get('[data-cy="cyDateFilter-fromMonth"]').should('have.value', '1');
    cy.get('[data-cy="cyDateFilter-fromYear"]').should('have.value', '1999');

    cy.get('[data-cy="cyDateFilter-toDay"]').should('have.value', '1');
    cy.get('[data-cy="cyDateFilter-toMonth"]').should('have.value', '3');
    cy.get('[data-cy="cyDateFilter-toYear"]').should('have.value', '2022');
    cy.get('[data-cy="cyGrantNameAndLink"]').should(
      'have.length.greaterThan',
      0
    );
    cy.get('[data-cy="cyEnglandCheckbox"]').should('be.checked');

    // Check the dates remain if you click to sign up to a newsletter and then cancel.
    cy.get('[data-cy="cySignUpNewsletter"]').click();
    cy.get('[data-cy="cyCancelNewsletterSignup"]').click();
    cy.get('[data-cy="cyDateFilter-fromDay"]').should('have.value', '1');
    cy.get('[data-cy="cyDateFilter-fromMonth"]').should('have.value', '1');
    cy.get('[data-cy="cyDateFilter-fromYear"]').should('have.value', '1999');
    cy.get('[data-cy="cyDateFilter-toDay"]').should('have.value', '1');
    cy.get('[data-cy="cyDateFilter-toMonth"]').should('have.value', '3');
    cy.get('[data-cy="cyDateFilter-toYear"]').should('have.value', '2022');
    cy.get('[data-cy="cyGrantNameAndLink"]').should(
      'have.length.greaterThan',
      0
    );
    cy.get('[data-cy="cyEnglandCheckbox"]').should('be.checked');
  });

  it('should display the error banner when invalid dates are put in', () => {
    // Checking large numbers do not break the app
    cy.get('[data-cy="cyDateFilter-fromDay"]').click().type('10000000');
    cy.get('[data-cy=cyApplyFilter]').click();
    cy.get('[data-cy="cyError_datepicker"]').should('exist');
    cy.get(
      '[data-cy="cyManageNotificationsInputValidationErrorDetails"]'
    ).should('exist');
    clearFilterErrorMessages();

    // Checking invalid date formats
    cy.get('[data-cy="cyDateFilter-fromDay"]').click().type('52');
    cy.get('[data-cy="cyDateFilter-fromMonth"]').click().type('105');
    cy.get('[data-cy="cyDateFilter-fromYear"]').click().type('199');
    cy.get('[data-cy=cyApplyFilter]').click();
    cy.get('[data-cy="cyError_datepicker"]').should('exist');
    cy.get(
      '[data-cy="cyManageNotificationsInputValidationErrorDetails"]'
    ).should('exist');
    cy.get('[data-cy="cyError_datepicker"]').should('exist');
    clearFilterErrorMessages();

    // Checking the 'from' and 'to' dates are in chronological order
    cy.get('[data-cy="cyDateFilter-fromDay"]').click().type('12');
    cy.get('[data-cy="cyDateFilter-fromMonth"]').click().type('10');
    cy.get('[data-cy="cyDateFilter-fromYear"]').click().type('2029');

    cy.get('[data-cy="cyDateFilter-toDay"]').click().type('12');
    cy.get('[data-cy="cyDateFilter-toMonth"]').click().type('10');
    cy.get('[data-cy="cyDateFilter-toYear"]').click().type('1999');
    cy.get('[data-cy=cyApplyFilter]').click();
    cy.get('[data-cy="cyError_datepicker"]').should('exist');
    cy.get(
      '[data-cy="cyManageNotificationsInputValidationErrorDetails"]'
    ).should('exist');
    cy.get('[data-cy="cyError_datepicker"]').should('exist');
  });
});
