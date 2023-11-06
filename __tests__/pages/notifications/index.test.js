import { fireEvent, render, screen } from '@testing-library/react';
import Router from 'next/router';
import nookies from 'nookies';
import Notifications, {
  getServerSideProps,
} from '../../../pages/notifications/index';

jest.mock('nookies', () => {
  return {
    get: jest.fn(),
  };
});
jest.mock('next/config', () => () => ({
  publicRuntimeConfig: {},
}));

describe('notifications/index.js testing the page', () => {
  const mockBack = jest.fn();
  beforeAll(async () => {
    nookies.get.mockReturnValue({
      currentEmailAddress: '{"emailAddress":"test@gmail.com"}',
    });
    const useRouter = jest.spyOn(Router, 'useRouter');

    useRouter.mockImplementation(() => ({
      route: '/',
      pathname: '',
      prefetch: jest.fn(() => Promise.resolve()),
      push: jest.fn(),
      back: mockBack,
    }));
  });
  it('should render a heading', async () => {
    let context = {};
    const { props } = await getServerSideProps(context);
    render(<Notifications {...props} />);

    let heading = screen.getAllByText('Get updates about a grant');
    expect(heading).toHaveLength(1);
  });

  it('should render the opening of the body', async () => {
    let context = {};
    const { props } = await getServerSideProps(context);
    render(<Notifications {...props} />);

    let heading = screen.getAllByText(
      'You can choose to get updates about any grant. Updates are always sent by email.',
    );
    expect(heading).toHaveLength(1);
  });

  it('should render the on click for the back button', async () => {
    let context = {};
    const { props } = await getServerSideProps(context);
    render(<Notifications {...props} />);

    fireEvent.click(screen.getByTestId('govuk-back'));
    expect(mockBack).toBeCalled();
  });
});
