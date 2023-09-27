import run_accessibility from '../../../utils/run_accessbility';
import cy_visit from '../../../utils/cyVisit';
describe('Entering Email to Unsubscribe Accessibility', () => {
  it('should have no accessibility issues "enter email to unsubscribe" page', () => {
    cy_visit('/notifications/check-email');
    run_accessibility();
  });
});
