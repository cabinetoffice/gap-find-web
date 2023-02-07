import run_accessibility from '../../../utils/run_accessbility';
import cy_visit from '../../../utils/cyVisit';
describe('Accessibility Page Accessibility', () => {
  it('should have no accessibility issues on the accessibility page', () => {
    cy_visit('/info/accessibility');
    run_accessibility();
  });
});
