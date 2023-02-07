import { wcagCategories } from '../constants/constants';
import accessibilityLog from '../utils/accessibilityLog';

export default function run_accessibility() {
  cy.injectAxe();
  cy.checkA11y(null, wcagCategories, accessibilityLog);

  cy.viewport('ipad-2');
  cy.injectAxe();
  cy.checkA11y(null, wcagCategories, accessibilityLog);

  cy.viewport('ipad-2', 'landscape');
  cy.injectAxe();
  cy.checkA11y(null, wcagCategories, accessibilityLog);

  cy.viewport('samsung-s10');
  cy.injectAxe();
  cy.checkA11y(null, wcagCategories, accessibilityLog);

  cy.viewport('samsung-s10', 'landscape');
  cy.injectAxe();
  cy.checkA11y(null, wcagCategories, accessibilityLog);

  cy.viewport('iphone-se2');
  cy.injectAxe();
  cy.checkA11y(null, wcagCategories, accessibilityLog);

  cy.viewport('iphone-se2', 'landscape');
  cy.injectAxe();
  cy.checkA11y(null, wcagCategories, accessibilityLog);
}
