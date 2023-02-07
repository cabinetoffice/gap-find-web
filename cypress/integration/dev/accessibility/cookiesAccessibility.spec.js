import run_accessibility from '../../../utils/run_accessbility';
import cy_visit from '../../../utils/cyVisit';
describe('Cookies Page Accessibility', () => {
  it('should have no accessibility issues on the cookies page', () => {
    cy_visit('/info/cookies');
    run_accessibility();
  });
});
