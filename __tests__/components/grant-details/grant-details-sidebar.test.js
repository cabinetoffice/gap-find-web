import { GrantDetailsSidebar } from '../../../src/components/grant-details-page/grant-details-sidebar/GrantDetailsSidebar';
import { render, screen } from '@testing-library/react';

const component = <GrantDetailsSidebar grantId={'test'} grantLabel={'test'} />;

describe('GrantDetailsSidebar component', () => {
  it('should render the sidebar with the correct link set by the component', () => {
    render(component);
    const link = screen.getByRole('link', { name: 'Sign up for updates' });
    expect(
      screen.getByRole('heading', { name: 'Get updates about this grant' }),
    ).toBeDefined();
    expect(link).toBeDefined();
    expect(link.getAttribute('href')).toBe(
      '/subscriptions/signup?id=test&grantLabel=test',
    );
  });
});
