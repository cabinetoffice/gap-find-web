import { render, screen } from '@testing-library/react';
import {
  FavouriteForm,
  FavouriteMark,
} from '../../../src/components/search-page/favourite-mark/FavouriteMark';

describe('FavouriteMark', () => {
  it('should render a button that submits the grant with the favourite form', () => {
    render(
      <>
        <form action="/grants" method="GET">
          <FavouriteMark
            grantId="grant123"
            grantName="Farming Fund"
            isFavourite={false}
          />
        </form>
        <FavouriteForm csrfToken="token-123" />
      </>,
    );

    const button = screen.getByRole('button', {
      name: 'Add Farming Fund to favourites',
    });
    expect(button).toHaveAttribute('type', 'submit');
    expect(button).toHaveAttribute('form', 'add-favourite-form');
    expect(button.form).toHaveAttribute('action', '/api/favourites/add');
    expect(button.form).toHaveAttribute('method', 'post');
    expect(button).toHaveAttribute('name', 'grantId');
    expect(button).toHaveAttribute('value', 'grant123');
  });

  it('should show the grant is already a favourite, without a button', () => {
    render(
      <FavouriteMark
        grantId="grant123"
        grantName="Farming Fund"
        isFavourite={true}
      />,
    );

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(
      screen.getByText('Farming Fund is in your favourites'),
    ).toBeInTheDocument();
  });

  it('should put the CSRF token in the favourite form, not the search form', () => {
    const { container } = render(
      <>
        <form action="/grants" method="GET" data-testid="search-form" />
        <FavouriteForm csrfToken="token-123" />
      </>,
    );

    const favouriteForm = container.querySelector('#add-favourite-form');
    expect(favouriteForm.querySelector('input[name="_csrf"]')).toHaveValue(
      'token-123',
    );
    expect(
      container.querySelector('[data-testid="search-form"] input'),
    ).toBeNull();
  });
});
