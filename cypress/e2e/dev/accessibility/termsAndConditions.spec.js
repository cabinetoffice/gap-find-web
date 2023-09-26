import run_accessibility from '../../../utils/run_accessbility';
import cy_visit from '../../../utils/cyVisit';
describe('Terms and Conditions Accessibility', () => {
  it('should have no accessibility issues on the home page', () => {
    cy_visit('/info/terms-and-conditions');
    run_accessibility();
  });
});
