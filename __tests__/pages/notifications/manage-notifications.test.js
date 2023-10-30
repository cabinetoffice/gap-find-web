import { render, screen } from '@testing-library/react';
import { useRouter } from 'next/router';
import nookies from 'nookies';
import * as management from '../../../pages/notifications/manage-notifications';
import { decryptSignedApiKey } from '../../../src/service/api-key-service';
import { NewsletterSubscriptionService } from '../../../src/service/newsletter/newsletter-subscription-service';
import { getAllSavedSearches } from '../../../src/service/saved_search_service';
import { SubscriptionService } from '../../../src/service/subscription-service';
import {
  fetchByGrantId,
  fetchByGrantIds,
} from '../../../src/utils/contentFulPage';
import cookieExistsAndContainsValidJwt from '../../../src/utils/cookieAndJwtChecker';
import { decrypt } from '../../../src/utils/encryption';
import { hash } from '../../../src/utils/hash';
import {
  context,
  deleteContext,
  deletedProps,
  newsletterSubscribeContext,
  newsletterSubscription,
  noNotificationNoSavedSearchesProps,
  notNewsletterSubscribeContext,
  props,
  redirectResult,
  savedSearches,
  subscribeContext,
  subscribedProps,
  testGrants,
  testResultDeleteSuccess,
  testResultSubscribeSuccess,
  testResultSuccess,
  testSubscriptionArray,
} from './manage-notifications.data';

jest.mock('../../../src/utils/encryption');
jest.mock('../../../src/utils/hash');
jest.mock('../../../src/service/saved_search_service');

jest.mock('../../../src/utils/jwt', () => ({
  getJwtFromCookies: jest.fn(() => ({
    jwtPayload: {
      email: 'fake@email.com',
      sub: 'sub',
    },
    jwt: 'a.b.c',
  })),
}));

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('nookies', () => ({
  get: jest.fn(),
  set: jest.fn(),
}));

jest.mock('../../../src/utils/contentFulPage');
jest.mock('../../../src/service/api-key-service');
jest.mock('../../../src/utils/cookieAndJwtChecker');

const encryptedEmail = 'test-encrypted-email-string';
const decryptedEmail = 'test-decrypted-email-string';
const hashedEmail = 'test-hashed-email-string';

describe('Testing manage-notifications component', () => {
  const pushMock = jest.fn();
  beforeAll(async () => {
    nookies.get.mockReturnValue({
      currentEmailAddress: encryptedEmail,
    });
    useRouter.mockReturnValue({
      pathname: 'test',
      push: pushMock,
    });
  });

  it('renders at manage-notifications heading', async () => {
    render(<management.default {...props} />);

    const heading = screen.getAllByText(/Manage your notifications/);
    // 1 for breadcrumb and 1 for main heading
    expect(heading).toHaveLength(1);
  });

  it('renders at manage-notifications content with email address from cookies', async () => {
    render(<management.default {...props} />);
    const heading = screen.getAllByText(/Grants you are following/i);
    expect(heading).toHaveLength(1);
  });

  it('should call the confirmation message when there are deleted grants', async () => {
    render(<management.default {...deletedProps} />);
    const heading = screen.getAllByText(
      /You have been unsubscribed from "Test Grant"/,
    );
    expect(heading).toHaveLength(1);
  });

  it('should call the confirmation message when there are subscribed grants', async () => {
    render(<management.default {...subscribedProps} />);
    const heading = screen.getAllByText(
      /You have signed up for updates about "Test Grant"/,
    );
    expect(heading).toHaveLength(1);
  });

  it('should display the option to manage newsletter notifications if a subscription exists', () => {
    render(<management.default {...props} />);

    expect(screen.getByText('Updates about new grants')).toBeDefined();
  });

  it('should not display the option to manage newsletter notifications if no subscription exists', () => {
    // eslint-disable-next-line no-unused-vars
    const { newsletterSubscription, ...propsWithoutSubscription } = props;
    render(<management.default {...propsWithoutSubscription} />);

    expect(screen.queryByText('Updates about new grants')).toBeNull();
  });

  it('should display notifications sorted by time (newest to oldest), and saved searches sorted by time (newest to oldest)', async () => {
    render(<management.default {...noNotificationNoSavedSearchesProps} />);
    screen.getByText(
      /you are not signed up for any notifications, and you don't have any saved searches\./i,
    );
    const searchForGrantLink = screen.getByRole('link', {
      name: /search for grants/i,
    });
    expect(searchForGrantLink).toHaveAttribute('href', '/grants');
  });
});

