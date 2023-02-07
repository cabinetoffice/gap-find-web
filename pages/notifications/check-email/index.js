import Head from 'next/head';
import { BreadCrumbs } from '../../../src/components/breadcrumbs/BreadCrumbs';
import ErrorBanner from '../../../src/components/displayErrors/errorBanner/ErrorBanner';
import SpecificErrorMessage from '../../../src/components/displayErrors/specificMessageError/SpecificErrorMessage';
import { InsetText } from '../../../src/components/inset-text/InsetText';
import Layout from '../../../src/components/partials/Layout';
import RelatedContent from '../../../src/components/related-content';
import { cookieName, notificationRoutes } from '../../../src/utils/constants';
import cookieExistsAndContainsValidJwt from '../../../src/utils/cookieAndJwtChecker';
import gloss from '../../../src/utils/glossary.json';
import { getValidationErrorsFromQuery } from '../../../src/utils/request';

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
];

export async function getServerSideProps(context) {
  const { query } = context;
  if (
    cookieExistsAndContainsValidJwt(context, cookieName['currentEmailAddress'])
  ) {
    return {
      redirect: {
        permanent: false,
        destination: notificationRoutes['manageNotifications'],
      },
    };
  }

  return {
    props: {
      errors: query['errors[]']
        ? getValidationErrorsFromQuery(query['errors[]'])
        : [],
      previousValue: query.email ? query.email : '',
    },
  };
}

const notifications = (props) => {
  const { errors } = props;
  const { previousValue } = props;
  const titleContent =
    errors.length > 0 ? `Error: ${gloss.title}` : gloss.title;

  return (
    <>
      <Head>
        <title>{titleContent}</title>
      </Head>
      <Layout description="Notifications">
        <div className="govuk-!-margin-top-3 govuk-!-margin-bottom-0 padding-bottom40">
          <BreadCrumbs routes={breadcrumbsRoutes} />
        </div>

        <ErrorBanner errors={errors} />

        <div className="govuk-grid-row govuk-body">
          <div className="govuk-grid-column-full">
            <h1
              className="govuk-heading-l"
              data-cy="cyUnsubscribeTitle"
              id="main-content-focus"
              tabIndex={-1}
            >
              Manage notifications and saved searches
            </h1>
          </div>

          <div className="govuk-grid-column-two-thirds">
            <p className="govuk-body" data-cy="cyUnsubscribeInfo">
              If you have signed up for updates or saved searches, you can
              unsubscribe here.
            </p>
            <InsetText>
              You cannot use this page to sign up for updates or saved searches
            </InsetText>
            <form action={notificationRoutes['emailConfirmation']}>
              <div
                className={`govuk-form-group ${
                  errors.length > 0 ? 'govuk-form-group--error' : ''
                }`}
                data-testid="red-banner"
                data-cy="cyManageNotificationsInputValidationError"
              >
                <SpecificErrorMessage errors={errors} errorType={'email'} />

                <p>
                  For security, we need you to confirm your email address before
                  you can manage your notifications and saved searches.
                </p>

                <label className="govuk-label" htmlFor="email">
                  <b>Email address</b>
                </label>

                <input
                  className={`govuk-input govuk-input--width-20 ${
                    errors.some((error) => error.field === 'email')
                      ? 'govuk-input--error'
                      : ''
                  }`}
                  id="email"
                  name="email"
                  type="text"
                  data-cy="cyManageNotificationsEmailInput"
                  data-testid="email"
                  defaultValue={previousValue}
                  aria-label="Enter your email address"
                  placeholder="Enter your email address"
                />
              </div>
              <button
                className="govuk-button"
                data-module="govuk-button"
                data-cy="cyManageNotificationsSubmitButton"
                aria-label="Submit email address"
              >
                Continue
              </button>
            </form>
          </div>

          <RelatedContent
            links={[{ title: 'Browse all grants', href: '/grants' }]}
          />
        </div>
      </Layout>
    </>
  );
};

export default notifications;
