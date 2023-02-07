/* eslint no-undef: 0 */
export default function insertSavedSearch() {
  const sqlQuery = `INSERT INTO public.saved_search(id, search_term, filters, from_date, to_date, status, notifications, "userId", "name", "createdAt") VALUES (999, 'Charge', '[{"name":"fields.grantApplicantType.en-US","subFilterid":"1","searchTerm":"Personal / Individual","type":"text-filter"}]', NULL, NULL, 'CONFIRMED', true, 1, 'Test search 2', '2022-10-25 09:52:47.486862')`;
  cy.task('dbQuery', {
    query: sqlQuery,
    connection: Cypress.env('DATABASE_URL'),
  }).then((queryResponse) => {
    console.log('queried response', queryResponse);
  });
}