describe('get server side props for manage notifications page', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    decryptSignedApiKey.mockReturnValue({
      email: encryptedEmail,
    });

    decrypt.mockReset();
    decrypt.mockResolvedValue(decryptedEmail);
    hash.mockReset();
    hash.mockReturnValue(hashedEmail);

    jest.useFakeTimers('modern');
    jest.setSystemTime(new Date(2022, 2, 16));
    process.env.ONE_LOGIN_ENABLED = 'false';
  });

  it('should proceed when a cookie is detected and no errors are thrown', async () => {
    cookieExistsAndContainsValidJwt.mockReturnValue(true);
    const subscriptionServiceMock = jest
      .spyOn(SubscriptionService.prototype, 'getSubscriptionsByEmail')
      .mockImplementationOnce(() => {
        return testSubscriptionArray;
      });

    getAllSavedSearches.mockReturnValue(savedSearches);
    const newsletterSubscriptionServiceMock = jest
      .spyOn(
        NewsletterSubscriptionService.prototype,
        'getBySubAndNewsletterType',
      )
      .mockImplementation(() => newsletterSubscription);

    fetchByGrantIds.mockReturnValue([]);
    const result = await management.getServerSideProps(context);

    expect(decrypt).toHaveBeenCalledTimes(2);
    expect(decrypt).toHaveBeenCalledWith(encryptedEmail);
    expect(subscriptionServiceMock).toBeCalledTimes(1);
    expect(getAllSavedSearches).toBeCalledTimes(1);
    expect(newsletterSubscriptionServiceMock).toHaveBeenCalledTimes(1);
    expect(result).toStrictEqual(testResultSuccess);
  });

  it('should return deleted grant when cookie has deleted id', async () => {
    cookieExistsAndContainsValidJwt.mockReturnValue(true);
    const subscriptionServiceMock = jest
      .spyOn(SubscriptionService.prototype, 'getSubscriptionsByEmail')
      .mockImplementationOnce(() => {
        return testSubscriptionArray;
      });

    const newsletterSubscriptionServiceMock = jest
      .spyOn(
        NewsletterSubscriptionService.prototype,
        'getBySubAndNewsletterType',
      )
      .mockImplementation(() => newsletterSubscription);

    fetchByGrantIds.mockReturnValue(testGrants);
    fetchByGrantId.mockReturnValue(testGrants[0]);
    let result = await management.getServerSideProps(deleteContext);

    expect(decrypt).toHaveBeenCalledTimes(2);
    expect(decrypt).toHaveBeenCalledWith(encryptedEmail);
    expect(subscriptionServiceMock).toBeCalledTimes(1);
    expect(newsletterSubscriptionServiceMock).toHaveBeenCalledTimes(1);
    expect(result).toStrictEqual(testResultDeleteSuccess);
  });

  it('should return subscribed grant success when cookie has subscribed id', async () => {
    cookieExistsAndContainsValidJwt.mockReturnValue(true);
    const subscriptionServiceMock = jest
      .spyOn(SubscriptionService.prototype, 'getSubscriptionsByEmail')
      .mockImplementationOnce(() => {
        return testSubscriptionArray;
      });

    const newsletterSubscriptionServiceMock = jest
      .spyOn(
        NewsletterSubscriptionService.prototype,
        'getBySubAndNewsletterType',
      )
      .mockImplementation(() => newsletterSubscription);

    fetchByGrantIds.mockReturnValue(testGrants);
    fetchByGrantId.mockReturnValue(testGrants[0]);
    let result = await management.getServerSideProps(subscribeContext);
    expect(subscriptionServiceMock).toBeCalledTimes(1);
    expect(newsletterSubscriptionServiceMock).toHaveBeenCalledTimes(1);
    expect(result).toStrictEqual(testResultSubscribeSuccess);
  });

  it('should create a new newsletter subscription if one does not already exist', async () => {
    const oneLoginEnabledBackup = process.env.ONE_LOGIN_ENABLED;
    process.env.ONE_LOGIN_ENABLED = 'true';

    jest
      .spyOn(SubscriptionService.prototype, 'getSubscriptionsByEmail')
      .mockImplementationOnce(() => {
        return testSubscriptionArray;
      });

    const getNewsletterSubscriptionServiceMock = jest
      .spyOn(
        NewsletterSubscriptionService.prototype,
        'getBySubAndNewsletterType',
      )
      .mockImplementation(() => {});

    const postNewsletterSubscriptionServiceMock = jest
      .spyOn(NewsletterSubscriptionService.prototype, 'subscribeToNewsletter')
      .mockImplementation(() => newsletterSubscription);

    let result = await management.getServerSideProps(
      newsletterSubscribeContext,
    );

    expect(getNewsletterSubscriptionServiceMock).toHaveBeenCalledTimes(1);
    expect(getNewsletterSubscriptionServiceMock).toHaveBeenCalledWith(
      'sub',
      'NEW_GRANTS',
      'a.b.c',
    );
    expect(postNewsletterSubscriptionServiceMock).toHaveBeenCalledTimes(1);
    expect(postNewsletterSubscriptionServiceMock).toHaveBeenCalledWith(
      'fake@email.com',
      'NEW_GRANTS',
      'a.b.c',
      'sub',
    );

    expect(result.props.urlAction).toBe('newsletter-subscribe');

    process.env.ONE_LOGIN_ENABLED = oneLoginEnabledBackup;
  });

  it('should not create a new newsletter subscription if one already exists', async () => {
    const oneLoginEnabledBackup = process.env.ONE_LOGIN_ENABLED;
    process.env.ONE_LOGIN_ENABLED = 'true';

    jest
      .spyOn(SubscriptionService.prototype, 'getSubscriptionsByEmail')
      .mockImplementationOnce(() => {
        return testSubscriptionArray;
      });

    const getNewsletterSubscriptionServiceMock = jest
      .spyOn(
        NewsletterSubscriptionService.prototype,
        'getBySubAndNewsletterType',
      )
      .mockImplementation(() => newsletterSubscription);

    const postNewsletterSubscriptionServiceMock = jest.spyOn(
      NewsletterSubscriptionService.prototype,
      'subscribeToNewsletter',
    );

    let result = await management.getServerSideProps(
      newsletterSubscribeContext,
    );

    expect(getNewsletterSubscriptionServiceMock).toHaveBeenCalledTimes(1);
    expect(getNewsletterSubscriptionServiceMock).toHaveBeenCalledWith(
      'sub',
      'NEW_GRANTS',
      'a.b.c',
    );
    expect(postNewsletterSubscriptionServiceMock).not.toHaveBeenCalled();

    expect(result.props.urlAction).toBe(null);

    process.env.ONE_LOGIN_ENABLED = oneLoginEnabledBackup;
  });

  it('should not create a new newsletter subscription if action is not newsletter-subscribe', async () => {
    const oneLoginEnabledBackup = process.env.ONE_LOGIN_ENABLED;
    process.env.ONE_LOGIN_ENABLED = 'true';

    jest
      .spyOn(SubscriptionService.prototype, 'getSubscriptionsByEmail')
      .mockImplementationOnce(() => {
        return testSubscriptionArray;
      });

    const getNewsletterSubscriptionServiceMock = jest
      .spyOn(
        NewsletterSubscriptionService.prototype,
        'getBySubAndNewsletterType',
      )
      .mockImplementation(() => {});

    const postNewsletterSubscriptionServiceMock = jest.spyOn(
      NewsletterSubscriptionService.prototype,
      'subscribeToNewsletter',
    );

    let result = await management.getServerSideProps(
      notNewsletterSubscribeContext,
    );

    expect(getNewsletterSubscriptionServiceMock).toHaveBeenCalledTimes(1);
    expect(getNewsletterSubscriptionServiceMock).toHaveBeenCalledWith(
      'sub',
      'NEW_GRANTS',
      'a.b.c',
    );
    expect(postNewsletterSubscriptionServiceMock).not.toHaveBeenCalled();

    expect(result.props.urlAction).toBe('not-newsletter-subscribe');

    process.env.ONE_LOGIN_ENABLED = oneLoginEnabledBackup;
  });

  it('should redirect to check email if no cookie is set', async () => {
    cookieExistsAndContainsValidJwt.mockReturnValue(false);
    let result = await management.getServerSideProps(deleteContext);
    expect(result).toStrictEqual(redirectResult);
  });
});
