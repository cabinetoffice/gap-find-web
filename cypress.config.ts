import { defineConfig } from 'cypress';
import cypressPostgres from 'cypress-postgres';
import makeEmailAccount from './cypress/plugins/email-account';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    watchForFileChanges: false,
    video: false,
    screenshotOnRunFailure: false,
    chromeWebSecurity: false,
    setupNodeEvents: async (on, config) => {
      config.env.BASIC_AUTH_USERNAME = process.env.BASIC_AUTH_USERNAME;
      config.env.BASIC_AUTH_PASSWORD = process.env.BASIC_AUTH_PASSWORD;
      config.env.ENABLE_AWARDS_TAB = process.env.ENABLE_AWARDS_TAB
        ? process.env.ENABLE_AWARDS_TAB
        : 'false';
      config.env.ENABLE_FAQ_TAB = process.env.ENABLE_FAQ_TAB
        ? process.env.ENABLE_FAQ_TAB
        : 'false';
      config.env.DATABASE_URL = process.env.DATABASE_URL;
      config.env.APPLY_FOR_A_GRANT_APPLICANT_URL =
        process.env.APPLY_FOR_A_GRANT_APPLICANT_URL;

      on('task', {
        dbQuery: (query) => cypressPostgres(query.query, query.connection),
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
    },
  },
});
