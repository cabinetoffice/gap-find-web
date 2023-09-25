import run_accessibility from '../../../utils/run_accessbility';
import cy_visit from '../../../utils/cyVisit';
describe('About Us Accessibility', () => {
  it('should have no accessibility issues on the About grants page', () => {
    cy_visit('/info/about-us');
    run_accessibility();
  });
});
