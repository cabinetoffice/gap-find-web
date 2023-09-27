import { render, screen } from '@testing-library/react';
import { useRouter } from 'next/router';
import Header from './Header';

jest.mock('next/router', () => {
  return {
    useRouter: jest.fn(),
  };
});

const headerComponent = <Header />;

describe('Header Component that is used within the layout', () => {
  it('should render the browse grants links (js and non-js) with the correct redirect locations', () => {
    useRouter.mockReturnValue('true');
    render(headerComponent);
    const link = screen.getAllByRole('link', { name: 'Browse grants' });
    expect(link).toBeDefined();
    expect(link).toHaveLength(2);
    link.forEach((item) => {
      expect(item.getAttribute('href')).toBe('/grants');
    });
  });

  it('should render the header component with the selected grants link class', () => {
    useRouter.mockReturnValue({ pathname: '/grants' });
    render(headerComponent);
    const listitem = screen.getAllByRole('listitem', { name: '' });
    expect(listitem).toBeDefined();
    expect(listitem).toHaveLength(6);
    listitem.forEach((item) => {
      if (item.getAttribute('data-cy') === 'cybrowseGrantsPageLink') {
        expect(item.getAttribute('class')).toEqual(
          'app-navigation__list-item app-navigation__list-item--current',
        );
      }
    });
  });
});
