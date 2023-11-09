export default function checkSaveSearchData(name, notifications_requested) {
  const connection = {
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'mysecretpassword',
    port: 5432,
  };
  cy.task('dbQuery', {
    query: `SELECT * FROM saved_search WHERE name='${name}'`,
    connection: connection,
  }).then((queryResponse) => {
    const response = queryResponse[0];
    expect(response.notifications).to.equal(notifications_requested);
  });
}
