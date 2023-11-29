import { render, screen } from '@testing-library/react';
import Home, { getServerSideProps } from '../../pages/index';
import {
  LOGIN_NOTICE_TYPES,
  notificationRoutes,
} from '../../src/utils/constants';
import { AppContext, AuthContext } from '../../pages/_app';

jest.mock('next/router', () => ({
  useRouter() {
    return jest.fn();
  },
}));

const applicantUrl = 'http://localhost:3002';

const renderComponent = (overrides = {}, isUserLoggedIn = false) =>
  render(<Home searchTerm="specific search term" />, {
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

describe('Rendering the home page', () => {
  beforeEach(jest.resetModules);

  it('renders page header and service description', () => {
    renderComponent();

    expect(screen.getByRole('heading', { name: 'Find a grant' })).toBeDefined();
    expect(
      screen.getByText(
        'Find a grant is a service that allows you to search government grants.',
      ),
    ).toBeDefined();
    expect(screen.getByText('You can use this service to:')).toBeDefined();
    expect(screen.getByText('access government grant funding')).toBeDefined();
    expect(
      screen.getByText(
        'search and filter to find a grant that matches your needs',
      ),
    ).toBeDefined();
    expect(
      screen.getByText('find out if you are eligible to apply for a grant'),
    ).toBeDefined();
    expect(screen.getByText('find out how to apply for a grant')).toBeDefined();
  });

  it('Should have a search button of type submit', () => {
    renderComponent();
    expect(
      screen.getByRole('textbox', { name: 'Search grants' }),
    ).toBeDefined();
    expect(
      screen.getByText(
        'Find government grants and check if you are eligible to apply.',
      ),
    ).toBeDefined();
  });

  it('renders Browse All Grants section', () => {
    renderComponent();
    expect(
      screen.getByRole('heading', { name: 'Browse all grants' }),
    ).toBeDefined();
    expect(
      screen.getByText(
        'See a list of all grants. You can filter the list based on your needs.',
      ),
    ).toBeDefined();
    expect(
      screen.getAllByRole('link', { name: 'Browse grants' })[1].closest('a'),
    ).toHaveAttribute('href', '/grants');
  });

  it('renders the future of Find a grant section', () => {
    renderComponent();
    expect(
      screen.getByRole('heading', { name: 'The future of Find a grant' }),
    ).toBeDefined();
    expect(
      screen.getByText(
        'More grants will be added as we develop our service. We will also add new functionality to make it easier to use.',
      ),
    ).toBeDefined();
  });

  it('renders manage notifications section', () => {
    renderComponent();
    expect(
      screen.getByRole('heading', { name: 'Manage notifications' }),
    ).toBeDefined();
    expect(
      screen.getByText(
        'See all the grant updates you have signed up for. You can unsubscribe here too.',
      ),
    ).toBeDefined();
    expect(
      screen
        .getByRole('link', { name: 'Manage notifications and saved searches' })
        .closest('a'),
    ).toHaveAttribute(
      'href',
      `${notificationRoutes.loginNotice}${LOGIN_NOTICE_TYPES.MANAGE_NOTIFICATIONS}`,
    );
    expect(
      screen
        .getByRole('link', { name: 'through our feedback form' })
        .closest('a'),
    ).toHaveAttribute(
      'href',
      'https://docs.google.com/forms/d/e/1FAIpQLSe6H5atE1WQzf8Fzjti_OehNmTfY0Bv_poMSO-w8BPzkOqr-A/viewform?usp=sf_link',
    );
  });

  it('renders manage notifications link with expected href when user logged in', () => {
    renderComponent({}, true);
    expect(
      screen
        .getByRole('link', { name: 'Manage notifications and saved searches' })
        .closest('a'),
    ).toHaveAttribute('href', notificationRoutes.manageNotifications);
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
    ).toHaveAttribute('href', process.env.APPLY_FOR_A_GRANT);
  });

  it('renders a search input with a default search value from the query params', () => {
    renderComponent();
    expect(
      screen.getByDisplayValue('specific search term'),
    ).toBeInTheDocument();
  });
});

describe('getServerSideProps', () => {
  beforeEach(jest.resetModules);

  it('returns empty search params if no query params exist', () => {
    const result = getServerSideProps({ query: {} });
    expect(result).toStrictEqual({
      props: { searchTerm: '' },
    });
  });

  it('returns a search term if a search term exists as a query param', () => {
    const result = getServerSideProps({ query: { searchTerm: 'search' } });
    expect(result).toStrictEqual({
      props: { searchTerm: 'search' },
    });
  });
});

describe('Skip to main content', () => {
  it('renders skip to main content link', () => {
    renderComponent();
    const skipToMainContentLink = screen.getByRole('link', {
      name: 'Skip to main content',
    });
    expect(skipToMainContentLink).toBeDefined();
    expect(skipToMainContentLink).toHaveAttribute('href', '/#main-content');
  });

  it('renders element tagged for focus', () => {
    renderComponent();
    const elementToFocus = document.querySelector('#main-content-focus');
    expect(elementToFocus).not.toEqual(null);
    expect(elementToFocus).toBeDefined();
  });
});
