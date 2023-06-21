import cy_visit from '../../../utils/cyVisit';
import resetAccordionState from '../../../utils/accordionReset';

describe('Accordion and Filter states to work as expected', () => {
  beforeEach(() => {
    cy_visit('/');
    cy.get('[data-cy=cyHomePageSearchInput]').click();
    cy.get('[data-cy=cySearchGrantsBtn]').click();
    resetAccordionState();
  });

  after(() => {
    resetAccordionState();
  });

  it('should reset filter states when "browse grants" nav button is linked', () => {
    //applying filters
    cy.get('[data-cy="cyPublic sectorCheckbox"]').click();
    cy.get('[data-cy="cyPublic sectorCheckbox"]').should('be.checked');

    cy.get('[data-cy="cyPrivate sectorCheckbox"]').click();
    cy.get('[data-cy="cyPrivate sectorCheckbox"]').should('be.checked');

    cy.get('[data-cy=cyApplyFilter]').click();
    cy.get('[data-cy="cybrowseGrantsPageLink"]').click();

    cy.get('[data-cy="cyPublic sectorCheckbox"]').should('not.be.checked');
    cy.get('[data-cy="cyPrivate sectorCheckbox"]').should('not.be.checked');
  });

  it('should allow filters to apply and clear regardless of accordion state', () => {
    cy.get('[data-cy="cyGrantsFoundMessage"]').should('exist');
    cy.get('[data-cy=cyGrantNameAndLink]').should('have.length', '10');
    cy.get('[data-cy="cyAccordionContent-Who can apply"]').should('be.visible');
    cy.get('[data-cy="cyAccordionContent-Location"]').should('be.visible');
    cy.get('[data-cy="cyAccordionContent-How much can you get"]').should(
      'be.visible'
    );

    //applying filters
    cy.get('[data-cy="cyPublic sectorCheckbox"]').click();
    cy.get('[data-cy="cyPublic sectorCheckbox"]').should('be.checked');

    cy.get('[data-cy="cyPrivate sectorCheckbox"]').click();
    cy.get('[data-cy="cyPrivate sectorCheckbox"]').should('be.checked');

    cy.get('[data-cy="cyEnglandCheckbox"]').click();
    cy.get('[data-cy="cyEnglandCheckbox"]').should('be.checked');

    cy.get('[data-cy="cy£10,001 to £50,000Checkbox"]').click();
    cy.get('[data-cy="cy£10,001 to £50,000Checkbox"]').should('be.checked');

    //closing accordions and checking visibility
    cy.get('[data-cy="cyAccordionButton-Location"]').click();
    cy.get('[data-cy="cyAccordionButton-How much can you get"]').click();

    cy.get('[data-cy="cyAccordionContent-Who can apply"]').should('be.visible');
    cy.get('[data-cy="cyAccordionContent-Location"]').should('not.be.visible');
    cy.get('[data-cy="cyAccordionContent-How much can you get"]').should(
      'not.be.visible'
    );

    //applying filters and rechecking retention of filters
    cy.get('[data-cy=cyApplyFilter]').click();
    cy.get('[data-cy="cyGrantsFoundMessage"]').should('exist');
    cy.get('[data-cy=cyGrantNameAndLink]')
      .eq(0)
      .contains('Workplace Charging Scheme');

    cy.get('[data-cy="cyAccordionContent-Who can apply"]').should('be.visible');
    cy.get('[data-cy="cyAccordionContent-Location"]').should('not.be.visible');
    cy.get('[data-cy="cyAccordionContent-How much can you get"]').should(
      'not.be.visible'
    );

    cy.get('[data-cy="cyAccordionButton-Location"]').click();
    cy.get('[data-cy="cyAccordionButton-How much can you get"]').click();

    cy.get('[data-cy="cyPublic sectorCheckbox"]').should('be.checked');
    cy.get('[data-cy="cyPrivate sectorCheckbox"]').should('be.checked');
    cy.get('[data-cy="cyEnglandCheckbox"]').should('be.checked');
    cy.get('[data-cy="cy£10,001 to £50,000Checkbox"]').should('be.checked');

    cy.get('[data-cy="cyCancelFilterTop"').click();
    cy.wait(1500);
    cy.get('[data-cy="cyGrantsFoundMessage"]').should('exist');
  });

  it('should be able to clear all filters regardless of accordion state', () => {
    cy.get('[data-cy="cyPublic sectorCheckbox"]').click();
    cy.get('[data-cy="cyPublic sectorCheckbox"]').should('be.checked');

    cy.get('[data-cy="cyPrivate sectorCheckbox"]').click();
    cy.get('[data-cy="cyPrivate sectorCheckbox"]').should('be.checked');

    cy.get('[data-cy="cyEnglandCheckbox"]').click();
    cy.get('[data-cy="cyEnglandCheckbox"]').should('be.checked');

    cy.get('[data-cy="cy£0 to £10,000Checkbox"]').click();
    cy.get('[data-cy="cy£0 to £10,000Checkbox"]').should('be.checked');

    cy.get('[data-cy="cyFormula grantCheckbox"]').click();
    cy.get('[data-cy="cyFormula grantCheckbox"]').should('be.checked');

    cy.get('[data-cy=cyApplyFilter]').click();
    cy.get('[data-cy="cyGrantsFoundMessage"]').should(
      'contain',
      'We’ve found 0 grants'
    );
    cy.wait(1000);

    cy.get('[data-cy="cyAccordionButton-Who can apply"]').click();
    cy.get('[data-cy="cyAccordionButton-Location"]').click();
    cy.get('[data-cy="cyAccordionButton-How much can you get"]').click();
    cy.get('[data-cy="cyAccordionButton-Type of grant"]').click();

    cy.get('[data-cy="cyCancelFilterBottom"').click();
    cy.wait(1500);

    cy.get('[data-cy="cyGrantsFoundMessage"]').should('exist');
    cy.get('[data-cy=cyGrantNameAndLink]')
      .eq(0)
      .contains('Workplace Charging Scheme');
  });
});
