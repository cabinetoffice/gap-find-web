import { render, screen } from '@testing-library/react';
import { GrantDetailsHeader } from '../../../src/components/grant-details-page/grant-details-header/GrantDetailsHeader';

const grant = {
  grantName: 'test',
  grantApplicationOpenDate: '2022-04-07 09:34:09.553+00',
  grantApplicationCloseDate: '2022-04-15 09:34:09.553+00',
  grantShortDescription: 'Short Description',
};

const component = <GrantDetailsHeader grant={grant} />;

describe('GrantDetailsHeader component', () => {
  beforeEach(() => {
    render(component);
  });
  it('should render a header with all the correct attributes set by the component', () => {
    const header = screen.getByRole('heading', { name: 'test' });
    expect(header).toBeDefined();
    expect(header.getAttribute('tabindex')).toBe('-1');
  });

  it('should render an opening and closing date on the screen', () => {
    expect(screen.getByText('7 April 2022')).toBeDefined();
    expect(screen.getByText('15 April 2022')).toBeDefined();
  });

  it('should render the values from glossary.json for the opening and closing dates', () => {
    expect(screen.getByText('Closing date:')).toBeDefined();
    expect(screen.getByText('Opening date:')).toBeDefined();
  });

  it('should Render the shortDescription', () => {
    screen.getByText('Short Description');
  });
});
