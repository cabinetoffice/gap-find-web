import { render, screen } from '@testing-library/react';
import { HomePageHeadingBlurb } from '../../../src/components/homepage/heading-blurb/HomePageHeadingBlurb';
const component = <HomePageHeadingBlurb />;

const blurb =
  'Find a grant is a service that allows you to search government grants.';
const blurbBody = 'You can use this service to:';
const blurbBulletPoint = 'access government grant funding';

describe('HomepageBodyText component', () => {
  it('should render the blurb under the heading', () => {
    render(component);
    expect(screen.getByText(blurb)).toBeDefined();
    expect(screen.getByText(blurbBody)).toBeDefined();
    expect(
      screen
        .getAllByRole('listitem')
        .find((listitem) => listitem.textContent === blurbBulletPoint)
    ).toBeDefined();
  });
});
