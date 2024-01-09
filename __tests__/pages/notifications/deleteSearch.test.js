import { render, screen } from '@testing-library/react';
import { notificationRoutes, URL_ACTIONS } from '../../../src/utils/constants';
import DeleteSaveSearch, {
  getServerSideProps,
} from '../../../pages/notifications/delete-saved-search/[slug]';

import { decryptSignedApiKey } from '../../../src/service/api-key-service';
import { useRouter } from 'next/router';

import cookieExistsAndContainsValidJwt from '../../../src/utils/cookieAndJwtChecker';
import {
  getBySavedSearchId,
  deleteSaveSearch,
} from '../../../src/service/saved_search_service';
import { decrypt } from '../../../src/utils/encryption';
import { AxiosError } from 'axios';

jest.mock('../../../src/utils/encryption');
jest.mock('../../../src/service/api-key-service');
jest.mock('../../../src/utils/contentFulPage');
jest.mock('../../../src/utils/cookieAndJwtChecker');
jest.mock('../../../src/service/saved_search_service');

const encryptedEmail = 'test-encrypted-email-string';
const decryptedEmail = 'test-decrypted-email-string';

jest.mock('next/router', () => {
  return {
    useRouter: jest.fn(),
  };
});

const propsWithNoErrorMessage = {
  saveSearchId: '1',
  errorMessage: '',
};

const propsWithErrorMessage = {
  saveSearchId: '1',
  errorMessage: 'Error',
};

const pushMock = jest.fn();

beforeAll(async () => {
  useRouter.mockReturnValue({
    pathname: 'test',
    push: pushMock,
  });

  decrypt.mockResolvedValue(decryptedEmail);
});

describe('Testing Delete Search component', () => {
  it('renders a Delete search heading', async () => {
    render(<DeleteSaveSearch {...propsWithNoErrorMessage} />);
    const heading = screen.getAllByText(
      /Are you sure you want to delete this saved search/,
    );
    expect(heading).toHaveLength(1);
    expect(
      screen.getByRole('button', { name: 'Confirm delete' }),
    ).toBeDefined();
    const button = screen.getByText(/Cancel/);
    expect(button).toHaveAttribute(
      'href',
      '/notifications/manage-notifications',
    );
  });

  it('renders a Delete search error heading if the emails do not match', async () => {
    render(<DeleteSaveSearch {...propsWithErrorMessage} />);
    const heading = screen.getAllByText(/Error/);
    expect(heading).toHaveLength(1);
  });
});

describe('get server side props', () => {
  const expectedProps = {
    props: {
      saveSearchId: '1',
      errorMessage: '',
    },
  };

  const context = {
    query: {
      slug: '1',
    },
    req: {
      method: 'POST',
      cookies: {
        currentEmailAddress: 'email@address.com',
      },
    },
  };

  const contextGetRequest = {
    query: {
      slug: '1',
    },
    req: {
      method: 'GET',
      cookies: {
        currentEmailAddress: 'email@address.com',
      },
    },
  };

  const oneLoginBackup = process.env.ONE_LOGIN_ENABLED;

  beforeEach(() => {
    process.env.ONE_LOGIN_ENABLED = 'false';
  });

  afterEach(() => {
    process.env.ONE_LOGIN_ENABLED = oneLoginBackup;
  });

  it('should work with normal data and create a correct prop for the component (get request)', async () => {
    decryptSignedApiKey.mockReturnValue({
      email: encryptedEmail,
    });

    cookieExistsAndContainsValidJwt.mockReturnValue(true);
    const result = await getServerSideProps(contextGetRequest);

    expect(decrypt).toHaveBeenCalledTimes(1);
    expect(decrypt).toHaveBeenCalledWith(encryptedEmail);
    expect(result).toStrictEqual(expectedProps);
  });

  it('should redirect to the check email page if a cookie is not set', async () => {
    cookieExistsAndContainsValidJwt.mockReturnValue(false);

    let result = await getServerSideProps(context);
    expect(result).toStrictEqual({
      redirect: {
        destination: notificationRoutes['checkEmail'],
        permanent: false,
      },
    });
  });

  it('should redirect to the notifications page once a search is deleted (POST request)', async () => {
    cookieExistsAndContainsValidJwt.mockReturnValue(true);

    decryptSignedApiKey.mockReturnValue({
      email: encryptedEmail,
    });

    getBySavedSearchId.mockResolvedValue({ name: 'Test Name' });
    deleteSaveSearch.mockResolvedValue();

    const result = await getServerSideProps(context);

    expect(result).toEqual({
      redirect: {
        statusCode: 302,
        destination: `${notificationRoutes['manageNotifications']}?action=${URL_ACTIONS.DELETE_SAVED_SEARCH}&savedSearchName=Test Name`,
      },
    });
  });

  it('should throw an error if "email do not match error" has been thrown (POST request)', async () => {
    cookieExistsAndContainsValidJwt.mockReturnValue(true);

    decryptSignedApiKey.mockReturnValue({
      email: encryptedEmail,
    });

    const axiosError = new AxiosError(null, null, null, null, {
      data: { message: 'Email does not match' },
      status: 500,
    });

    getBySavedSearchId.mockResolvedValue({ name: 'Test Name' });
    deleteSaveSearch.mockRejectedValue(axiosError);

    const result = await getServerSideProps(context);

    expect(result).toEqual({
      props: {
        saveSearchId: '1',
        errorMessage: 'You do not have permission to delete this saved search.',
      },
    });
  });

  it('should throw an error if other axios error has been thrown (POST request)', async () => {
    cookieExistsAndContainsValidJwt.mockReturnValue(true);

    decryptSignedApiKey.mockReturnValue({
      email: encryptedEmail,
    });

    const axiosError = new AxiosError('Email', null, null, null, {
      data: { message: 'Email' },
      status: 500,
    });

    getBySavedSearchId.mockResolvedValue({ name: 'Test Name' });
    deleteSaveSearch.mockRejectedValue(axiosError);

    await expect(getServerSideProps(context)).rejects.toThrowError(
      expect.objectContaining({
        message: 'Email',
      }),
    );
  });

  it('should throw an error if non-axios error has been thrown (POST request)', async () => {
    cookieExistsAndContainsValidJwt.mockReturnValue(true);

    decryptSignedApiKey.mockReturnValue({
      email: encryptedEmail,
    });

    const error = new Error('Something went wrong');

    getBySavedSearchId.mockResolvedValue({ name: 'Test Name' });
    deleteSaveSearch.mockRejectedValue(error);

    await expect(getServerSideProps(context)).rejects.toThrowError(error);
  });
});
