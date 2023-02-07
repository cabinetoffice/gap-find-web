import run_accessibility from '../../../utils/run_accessbility';
import cy_visit from '../../../utils/cyVisit';
describe('Privacy Page Accessibility', () => {
  it('should have no accessibility issues on the privacy page', () => {
    cy_visit('/info/privacy');
    run_accessibility();
  });
});
