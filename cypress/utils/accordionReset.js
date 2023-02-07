export default function resetAccordionState() {
  cy.wait(1500);
  const accordionHeadings = [
    `Who can apply`,
    `Location`,
    `How much can you get`,
    `Type of grant`,
  ];

  accordionHeadings.forEach((heading) => {
    cy.get(`[data-cy="cyAccordionContent-${heading}"]`).then(($element) => {
      if (!$element.is(':visible')) {
        cy.get(`[data-cy="cyAccordionButton-${heading}"]`).click();
      }
    });
  });
}
