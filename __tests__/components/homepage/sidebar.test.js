import { render, screen } from '@testing-library/react';
import { HomepageSidebar } from '../../../src/components/homepage/sidebar/HomepageSidebar';
import { notificationRoutes } from '../../../src/utils/constants';

const technicalSupportUrl = process.env.TECHNICAL_SUPPORT_DOMAIN;
const applicantUrl = 'http://localhost:3002';
const component = (
  <HomepageSidebar
    header="Test"
    applicantUrl={applicantUrl}
    oneLoginEnabled={'true'}
  />
);

const sidebartext =
  'See all the grant updates you have signed up for. You can unsubscribe here too.';

let defaultValues = {
  isUserLoggedIn: false,
  roles: {
    isAdmin: false,
    isSuperAdmin: false,
    isApplicant: false,
    isTechnicalSupport: false,
  },
};

jest.mock('../../../pages/_app', () => ({
  useAppContext: () => {
    return { adminUrl: '/admin' };
  },
  useAuth: () => {
    return defaultValues;
  },
}));

describe('HomepageSidebar component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    defaultValues = {
      isUserLoggedIn: false,
      roles: {
        isAdmin: false,
        isSuperAdmin: false,
        isApplicant: false,
        isTechnicalSupport: false,
      },
    };
  });

  it('should render heading of the sidebar', () => {
    render(component);
    expect(screen.getAllByRole('heading', { name: 'Test' })).toBeDefined();
  });

  it('should render the text to go along with the heading', () => {
    render(component);
    expect(screen.getByText(sidebartext)).toBeDefined();
  });

  it('should render the manage notifications link with the correct href when one login flag disabled', () => {
    render(
      <HomepageSidebar
        header="Test"
        applicantUrl={applicantUrl}
        oneLoginEnabled={'false'}
      />,
    );

    const manageNotificationsLink = screen.getByRole('link', {
      name: 'Manage notifications and saved searches',
    });
    expect(manageNotificationsLink).toBeDefined();
    expect(manageNotificationsLink.getAttribute('href')).toBe(
      notificationRoutes.checkEmail,
    );
  });

  it('should render the manage notifications link with the correct href when one login flag enabled', () => {
    process.env.ONE_LOGIN_ENABLED = 'false';

    render(component);

    const manageNotificationsLink = screen.getByRole('link', {
      name: 'Manage notifications and saved searches',
    });
    expect(manageNotificationsLink).toBeDefined();
    expect(manageNotificationsLink.getAttribute('href')).toBe(
      notificationRoutes.manageNotifications,
    );
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

  it('Should render sign in and apply differently for signed in admins', () => {
    defaultValues.isUserLoggedIn = true;
    defaultValues.roles.isAdmin = true;
    render(component);
    expect(
      screen.getByRole('link', { name: 'Sign in and apply' }).closest('a'),
    ).toHaveAttribute('href', '/admin/dashboard');
  });

  it('Should render sign in and apply differently for signed in super admins', () => {
    defaultValues.isUserLoggedIn = true;
    defaultValues.roles.isSuperAdmin = true;
    render(component);
    expect(
      screen.getByRole('link', { name: 'Sign in and apply' }).closest('a'),
    ).toHaveAttribute('href', '/admin/super-admin-dashboard');
  });

  it('Should render sign in and apply differently for signed in applicants', () => {
    defaultValues.isUserLoggedIn = true;
    defaultValues.roles.isApplicant = true;
    render(component);
    expect(
      screen.getByRole('link', { name: 'Sign in and apply' }).closest('a'),
    ).toHaveAttribute('href', `${applicantUrl}/dashboard`);
  });

  it('Should render sign in and apply differently for signed in technical support users', () => {
    defaultValues.isUserLoggedIn = true;
    defaultValues.roles.isTechnicalSupport = true;
    render(component);
    expect(
      screen.getByRole('link', { name: 'Sign in and apply' }).closest('a'),
    ).toHaveAttribute('href', `${technicalSupportUrl}/api-keys`);
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
