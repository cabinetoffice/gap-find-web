import { render, screen } from '@testing-library/react';
import GovUKHeader from './GovUKHeader';

jest.mock('../../../../pages/_app', () => ({
  useAppContext: jest.fn().mockReturnValue({
    adminUrl: 'http://localhost:3000/apply/admin',
  }),
}));

const userIsSuperAdmin = true;
const userNotSuperAdmin = false;
const superAdminHeader = <GovUKHeader isSuperAdmin={userIsSuperAdmin} />;
const nonSuperAdminHeader = <GovUKHeader isSuperAdmin={userNotSuperAdmin} />;

describe('render GovUKHeader component', () => {
  it('Renders Super Admin Dashboard link for SUPER ADMINS', () => {
    render(superAdminHeader);
    expect(screen.getByText('Superadmin Dashboard')).toBeVisible();
    expect(
      screen.getByRole('link', { name: 'Superadmin Dashboard' }),
    ).toHaveAttribute(
      'href',
      'http://localhost:3000/apply/admin/super-admin-dashboard',
    );
  });

  it('DOES NOT render Super Admin Dashboard link for non-SUPER ADMINS', () => {
    render(nonSuperAdminHeader);
    expect(screen.queryByText('Superadmin Dashboard')).toBeNull();
  });
});
