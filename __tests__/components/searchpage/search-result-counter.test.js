import { render, screen } from '@testing-library/react';
import { SearchResultCounter } from '../../../src/components/search-page/search-results-counter/SearchResultCounter';

const component = <SearchResultCounter countGrants={6} />;

describe('SearchResultCounter component', () => {
  it('should render the heading with the correct tab index', () => {
    render(component);
    const heading = screen.getByRole('heading', { name: 'Search results' });
    expect(heading).toBeDefined();
    expect(heading.getAttribute('tabindex')).toBe('-1');
  });

  it('should render the total amount of grants found', () => {
    render(component);
    expect(screen.getByTestId('grant-count').textContent).toBe(
      `We’ve found 6 grants`,
    );
  });

  it('should render the singular if only 1 grant is found instead of the plural', () => {
    render(<SearchResultCounter countGrants={1} />);
    expect(screen.getByTestId('grant-count').textContent).toBe(
      `We’ve found 1 grant`,
    );
  });
});
