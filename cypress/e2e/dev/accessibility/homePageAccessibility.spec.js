import run_accessibility from '../../../utils/run_accessbility';
import cy_visit from '../../../utils/cyVisit';
describe('Accessibility home page', () => {
  it('should have no accessibility issues on the home page', () => {
    cy_visit('/');
    run_accessibility();
  });
});
