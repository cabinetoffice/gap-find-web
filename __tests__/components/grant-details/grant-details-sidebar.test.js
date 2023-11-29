import { GrantDetailsSidebar } from '../../../src/components/grant-details-page/grant-details-sidebar/GrantDetailsSidebar';
import { AuthContext } from '../../../pages/_app';
import { render, screen } from '@testing-library/react';

const renderComponent = ({ isUserLoggedIn = false } = {}) =>
  render(<GrantDetailsSidebar grantId="test" grantLabel="test" />, {
    wrapper: ({ children }) => (
      <AuthContext.Provider value={{ isUserLoggedIn }}>
        {children}
      </AuthContext.Provider>
    ),
  });

describe('GrantDetailsSidebar component', () => {
  it('links to correct login notice when user not logged in', () => {
    renderComponent();
    expect(
      screen.getByRole('heading', { name: 'Get updates about this grant' }),
    ).toBeVisible();
    const link = screen.getByRole('link', { name: 'Sign up for updates' });
    expect(link).toBeVisible();
    expect(link.getAttribute('href')).toBe(
      '/login-notice/subscription-notifications?grantId=test&grantLabel=test',
    );
  });

  it('links to signup page when user logged in', () => {
    renderComponent({ isUserLoggedIn: true });
    const link = screen.getByRole('link', { name: 'Sign up for updates' });
    expect(link).toBeVisible();
    expect(link.getAttribute('href')).toBe(
      '/subscriptions/signup?grantId=test&grantLabel=test',
    );
  });
});
