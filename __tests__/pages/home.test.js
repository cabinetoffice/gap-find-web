import { render, screen } from '@testing-library/react';
import Home, { getServerSideProps } from '../../pages/index';

jest.mock('next/router', () => ({
  useRouter() {
    return jest.fn();
  },
}));

const applicantUrl = 'http://localhost:3002';
const component = (
  <Home searchTerm="specific search term" applicantUrl={applicantUrl} />
);

describe('Rendering the home page', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = {
      ...originalEnv,
      APPLY_FOR_A_GRANT_APPLICANT_URL: applicantUrl,
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });
  it('Should render a page header', () => {
    render(component);
    expect(screen.getByRole('heading', { name: 'Find a grant' })).toBeDefined();
  });

  it('Should render service description', () => {
    render(component);

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
    render(component);
    expect(
      screen.getByRole('textbox', { name: 'Search grants' }),
    ).toBeDefined();
    expect(
      screen.getByText(
        'Find government grants and check if you are eligible to apply.',
      ),
    ).toBeDefined();
  });

  it('Should render Browse All Grants section', () => {
    render(component);
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

  it('Should render The future of Find a grant section', () => {
    render(component);
    expect(
      screen.getByRole('heading', { name: 'The future of Find a grant' }),
    ).toBeDefined();
    expect(
      screen.getByText(
        'More grants will be added as we develop our service. We will also add new functionality to make it easier to use.',
      ),
    ).toBeDefined();
  });

  it('Should render Manage notifications section', () => {
    render(component);
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
    ).toHaveAttribute('href', '/notifications/check-email');
    expect(
      screen
        .getByRole('link', { name: 'through our feedback form' })
        .closest('a'),
    ).toHaveAttribute(
      'href',
      'https://docs.google.com/forms/d/e/1FAIpQLSe6H5atE1WQzf8Fzjti_OehNmTfY0Bv_poMSO-w8BPzkOqr-A/viewform?usp=sf_link',
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
    ).toHaveAttribute('href', process.env.APPLY_FOR_A_GRANT);
  });

  it('should render a search input with a default search value from the query params', () => {
    render(component);
    expect(
      screen.getByDisplayValue('specific search term'),
    ).toBeInTheDocument();
  });
});

describe('getServerSideProps', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = {
      ...originalEnv,
      APPLY_FOR_A_GRANT_APPLICANT_URL: applicantUrl,
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });
  it('should return empty search params if no query params exist', () => {
    const result = getServerSideProps({ query: {} });
    expect(result).toStrictEqual({ props: { searchTerm: '', applicantUrl } });
  });

  it('should return a search term if a search term exists as a query param', () => {
    const result = getServerSideProps({ query: { searchTerm: 'search' } });
    expect(result).toStrictEqual({
      props: { searchTerm: 'search', applicantUrl },
    });
  });
});

describe('Skip to main content', () => {
  it('should have skip to main content link', () => {
    render(component);
    const skipToMainContentLink = screen.getByRole('link', {
      name: 'Skip to main content',
    });
    expect(skipToMainContentLink).toBeDefined();
    expect(skipToMainContentLink).toHaveAttribute('href', '/#main-content');
  });

  it('should have an element tagged for focus', () => {
    render(component);
    const elementToFocus = document.querySelector('#main-content-focus');
    expect(elementToFocus).not.toEqual(null);
    expect(elementToFocus).toBeDefined();
  });
});
