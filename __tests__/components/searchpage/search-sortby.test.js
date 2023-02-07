import { render, screen } from '@testing-library/react';
import { SearchSortBy } from '../../../src/components/search-page/search-sortby/SearchSortBy';

const handleSortByChange = jest.fn();
const component = (
  <SearchSortBy
    sortBy={'openingDate'}
    handleSortByChange={handleSortByChange}
  />
);

describe('SearchSortBy Component', () => {
  it('should render all of the glossary terms from the constants file into options and a combobox', () => {
    render(component);
    expect(screen.getByRole('combobox', { name: 'Sort by' })).toBeDefined();
    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(4);
    expect(options[0].innerText).toBe('Opening date');
    expect(options[1].innerText).toBe('Closing date');
    expect(options[2].innerText).toBe('Grant value: High to low');
    expect(options[3].innerText).toBe('Grant value: Low to high');
  });

  it('should pre-populate the select box with the passed in glossary "openingDate" sortBy variable', () => {
    render(component);
    const combobox = screen.getByRole('combobox', { name: 'Sort by' });
    expect(combobox.innerHTML).toBe('Opening date');
  });

  it('should pre-populate the select box with the passed in glossary "closingDate" sortBy variable', () => {
    render(
      <SearchSortBy
        sortBy={'closingDate'}
        handleSortByChange={handleSortByChange}
      />
    );
    const combobox = screen.getByRole('combobox', { name: 'Sort by' });
    expect(combobox.innerHTML).toBe('Closing date');
  });

  it('should pre-populate the select box with the passed in glossary "minValue" sortBy variable', () => {
    render(
      <SearchSortBy
        sortBy={'minValue'}
        handleSortByChange={handleSortByChange}
      />
    );
    const combobox = screen.getByRole('combobox', { name: 'Sort by' });
    expect(combobox.innerHTML).toBe('Grant value: Low to high');
  });

  it('should pre-populate the select box with the passed in glossary "maxValue" sortBy variable', () => {
    render(
      <SearchSortBy
        sortBy={'maxValue'}
        handleSortByChange={handleSortByChange}
      />
    );
    const combobox = screen.getByRole('combobox', { name: 'Sort by' });
    expect(combobox.innerHTML).toBe('Grant value: High to low');
  });
});
