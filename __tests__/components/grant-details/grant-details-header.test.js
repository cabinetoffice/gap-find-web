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
  it('should render a header with all the correct attributes set by the component', () => {
    render(component);
    const header = screen.getByRole('heading', { name: 'test' });
    expect(header).toBeDefined();
    expect(header.getAttribute('tabindex')).toBe('-1');
  });

  it('should render an opening and closing date on the screen', () => {
    render(component);
    expect(screen.getByText('7 April 2022, 9:34am')).toBeDefined();
    expect(screen.getByText('15 April 2022, 9:34am')).toBeDefined();
  });

  it('should render an altered opening and closing date on the screen for midnight times', () => {
    render(component);
    const grantWithMidnightDates = {
      ...grant,
      grantApplicationOpenDate: '2022-04-07T00:00:00.000+00',
      grantApplicationCloseDate: '2022-04-15T00:00:00.000+00',
    };
    const componentWithMidnightDates = (
      <GrantDetailsHeader grant={grantWithMidnightDates} />
    );
    render(componentWithMidnightDates);
    const openingDate = screen.getByText('7 April 2022, 12:01am');
    expect(openingDate).toBeDefined();
    expect(openingDate.parentElement.textContent).toContain('(Midnight)');

    const closingDate = screen.getByText('14 April 2022, 11:59pm');
    expect(closingDate).toBeDefined();
    expect(closingDate.parentElement.textContent).toContain('(Midnight)');
  });

  it('should render an altered opening and closing date on the screen for midday times', () => {
    render(component);
    const grantWithMidnightDates = {
      ...grant,
      grantApplicationOpenDate: '2022-04-07T12:00:00.000+00',
      grantApplicationCloseDate: '2022-04-15T12:00:00.000+00',
    };
    const componentWithMidnightDates = (
      <GrantDetailsHeader grant={grantWithMidnightDates} />
    );
    render(componentWithMidnightDates);
    const openingDate = screen.getByText('7 April 2022, 12:00pm');
    expect(openingDate).toBeDefined();
    expect(openingDate.parentElement.textContent).toContain('(Midday)');

    const closingDate = screen.getByText('15 April 2022, 12:00pm');
    expect(closingDate).toBeDefined();
    expect(closingDate.parentElement.textContent).toContain('(Midday)');
  });

  it('should render the values from glossary.json for the opening and closing dates', () => {
    render(component);
    expect(screen.getByText('Closing date:')).toBeDefined();
    expect(screen.getByText('Opening date:')).toBeDefined();
  });

  it('should Render the shortDescription', () => {
    render(component);
    screen.getByText('Short Description');
  });
});
