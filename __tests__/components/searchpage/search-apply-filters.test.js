import { render, screen } from '@testing-library/react';
import { SearchFilterButton } from '../../../src/components/search-page/search-apply-filters/SearchFilterButton';

describe('Search page apply filters button', () => {
  it('should render the button with the correct text and classes', () => {
    render(<SearchFilterButton />);
    const button = screen.getByRole('button', { name: 'Apply filters' });
    expect(button).toBeDefined();
    expect(button.getAttribute('class')).toBe('govuk-button');
    expect(button.getAttribute('data-module')).toBe('govuk-button');
  });
});
