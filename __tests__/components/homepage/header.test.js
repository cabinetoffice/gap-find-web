import { render, screen } from '@testing-library/react';
import { HomePageHeader } from '../../../src/components/homepage/header/HomePageHeader';

const component = <HomePageHeader heading={'Test String'} />;

describe('HomePageHeader component', () => {
  it('should render the children passed to the component', () => {
    render(component);
    expect(screen.getByRole('heading', { name: 'Test String' })).toBeDefined();
  });
});
