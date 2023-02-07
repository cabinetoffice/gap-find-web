export default function clearFilterErrorMessages() {
  cy.get('[data-cy="cyCancelFilterBottom"]').click();
  cy.get('[data-cy="cySignupUpdateError_datepicker"]').should('not.exist');
  cy.get('[data-cy="cyInvalidDatesMessage"]').should('not.exist');
}
