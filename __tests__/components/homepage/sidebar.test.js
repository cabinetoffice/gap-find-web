import { render, screen } from '@testing-library/react';
import { HomepageSidebar } from '../../../src/components/homepage/sidebar/HomepageSidebar';
import {
  LOGIN_NOTICE_TYPES,
  notificationRoutes,
} from '../../../src/utils/constants';
import { AppContext, AuthContext } from '../../../pages/_app';

const applicantUrl = 'http://localhost:3002';

const renderComponent = (overrides = {}, isUserLoggedIn = false) =>
  render(<HomepageSidebar header="Test" />, {
    wrapper: ({ children }) => (
      <AppContext.Provider
        value={{ applicantUrl, oneLoginEnabled: true, ...overrides }}
      >
        <AuthContext.Provider value={{ isUserLoggedIn }}>
          {children}
        </AuthContext.Provider>
      </AppContext.Provider>
    ),
  });

describe('HomepageSidebar component', () => {
  afterEach(jest.clearAllMocks);

  it('renders expected content', () => {
    renderComponent();
    expect(screen.getByRole('heading', { name: 'Test' })).toBeVisible();
    expect(
      screen.getByText(
        'See all the grant updates you have signed up for. You can unsubscribe here too.',
      ),
    ).toBeVisible();
  });

  it('renders the manage notifications link with expected href when one login flag disabled', () => {
    renderComponent({ oneLoginEnabled: false });

    const manageNotificationsLink = screen.getByRole('link', {
      name: 'Manage notifications and saved searches',
    });
    expect(manageNotificationsLink).toBeDefined();
    expect(manageNotificationsLink.getAttribute('href')).toBe(
      notificationRoutes.checkEmail,
    );
  });

  it('renders the manage notifications link with expect href when one login flag enabled and user not logged in', () => {
    renderComponent();

    const manageNotificationsLink = screen.getByRole('link', {
      name: 'Manage notifications and saved searches',
    });
    expect(manageNotificationsLink).toBeDefined();
    expect(manageNotificationsLink.getAttribute('href')).toBe(
      `${notificationRoutes.loginNotice}${LOGIN_NOTICE_TYPES.MANAGE_NOTIFICATIONS}`,
    );
  });

  it('renders the manage notifications link with the correct href when one login flag enabled and user logged in', () => {
    renderComponent({}, true);

    const manageNotificationsLink = screen.getByRole('link', {
      name: 'Manage notifications and saved searches',
    });
    expect(manageNotificationsLink).toBeDefined();
    expect(manageNotificationsLink.getAttribute('href')).toBe(
      notificationRoutes.manageNotifications,
    );
  });

  it('renders sign in and apply section', () => {
    renderComponent();
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

  it('renders the improvement form link with the correct href', () => {
    renderComponent();
    const improvementFormLink = screen.getByRole('link', {
      name: 'through our feedback form',
    });
    expect(improvementFormLink).toBeDefined();
    expect(improvementFormLink.getAttribute('href')).toBe(
      'https://docs.google.com/forms/d/e/1FAIpQLSe6H5atE1WQzf8Fzjti_OehNmTfY0Bv_poMSO-w8BPzkOqr-A/viewform?usp=sf_link',
    );
  });
});
