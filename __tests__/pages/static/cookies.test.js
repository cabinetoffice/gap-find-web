import { render, screen, fireEvent } from '@testing-library/react';
import Cookies from '../../../pages/info/cookies';

jest.mock('next/router', () => ({
  useRouter() {
    return jest.fn();
  },
}));
jest.mock('next/config', () => () => ({
  publicRuntimeConfig: {},
}));

const component = <Cookies />;

describe('Rendering the cookies page', () => {
  it('Should render a page header', () => {
    render(component);
    expect(screen.getByRole('heading', { name: 'Cookies' })).toBeDefined();
  });

  it('Should render a gov-uk body of text', () => {
    render(component);
    const text = screen.getByText(
      'These cookies are used across the Find a grant website.',
    );
    expect(text).toBeDefined();
    expect(text).toHaveAttribute('class', 'govuk-body');
  });

  it('Should render a link', () => {
    render(component);
    expect(screen.getByText('how to manage cookies')).toBeDefined();
    expect(screen.getByText('how to manage cookies')).toHaveAttribute(
      'href',
      'https://ico.org.uk/for-the-public/online/cookies',
    );
  });

  it('Should render an unordered list', () => {
    render(component);
    expect(
      screen.getByText(
        'one remembers when you accept or reject cookies on our website',
      ),
    ).toBeDefined();
  });

  it('Should check no radio button by default for analytics cookies', () => {
    render(component);
    expect(screen.getByLabelText('No').checked).toEqual(true);
    expect(screen.getByLabelText('Yes').checked).toEqual(false);
  });

  it('Should changed no checked value to false when yes radio button us clicked', () => {
    render(component);
    expect(screen.getByLabelText('No').checked).toEqual(true);
    expect(screen.getByLabelText('Yes').checked).toEqual(false);

    fireEvent.click(screen.getByLabelText('Yes'));

    expect(screen.getByLabelText('No').checked).toEqual(false);
    expect(screen.getByLabelText('Yes').checked).toEqual(true);
  });

  it('Should render save button', () => {
    render(component);
    expect(
      screen.getByRole('button', { name: 'Save cookie settings' }),
    ).toBeDefined();
  });
});
