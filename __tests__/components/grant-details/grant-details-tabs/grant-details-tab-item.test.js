import { GrantDetailsTabItem } from '../../../../src/components/grant-details-page/grant-details-tabs/grant-details-tab-item/GrantDetailsTabItem';
import { render, screen } from '@testing-library/react';

const component = <GrantDetailsTabItem tab={'summary'} index={0} />;

describe('GrantDetailsTabContent component', () => {
  it('should render the list item and the link when the index is 0 with the correct attributes', () => {
    render(component);
    const listitem = screen.getByRole('listitem', { name: '' });
    const link = screen.getByRole('link', { name: 'Summary' });
    expect(listitem).toBeDefined();
    expect(listitem.getAttribute('class')).toBe(
      'govuk-tabs__list-item govuk-tabs__list-item--selected',
    );
    expect(link).toBeDefined();
    expect(link.getAttribute('href')).toBe('#summary');
    expect(link.getAttribute('data-cy')).toBe('cyTabs_summary');
  });

  it('should render the list item and the link when the index is > 0 with the correct attributes', () => {
    render(<GrantDetailsTabItem tab={'summary'} index={6} />);
    const listitem = screen.getByRole('listitem', { name: '' });
    const link = screen.getByRole('link', { name: 'Summary' });
    expect(listitem).toBeDefined();
    expect(listitem.getAttribute('class')).toBe('govuk-tabs__list-item');
    expect(link).toBeDefined();
    expect(link.getAttribute('href')).toBe('#summary');
    expect(link.getAttribute('data-cy')).toBe('cyTabs_summary');
  });
});
