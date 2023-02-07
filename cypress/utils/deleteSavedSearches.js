/* eslint no-undef: 0 */
export default function deleteSavedSearches() {
  cy.task('dbQuery', {
    query: `DELETE FROM saved_search`,
    connection: Cypress.env('DATABASE_URL'),
  }).then((queryResponse) => {
    console.log('queried response', queryResponse);
  });
}
