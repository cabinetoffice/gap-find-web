/* eslint no-undef: 0 */
export const wcagCategories = {
  runOnly: {
    type: 'tag',
    values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
  },
};

export const basicAuth = {
  auth: {
    username: Cypress.env('BASIC_AUTH_USERNAME'),
    password: Cypress.env('BASIC_AUTH_PASSWORD'),
  },
};

export const FAQ = Cypress.env('ENABLE_FAQ_TAB');
export const AWARDS = Cypress.env('ENABLE_AWARDS_TAB');
export const APPLY_FOR_A_GRANT_APPLICANT_URL = Cypress.env(
  'APPLY_FOR_A_GRANT_APPLICANT_URL',
);

export const userEmail = 'tcotest0906@outlook.com';
