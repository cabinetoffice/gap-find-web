import '@testing-library/jest-dom/extend-expect';
import { render, screen, within } from '@testing-library/react';
import SignupConfirmation, {
  getServerSideProps,
} from '../../../pages/subscriptions/confirmation';
import userEvent from '@testing-library/user-event';
import { generateSignedApiKey } from '../../../src/service/api-key-service';
import { sendEmail } from '../../../src/service/gov_notify_service';
import { notificationRoutes } from '../../../src/utils/constants';
import { encrypt } from '../../../src/utils/encryption';
import { hash } from '../../../src/utils/hash';

jest.mock('../../../src/utils/encryption');
jest.mock('../../../src/utils/hash');

const encryptedEmail = 'test-encrypted-email-string';
const hashedEmail = 'test-hashed-email-string';

const props = {
  grantLabel: 'Chargepoint Grant 2',
  email: 'dom@gmail.com',
  grantTitle: 'Chargepoint Grant for people renting and living in flats (1)',
};
const component = <SignupConfirmation {...props} />;


jest.mock('next/router', () => ({
  useRouter() {
    return jest.fn();
  },
}));

jest.mock('../../../src/service/gov_notify_service', () => {
  return {
    sendEmail: jest.fn(),
  };
});

jest.mock('../../../src/service/api-key-service', () => {
  return {
    generateSignedApiKey: jest.fn(),
  };
});

describe('Confirmation', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    encrypt.mockResolvedValue(encryptedEmail);
    hash.mockReturnValue(hashedEmail);
  });

  it('Should display the name of the grant', async () => {
    render(component);
    expect(screen.getByTestId('signed_up_to_bold')).toHaveTextContent(
      'Chargepoint Grant for people renting and living in flats (1)'
    );
  });

  it('Should display email', async () => {
    const { getByTestId } = render(component);
    const { getByText } = within(getByTestId('email'));
    expect(getByText('dom@gmail.com')).toBeInTheDocument();
  });

  it('Should have a back link', async () => {
    render(component);
    expect(screen.getByText('Back')).toBeDefined();
  });

  it('Should have a back to grant details link', async () => {
    render(component);
    expect(screen.getByText('Back to grant details')).toBeDefined();
  });

  it('Should have a browse all grants link', async () => {
    render(component);
    expect(screen.getByText('Browse all grants')).toBeDefined();
  });

  it('Should hide and show gov email', async () => {
    render(component);
    const details = screen.getByRole('group', { name: 'details' });
    const link = screen.getByText('Not received an email?');

    userEvent.click(link);
    expect(details).toHaveProperty('open', true);

    userEvent.click(link);
    expect(details).toHaveProperty('open', false);
  });
});

describe('Server Side Props', () => {
  const tokenValue = 'a-signed-api-key';
  const email = 'email@email.com';
  const grantId = 'a-grant-id';
  const req = {
    headers: {
      host: 'localhost:3000',
    },
    body: {
      user_email: email,
      notification_privacy: 'on',
      grantId,
      grantLabel: 'grant-label',
      grantTitle: 'grant-title',
    },
  };
  const res = {
    redirect: jest.fn(),
  };

  beforeEach(() => {
    jest.resetAllMocks();
    encrypt.mockResolvedValue(encryptedEmail);
    hash.mockReturnValue(hashedEmail);
  });

  it('should send a verification email', async () => {
    const url = new URL(
      `${notificationRoutes['addSubscription']}${tokenValue}`,
      process.env.HOST
    ).toString();

    const expectedEmailBody = {
      'name of grant': 'grant-title',
      'Confirmation link for updates': url,
    };

    const expectedTokenBody = {
      contentful_grant_subscription_id: 'a-grant-id',
      encrypted_email_address: encryptedEmail,
    };

    generateSignedApiKey.mockReturnValue(tokenValue);

    const response = await getServerSideProps({ req, res });

    expect(encrypt).toHaveBeenCalledTimes(1);
    expect(encrypt).toHaveBeenCalledWith(email);

    expect(generateSignedApiKey).toHaveBeenCalledWith(expectedTokenBody);
    expect(sendEmail).toHaveBeenCalledWith(
      email,
      expectedEmailBody,
      process.env.GOV_NOTIFY_NOTIFICATION_EMAIL_TEMPLATE
    );
    expect(response).toStrictEqual({
      props: {
        email: 'email@email.com',
        grantLabel: 'grant-label',
        grantTitle: 'grant-title',
      },
    });
  });

  it('should still render the page if the email failed to send', async () => {
    const url = new URL(
      `${notificationRoutes['addSubscription']}${tokenValue}`,
      process.env.HOST
    ).toString();

    const expectedEmailBody = {
      'name of grant': 'grant-title',
      'Confirmation link for updates': url,
    };

    const expectedTokenBody = {
      contentful_grant_subscription_id: 'a-grant-id',
      encrypted_email_address: encryptedEmail,
    };

    generateSignedApiKey.mockReturnValue(tokenValue);

    sendEmail.mockImplementation(() => {
      throw new Error('failed to send email.');
    });

    const response = await getServerSideProps({ req, res });

    expect(encrypt).toHaveBeenCalledTimes(1);
    expect(encrypt).toHaveBeenCalledWith(email);

    expect(generateSignedApiKey).toHaveBeenCalledWith(expectedTokenBody);
    expect(sendEmail).toHaveBeenCalledWith(
      email,
      expectedEmailBody,
      process.env.GOV_NOTIFY_NOTIFICATION_EMAIL_TEMPLATE
    );
    expect(response).toStrictEqual({
      props: {
        email: 'email@email.com',
        grantLabel: 'grant-label',
        grantTitle: 'grant-title',
      },
    });
  });
});
