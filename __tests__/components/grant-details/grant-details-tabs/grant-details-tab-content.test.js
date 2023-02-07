import { GrantDetailsTabContent } from '../../../../src/components/grant-details-page/grant-details-tabs/grant-details-tab-content/GrantDetailsTabContent';
import { render, screen } from '@testing-library/react';

const component = (
  <GrantDetailsTabContent tab={'summary'} index={0}>
    test
  </GrantDetailsTabContent>
);

describe('GrantDetailsTabContent component', () => {
  it('should render the heading and the children for the component', () => {
    render(component);
    expect(screen.getByRole('heading', { name: 'Summary' })).toBeDefined();
    expect(screen.getByText('test')).toBeDefined();
  });

  it('should render div container with all of the correct parameters and the index set to 0', () => {
    render(component);
    const div = screen.getByTestId('tab-container');
    expect(div).toBeDefined();
    expect(div.getAttribute('data-cy')).toBe('cyTabsContent_summary');
    expect(div.getAttribute('class')).toBe('govuk-tabs__panel');
    expect(div.getAttribute('id')).toBe('summary');
  });

  it('should render div container with all of the correct parameters and the index set to > 0', () => {
    const divIndex = (
      <GrantDetailsTabContent tab={'summary'} index={4}>
        test
      </GrantDetailsTabContent>
    );
    render(divIndex);
    const div = screen.getByTestId('tab-container');
    expect(div).toBeDefined();
    expect(div.getAttribute('data-cy')).toBe('cyTabsContent_summary');
    expect(div.getAttribute('class')).toBe(
      'govuk-tabs__panel govuk-tabs__panel--hidden'
    );
    expect(div.getAttribute('id')).toBe('summary');
  });
});
