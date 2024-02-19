import Head from 'next/head';
import gloss from '../../../src/utils/glossary.json';
import { BreadCrumbs } from '../../../src/components/breadcrumbs/BreadCrumbs';
import { notificationRoutes, cookieName } from '../../../src/utils/constants';
import Layout from '../../../src/components/partials/Layout';
import { generateSignedApiKey } from '../../../src/service/api-key-service';
import { sendEmail } from '../../../src/service/gov_notify_service';
import cookieExistsAndContainsValidJwt from '../../../src/utils/cookieAndJwtChecker';
import {
  EMAIL_ADDRESS_REGEX,
  EMAIL_ADDRESS_FORMAT_VALIDATION_ERROR,
} from '../../../src/utils/constants';
import { encrypt } from '../../../src/utils/encryption';
import { logger } from '../../../src/utils';

const generateConfirmationUrl = (apiKey) => {
  return `${process.env.HOST}${notificationRoutes['confirmSubscription']}/${apiKey}`;
};

//TODO GAP-560 / GAP-592
const breadcrumbsRoutes = [
  {
    label: 'Home',
    path: notificationRoutes['home'],
  },
  {
    label: 'Notifications',
    path: notificationRoutes['notificationsHome'],
  },
  {
    label: 'Check your email',
    path: notificationRoutes['checkEmail'],
  },
  {
    label: 'Email Confirmation',
    path: notificationRoutes['emailConfirmation'],
  },
];

const validate = (email) => {
  const errors = [];

  if (!email) {
    errors.push({
      field: 'email',
      error: 'You must enter an email address.',
    });
  } else if (!EMAIL_ADDRESS_REGEX.test(email)) {
    errors.push({
      field: 'email',
      error: EMAIL_ADDRESS_FORMAT_VALIDATION_ERROR,
    });
  }

  return errors;
};

export async function getServerSideProps(ctx) {
  if (cookieExistsAndContainsValidJwt(ctx, cookieName['currentEmailAddress'])) {
    return {
      redirect: {
        permanent: false,
        destination: notificationRoutes['manageNotifications'],
      },
    };
  }

  const email = ctx.query.email;
  const validationErrors = validate(email);

  if (validationErrors.length > 0) {
    const errorStr = validationErrors
      .map((error) => 'errors[]=' + JSON.stringify(error))
      .join('');

    return {
      redirect: {
        permanent: false,
        destination: `${notificationRoutes['checkEmail']}?${errorStr}&email=${email}`,
      },
    };
  }

  const encryptedEmail = await encrypt(email);
  const apiKey = generateSignedApiKey({
    email: encryptedEmail,
  });

  const confirmationUrl = generateConfirmationUrl(apiKey);

  try {
    await sendEmail(
      email,
      {
        'confirmation link': confirmationUrl,
      },
      process.env.GOV_NOTIFY_NOTIFICATION_EMAIL_TEMPLATE_UNSUBSCRIBE,
    );
  } catch (error) {
    logger.error(
      'error sending sign in email for manage notifications',
      logger.utils.addErrorInfo(error, ctx.req),
    );
  }

  return {
    props: {
      email,
    },
  };
}

function EmailConfirmation(props) {
  return (
    <>
      <Head>
        <title>{gloss.title}</title>
      </Head>
      <Layout description="Notifications">
        <div className="govuk-!-margin-top-3 govuk-!-margin-bottom-0 padding-bottom40">
          <BreadCrumbs routes={breadcrumbsRoutes} />
        </div>
        <div className="govuk-grid-row govuk-body">
          <div className="govuk-grid-column-full">
            <h1
              className="govuk-heading-l"
              data-cy="cyCheckUnsubscribeEmailHeading"
              id="main-content-focus"
              tabIndex={-1}
            >
              Check your email
            </h1>
          </div>
          <div className="govuk-grid-column-two-thirds">
            <p
              className="govuk-body govuk-!-font-weight-bold"
              data-cy="cyUnsubscribeEmail"
            >
              We’ve sent an email to {props.email}
            </p>

            <p className="govuk-body govuk-!-font-weight-regular">
              Click the link in the email to confirm your email address
            </p>

            <p className="govuk-body govuk-!-font-weight-regular">
              The link will stop working after 7 days
            </p>

            <details className="govuk-details" data-module="govuk-details">
              <summary className="govuk-details__summary">
                <span className="govuk-details__summary-text">
                  Not received an email?
                </span>
              </summary>
              <div className="govuk-details__text">
                <p>Emails sometimes take a few minutes to arrive.</p>
                <p>
                  If you do not receive an email soon, check your spam or junk
                  folder.
                </p>
                <p>If you do not get an email, contact</p>
                <a
                  href="mailto:findagrant@cabinetoffice.gov.uk"
                  className="govuk-link"
                >
                  findagrant@cabinetoffice.gov.uk
                </a>
              </div>
            </details>
          </div>
        </div>
      </Layout>
    </>
  );
}

export default EmailConfirmation;
