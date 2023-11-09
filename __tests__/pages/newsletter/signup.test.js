import { render, screen } from '@testing-library/react';
import { useRouter } from 'next/router';
import Signup, { getServerSideProps } from '../../../pages/newsletter/signup';
import gloss from '../../../src/utils/glossary.json';

jest.mock('next/router', () => {
  return {
    useRouter: jest.fn(),
  };
});

const component = (
  <Signup
    errors={[
      [
        {
          field: 'user_email',
          error: 'This is a test error.',
        },
      ],
    ]}
    previousFormValues={{
      user_email: 'test@email.com',
      notification_privacy: 'on',
    }}
  />
);

describe('Should Render Newsletter Signup Page', () => {
  beforeAll(() => {
    useRouter.mockReturnValue({
      route: '/',
      prefetch: jest.fn(() => Promise.resolve()),
      back: jest.fn(),
      push: jest.fn(),
      query: { page: '1' },
    });
  });

  it('Should use generic signup component with correct values ', () => {
    render(component);

    const signupForm = screen.getByTestId('signup-form');
    expect(signupForm).toBeDefined();
    expect(signupForm).toHaveAttribute('action', '/newsletter/confirmation');
    expect(signupForm).toHaveAttribute('method', 'POST');

    expect(screen.getByRole('alert')).toBeDefined();
    expect(screen.getByTestId('red-banner')).toHaveClass(
      'govuk-form-group govuk-form-group--error',
    );

    expect(screen.getByTestId('notification_privacy')).toBeChecked();
    expect(screen.getByTestId('user_email')).toHaveValue('test@email.com');
  });
});

describe('getServerSideProps', () => {
  const query = {
    'errors[]': '{"field":"signup_field","error":"Error with this field"}',
  };

  it('Should return url errors as an array to the component', async () => {
    const result = await getServerSideProps({ query });
    expect(result.props).toEqual(
      expect.objectContaining({
        errors: [{ field: 'signup_field', error: 'Error with this field' }],
        titleContent: `Error: ${gloss.title}`,
      }),
    );
  });

  it('Should check the props have the right value if no errors are found', async () => {
    const result = await getServerSideProps({ query: {} });
    expect(result.props).toEqual(
      expect.objectContaining({
        errors: [],
        titleContent: `${gloss.title}`,
      }),
    );
  });

  it('Should return entire query to prepopulate fields', async () => {
    const result = await getServerSideProps({ query });
    expect(result.props.previousFormValues).toEqual(query);
  });
});
