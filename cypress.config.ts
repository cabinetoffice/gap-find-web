import { defineConfig } from 'cypress';
import makeEmailAccount from './cypress/plugins/email-account';
import 'dotenv/config';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    specPattern: 'cypress/e2e/**/*.spec.{js,jsx,ts,tsx}',
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
        // tests that use this currently disabled
        // dbQuery: (query) => cypressPostgres(query.query, query.connection),
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
