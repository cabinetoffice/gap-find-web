import { render, screen } from '@testing-library/react';
import { GrantDetailsApplyButton } from '../../../src/components/grant-details-page/grant-details-apply-button/GrantDetailsApplyButton';

describe('GrantDetailsApplyButton component', () => {
  it('should render the apply button and a link if the show apply button parameter is set to true ', () => {
    const grantWithApplyButtonShown = {
      label: 'test',
      grantShowApplyButton: true,
    };

    render(<GrantDetailsApplyButton grant={grantWithApplyButtonShown} />);

    const link = screen.getByRole('link', { name: 'Start new application' });
    const button = screen.getByText('Start new application');

    expect(link).toBeDefined();
    expect(button).toBeDefined();
    expect(link.getAttribute('href')).toBe(`/apply/test`);
    expect(button.getAttribute('class')).toBe('govuk-button');
    expect(button.getAttribute('disabled')).toBeNull();
    expect(button.getAttribute('aria-disabled')).toBe('false');
  });

  it('should render a disabled button without the nextLink around it if the grantShowApplyButton property is false', () => {
    const grantHide = {
      label: 'test',
      grantShowApplyButton: false,
    };

    render(<GrantDetailsApplyButton grant={grantHide} />);

    const link = screen.getByRole('link', { name: 'Start new application' });
    expect(link).toHaveAttribute('href', '#');

    const button = screen.getByText('Start new application');
    expect(button).toBeDefined();
    expect(button.getAttribute('class')).toBe(
      'govuk-button govuk-button--disabled',
    );
    expect(button.getAttribute('disabled')).not.toBeNull();
    expect(button.getAttribute('aria-disabled')).toBe('true');
  });
});
