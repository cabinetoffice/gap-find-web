import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { useRouter } from 'next/router';
import nookies from 'nookies';
import Unsubscribe, {
  getServerSideProps,
} from '../../../pages/notifications/unsubscribe/[slug]';
import { decryptSignedApiKey } from '../../../src/service/api-key-service';
import { SubscriptionService } from '../../../src/service/subscription-service';
import { notificationRoutes } from '../../../src/utils/constants';
import { fetchByGrantId } from '../../../src/utils/contentFulPage';
import cookieExistsAndContainsValidJwt from '../../../src/utils/cookieAndJwtChecker';
import { decrypt } from '../../../src/utils/encryption';
import { testSubscription } from './manage-notifications.data';

jest.mock('../../../src/utils/encryption');
jest.mock('../../../src/service/api-key-service');

const encryptedEmail = 'test-encrypted-email-string';
const decryptedEmail = 'test-decrypted-email-string';

jest.mock('next/config', () => {
  return jest.fn().mockImplementation(() => {
    return { serverRuntimeConfig: {} };
  });
});

jest.mock('next/router', () => {
  return {
    useRouter: jest.fn(),
  };
});

jest.mock('nookies', () => {
  return {
    get: jest.fn(),
  };
});

jest.mock('../../../src/utils/contentFulPage');
jest.mock('../../../src/utils/cookieAndJwtChecker');

const subscription = [
  {
    contentful_grant_id: '12345678',
  },
];
const grantDetails = {
  grantName: 'Test Grant',
};
const props = {
  unsubscribeGrant: JSON.stringify(subscription),
  email: { email: encryptedEmail },
  grantDetails,
};

const pushMock = jest.fn();

beforeAll(async () => {
  nookies.get.mockReturnValue({
    currentEmailAddress: { email: encryptedEmail },
  });
  useRouter.mockReturnValue({
    pathname: 'test',
    push: pushMock,
  });

  decrypt.mockResolvedValue(decryptedEmail);
});

describe('Testing Unsubscribe component', () => {
  it('renders at Unsubscribe heading', async () => {
    render(<Unsubscribe {...props} />);
    const heading = screen.getAllByText(/Are you sure you want to unsubscribe/);
    // 1 for breadcrumb and 1 for main heading
    expect(heading).toHaveLength(1);
  });

  it('renders at Unsubscribe content', async () => {
    render(<Unsubscribe {...props} />);
    const heading = screen.getAllByText(
      /You will not get any more updates about Test Grant/
    );
    expect(heading).toHaveLength(1);
  });

  it('check cancel link', async () => {
    render(<Unsubscribe {...props} />);
    const button = screen.getByText(/Cancel/);
    expect(button).toHaveAttribute(
      'href',
      '/notifications/manage-notifications'
    );
  });

  it('renders at Unsubscribe content with no slug', async () => {
    render(<Unsubscribe {...props} />);
    const heading = screen.getAllByText(
      /You will not get any more updates about/
    );
    expect(heading).toHaveLength(1);
  });
});

describe('get server side props', () => {
  const expectedTruthResult = {
    props: {
      email: { email: encryptedEmail },
      grantDetails: { grantName: 'Test Grant' },
      unsubscribeGrant: JSON.stringify(testSubscription),
    },
  };

  const TrueContext = {
    query: {
      slug: '12345678',
    },
  };

  it('should work with normal data and create a correct prop for the component', async () => {
    const subscriptionServiceMock = jest
      .spyOn(SubscriptionService.prototype, 'getSubscriptionByEmailAndGrantId')
      .mockImplementation(() => {
        return testSubscription;
      });

    decryptSignedApiKey.mockReturnValue({
      email: encryptedEmail,
    });

    fetchByGrantId.mockReturnValue({
      fields: {
        grantName: 'Test Grant',
      },
    });

    cookieExistsAndContainsValidJwt.mockReturnValue(true);

    const result = await getServerSideProps(TrueContext);

    expect(decrypt).toHaveBeenCalledTimes(1);
    expect(decrypt).toHaveBeenCalledWith(encryptedEmail);
    expect(subscriptionServiceMock).toBeCalledTimes(1);
    expect(result).toStrictEqual(expectedTruthResult);
  });

  it('should redirect to the check email page if a cookie is not set', async () => {
    cookieExistsAndContainsValidJwt.mockReturnValue(false);

    let result = await getServerSideProps(TrueContext);
    expect(result).toStrictEqual({
      redirect: {
        destination: notificationRoutes['checkEmail'],
        permanent: false,
      },
    });
  });
});
