/// <reference types="cypress" />
/**
 * @type {Cypress.PluginConfig}
 */
// eslint-disable-next-line no-unused-vars
require('dotenv').config();
const makeEmailAccount = require('./email-account');

module.exports = async (on, config) => {
  config.env.BASIC_AUTH_USERNAME = process.env.BASIC_AUTH_USERNAME;
  config.env.BASIC_AUTH_PASSWORD = process.env.BASIC_AUTH_PASSWORD;
  config.env.ENABLE_AWARDS_TAB = process.env.ENABLE_AWARDS_TAB;
  config.env.ENABLE_FAQ_TAB = process.env.ENABLE_FAQ_TAB;
  config.env.DATABASE_URL = process.env.DATABASE_URL;
  config.env.APPLY_FOR_A_GRANT_APPLICANT_URL =
    process.env.APPLY_FOR_A_GRANT_APPLICANT_URL;

  on('task', {
    dbQuery: (query) =>
      require('cypress-postgres')(query.query, query.connection),
    log(message) {
      console.log(message);

      return null;
    },
    table(message) {
      console.table(message);

      return null;
    },
  });

  const emailAccount = await makeEmailAccount();

  on('task', {
    getUserEmail() {
      return emailAccount.email;
    },

    getLastEmail(keepEmails) {
      return emailAccount.getLastEmail(keepEmails);
    },
  });
  return config;
};
