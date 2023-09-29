import { render, screen } from '@testing-library/react';
import Router from 'next/router';
import CheckEmail from '../../../pages/save-search/check-email';

describe('save-search/check-email.js testing the page', () => {
  const mockBack = jest.fn();
  const props = {
    email: 'test@gmail.com',
  };
  beforeAll(async () => {
    const useRouter = jest.spyOn(Router, 'useRouter');

    useRouter.mockImplementation(() => ({
      route: '/',
      pathname: '',
      prefetch: jest.fn(() => Promise.resolve()),
      push: jest.fn(),
      back: mockBack,
    }));
  });
  it('should render a heading', async () => {
    render(<CheckEmail {...props} />);

    expect(screen.getByText('Check your email')).toBeDefined();
  });

  it('should render the paragraphs and email address', async () => {
    render(<CheckEmail {...props} />);

    const email = screen.getByTestId('save-search-email');

    expect(email.textContent).toBe('test@gmail.com');
    expect(
      screen.queryAllByText(
        'Click the link in the email to confirm your email address.',
      ),
    ).toHaveLength(1);
    expect(
      screen.queryAllByText('The link will stop working after 7 days.'),
    ).toHaveLength(1);
  });

  it('should render details component', async () => {
    render(<CheckEmail {...props} />);

    expect(screen.queryAllByText('Not received an email?')).toHaveLength(1);
    expect(
      screen.queryAllByText('Emails sometimes take a few minutes to arrive.'),
    ).toHaveLength(1);
  });
});
