import { render, screen } from '@testing-library/react';
import { HomepageBodyText } from '../../../src/components/homepage/body-text/HomePageBodyText';

const component = (
  <HomepageBodyText heading={'Test Title'}>Test String</HomepageBodyText>
);

describe('HomepageBodyText component', () => {
  it('should render the children passed to the component', () => {
    render(component);
    expect(screen.getByText('Test String')).toBeDefined();
    expect(screen.getByRole('heading', 'Test Title')).toBeDefined();
  });
});
