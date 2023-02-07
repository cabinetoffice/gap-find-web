import cy_visit from '../utils/cyVisit';

export default function clickEmailConfirmation() {
  cy.get('p')
    .contains('a')
    .invoke('attr', 'href')
    .then((href) => {
      cy_visit(href);
    });
}
