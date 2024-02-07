import { render, screen } from '@testing-library/react';
import { FundedByGovukBanner } from '../../../src/components/homepage/FundedByGovukBanner';

const component = (text) => <FundedByGovukBanner text={text} />;

describe('FundedByGovukBanner component', () => {
  it('Should render with text', () => {
    render(component('example text'));
    expect(screen.getByAltText('Funded by UK Government banner')).toBeDefined();
    expect(screen.getByText('example text')).toBeDefined();
  });

  it('Should render without text', () => {
    render(component());
    expect(screen.getByAltText('Funded by UK Government banner')).toBeDefined();
    expect(screen.queryByTestId('banner-text')).toBeNull();
  });
});
