import { render, screen } from '@testing-library/react';
import { createMockRouter } from '../../../src/utils/createMockRouter';
import SignupSavedSearch, {
  getServerSideProps,
} from '../../../pages/save-search/notifications';
import { RouterContext } from 'next/dist/shared/lib/router-context.js';
import { parseBody } from 'next/dist/server/api-utils/node';
jest.mock('next/dist/server/api-utils/node');
describe('Rendering serverside props', () => {
  const queryWithNoErrors = {
    req: { method: 'GET' },
    query: {},
  };

  it('should return props with right title when no errors are there', async () => {
    const response = await getServerSideProps(queryWithNoErrors);
    expect(response).toEqual({
      props: {
        validationErrors: [],
        query: {},
      },
    });
  });

  it('should return props with right title when there are errors', async () => {
    const context = {
      req: {
        method: 'POST',
      },
      query: {},
    };

    const parsedBody = {
      consent_radio: '',
    };

    parseBody.mockResolvedValue(parsedBody);

    const response = await getServerSideProps(context);

    expect(response).toEqual({
      props: {
        query: {},
        validationErrors: [
          { field: 'consent-radio', error: "Select 'Yes' or 'No'" },
        ],
      },
    });
  });

  it('the back button should have the right href', async () => {
    render(
      <RouterContext.Provider
        value={createMockRouter({
          pathname: '/',
        })}
      >
        <SignupSavedSearch
          validationErrors={[]}
          titleContent={'Sign Up For Save Search - Find a grant'}
          query={{ searchTerm: 'test' }}
        />
      </RouterContext.Provider>,
    );

    expect(screen.getByTestId('govuk-back')).toHaveAttribute(
      'href',
      '/save-search?searchTerm=test',
    );
  });

  it('should redirect the user if the method is POST and there are no validation errors', async () => {
    const context = {
      req: {
        method: 'POST',
      },
      query: {
        'errors[]': '',
      },
    };

    const parsedBody = {
      consent_radio: 'true',
    };

    parseBody.mockResolvedValue(parsedBody);

    const result = await getServerSideProps(context);
    expect(result).toEqual({
      redirect: {
        statusCode: 302,
        destination: 'email?errors[]=&notifications_consent=true',
      },
    });
  });
});

describe('Rendering signup page', () => {
  it('Should display consent form for signing up to a saved search grant', () => {
    render(
      <RouterContext.Provider
        value={createMockRouter({
          pathname: '/',
        })}
      >
        <SignupSavedSearch
          validationErrors={[]}
          titleContent={'Sign Up For Save Search - Find a grant'}
        />
      </RouterContext.Provider>,
    );
    expect(screen.getByText('Sign up for email updates')).toBeDefined();
    const description =
      "Select 'Yes' if you want to be updated when grants that match your saved search are added.";
    expect(screen.getByText(description)).toBeDefined();
    expect(screen.getByRole('radio', { name: 'No' })).toBeDefined();
    expect(screen.getByRole('radio', { name: 'Yes' })).toBeDefined();
    expect(screen.getByText('Yes')).toBeDefined();
    expect(screen.getByText('No')).toBeDefined();
  });

  // Check that the error messages render properly
  it('Should display consent form for signing up to a saved search grant', () => {
    render(
      <RouterContext.Provider
        value={createMockRouter({
          pathname: '/',
        })}
      >
        <SignupSavedSearch
          validationErrors={[{ field: 'consent-radio', error: 'test' }]}
          titleContent={'Sign Up For Save Search - Find a grant'}
        />
      </RouterContext.Provider>,
    );
    expect(screen.getByText('Sign up for email updates')).toBeDefined();
    expect(
      screen.getByRole('heading', { name: 'There is a problem' }),
    ).toBeDefined();
    expect(screen.getByRole('link', { name: 'test' })).toBeDefined();
    const error = screen.getByTestId('red-banner');
    expect(error).toHaveClass('govuk-form-group--error');
    expect(screen.getByTestId('specific-error-message')).toHaveClass(
      'govuk-error-message',
    );
  });
});
