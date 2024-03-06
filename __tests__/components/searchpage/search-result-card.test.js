import { screen } from '@testing-library/react';
import { SearchResultCard } from '../../../src/components/search-page/search-result-card/SearchResultCard';
import gloss from '../../../src/utils/glossary.json';
import { renderWithRouter } from '../../../src/utils/test/render';

const item = {
  label: 'Test',
  grantName: 'Test Name',
  grantShortDescription: 'Test Description',
  grantLocation: ['Test Street'],
  grantFunder: 'Test Test',
  grantApplicantType: ['Test Applicant Type'],
  grantMinimumAwardDisplay: '£350',
  grantMaximumAwardDisplay: '£5000',
  grantTotalAwardDisplay: '£50 million',
  grantApplicationOpenDate: '2022-04-21T14:13:26+00:00',
  grantApplicationCloseDate: '2022-05-21T14:13:26+00:00',
};

const component = <SearchResultCard item={item} />;
describe('SearchResultCard', () => {
  it('should render the list item with the correct id', () => {
    renderWithRouter(component);
    const li = screen.getByRole('listitem');
    expect(li).toBeDefined();
    expect(li.getAttribute('id')).toBe('Test');
  });

  it('should render the heading with the correct links', () => {
    renderWithRouter(component);
    const link = screen.getByRole('link', { name: item.grantName });
    expect(link).toBeDefined();
    expect(link.getAttribute('href')).toBe('/grants/Test');
  });

  it('should render the required fields for the card in the correct formats from contentful', () => {
    renderWithRouter(component);
    expect(screen.getByText(item.grantShortDescription)).toBeDefined();
    expect(screen.getByText(item.grantLocation[0])).toBeDefined();
    expect(screen.getByText(item.grantFunder)).toBeDefined();
    expect(screen.getByText(item.grantApplicantType[0])).toBeDefined();
    expect(
      screen.getByText(
        `From ${item.grantMinimumAwardDisplay} to ${item.grantMaximumAwardDisplay}`,
      ),
    ).toBeDefined();
    expect(screen.getByText(item.grantTotalAwardDisplay)).toBeDefined();
    expect(screen.getByText('21 April 2022, 2:13pm')).toBeDefined();
    expect(screen.getByText('21 May 2022, 2:13pm')).toBeDefined();
  });

  it('should render the required glossary fields for the component', () => {
    renderWithRouter(component);
    expect(screen.getByText(gloss.browse.location)).toBeDefined();
    expect(screen.getByText(gloss.browse.funders)).toBeDefined();
    expect(screen.getByText(gloss.browse.whoCanApply)).toBeDefined();
    expect(screen.getByText(gloss.browse.size)).toBeDefined();
    expect(screen.getByText(gloss.browse.schemeSize)).toBeDefined();
    expect(screen.getByText(gloss.browse.opens)).toBeDefined();
    expect(screen.getByText(gloss.browse.closes)).toBeDefined();
  });

  it('should not render the certain fields if they are not present', () => {
    let blankItem = {
      label: 'Test',
      grantName: 'Test Name',
      grantShortDescription: 'Test Description',
      grantFunder: 'Test Test',
      grantMinimumAwardDisplay: '£350',
      grantMaximumAwardDisplay: '£5000',
      grantTotalAwardDisplay: '£50 million',
      grantApplicationOpenDate: '2022-04-21T14:13:26+00:00',
      grantApplicationCloseDate: '2022-05-21T14:13:26+00:00',
    };
    renderWithRouter(<SearchResultCard item={blankItem} />);
    expect(screen.queryByText(item.grantLocation[0])).toBeNull();
    expect(screen.queryByText(item.grantApplicantType[0])).toBeNull();
  });

  it('should render an altered opening and closing date on the screen for midnight times', () => {
    const itemWithMidnightDates = {
      ...item,
      grantApplicationOpenDate: '2022-04-21T00:00:00.000+00',
      grantApplicationCloseDate: '2022-05-21T00:00:00.000+00',
    };
    const componentWithMidnightDates = (
      <SearchResultCard item={itemWithMidnightDates} />
    );
    renderWithRouter(componentWithMidnightDates);
    expect(screen.getByText('21 April 2022, 12:01am')).toBeDefined();
    expect(screen.getByText('20 May 2022, 11:59pm')).toBeDefined();
  });

  it('should render hr at the bottom of the list item', () => {
    renderWithRouter(component);
    expect(screen.getByRole('separator')).toBeDefined();
  });
});
