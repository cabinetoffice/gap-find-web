import { render, screen } from '@testing-library/react';
import { SearchFilterClearButton } from '../../../src/components/search-page/search-clear-filters/SearchFilterClearButton';
describe('Search page clear filters button', () => {
  it('should render the button with the correct classes, value and data-cy tag', () => {
    render(
      <SearchFilterClearButton classname={'govuk-button'} dataCy={'test'} />,
    );
    const button = screen.getByRole('button', { name: 'Clear all filters' });
    expect(button).toBeDefined();
    expect(button.getAttribute('class')).toBe('govuk-button');
    expect(button.getAttribute('data-module')).toBe('govuk-button');
    expect(button.getAttribute('data-cy')).toBe('test');
    expect(button.getAttribute('value')).toBe('true');
  });
});
