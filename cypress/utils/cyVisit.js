import { basicAuth } from '../constants/constants';
export default function cy_visit(url) {
  cy.visit(url, basicAuth);
}
