import { render, screen } from '@testing-library/react';
import { SearchFilterSelector } from '../../../src/components/search-page/search-filter-selector/SearchFilterSelector';

const filters = {
  display: 'test display',
  type: 'text-filter',
  sublevel: [
    {
      id: '1',
      display: 'Test Grant',
      search_parameter: 'Test Grant',
    },
  ],
  index_name: 'test',
};

const component = (
  <SearchFilterSelector filter={filters} index={1} filterObj={[]} />
);

describe('SearchFilterSelector component', () => {
  it('should render the correct sort heading with the correct id', () => {
    render(component);
    const heading = screen.getByRole('heading', { name: 'test display' });
    const span = screen.getByText('test display');
    expect(heading).toBeDefined();
    expect(span.getAttribute('id')).toBe('accordion-default-heading-2');
  });

  it('should render the correct label for the sub levels with the correct fields', () => {
    render(component);
    const label = screen.getByText('Test Grant');
    expect(label).toBeDefined();
    expect(label.getAttribute('for')).toBe('test0');
    expect(label.getAttribute('data-cy')).toBe('cyTest GrantLabel');
  });

  it('should render the section div with the correct id & aria label', () => {
    render(component);
    const div = screen.getByTestId('section-content');
    expect(div).toBeDefined();
    expect(div.getAttribute('id')).toBe('accordion-default-content-2');
    expect(div.getAttribute('aria-labelledby')).toBe(
      'accordion-default-heading-2',
    );
  });

  it('should not render the input if the sublevbel is not present', () => {
    let filter = {
      display: 'test display',
      type: 'text-filter',
      index_name: 'test',
    };
    render(<SearchFilterSelector filter={filter} filterObj={[]} index={1} />);
    const div = screen.queryByTestId('checkbox-items');
    expect(div).toBeNull();
  });
});
