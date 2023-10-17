import { render, screen } from '@testing-library/react';
import { HomepageSidebar } from '../../../src/components/homepage/sidebar/HomepageSidebar';
import { notificationRoutes } from '../../../src/utils';
const applicantUrl = 'http://localhost:3002';
const component = (
  <HomepageSidebar header={'Test'} applicantUrl={applicantUrl} />
);

const sidebartext =
  'See all the grant updates you have signed up for. You can unsubscribe here too.';

describe('HomepageSidebar component', () => {
  it('should render heading of the sidebar', () => {
    render(component);
    expect(screen.getAllByRole('heading', { name: 'Test' })).toBeDefined();
  });

  it('should render the text to go along with the heading', () => {
    render(component);
    expect(screen.getByText(sidebartext)).toBeDefined();
  });

  it('should render the manage notifications link with the correct href when one login flag disabled', () => {
    const oneLoginEnabledBackup = process.env.ONE_LOGIN_ENABLED;
    process.env.ONE_LOGIN_ENABLED = 'false';
    render(component);

    const manageNotificationsLink = screen.getByRole('link', {
      name: 'Manage notifications and saved searches',
    });
    expect(manageNotificationsLink).toBeDefined();
    expect(manageNotificationsLink.getAttribute('href')).toBe(
      notificationRoutes.checkEmail,
    );

    process.env.ONE_LOGIN_ENABLED = oneLoginEnabledBackup;
  });

  it('should render the manage notifications link with the correct href when one login flag enabled', () => {
    const oneLoginEnabledBackup = process.env.ONE_LOGIN_ENABLED;
    process.env.ONE_LOGIN_ENABLED = 'true';
    render(component);

    const manageNotificationsLink = screen.getByRole('link', {
      name: 'Manage notifications and saved searches',
    });
    expect(manageNotificationsLink).toBeDefined();
    expect(manageNotificationsLink.getAttribute('href')).toBe(
      notificationRoutes.manageNotifications,
    );

    process.env.ONE_LOGIN_ENABLED = oneLoginEnabledBackup;
  });

  it('Should render sign in and apply section', () => {
    render(component);
    expect(
      screen.getByRole('heading', { name: 'Sign in and apply' }),
    ).toBeDefined();
    expect(
      screen.getByText('See your grant applications or start a new one.'),
    ).toBeDefined();
    expect(
      screen.getByRole('link', { name: 'Sign in and apply' }).closest('a'),
    ).toHaveAttribute('href', applicantUrl);
  });

  it('should render the improvement form link with the correct href', () => {
    render(component);
    const improvementFormLink = screen.getByRole('link', {
      name: 'through our feedback form',
    });
    expect(improvementFormLink).toBeDefined();
    expect(improvementFormLink.getAttribute('href')).toBe(
      'https://docs.google.com/forms/d/e/1FAIpQLSe6H5atE1WQzf8Fzjti_OehNmTfY0Bv_poMSO-w8BPzkOqr-A/viewform?usp=sf_link',
    );
  });
});
