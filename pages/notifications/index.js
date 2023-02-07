import Link from 'next/link';
import Layout from '../../src/components/partials/Layout';
import Head from 'next/head';
import { useRouter } from 'next/router';
import gloss from '../../src/utils/glossary.json';
import nookies from 'nookies';
import { notificationRoutes } from '../../src/utils/constants';
import OneColumnAside from '../../src/components/partials/oneColumnAside';

export async function getServerSideProps(context) {
  const { currentEmailAddress } = nookies.get(context);
  let currentEmailObj = {};
  if (currentEmailAddress) {
    currentEmailObj = {
      currentEmailAddress,
    };
  }
  return {
    props: {
      currentEmailObj,
    },
  };
}

function Notifications(props) {
  const {
    currentEmailObj: { emailAddress },
  } = props;

  const router = useRouter();

  return (
    <>
      <Head>
        <title>Manage Updates - Find a grant</title>
      </Head>
      <Layout description="Notifications">
        <div className="govuk-!-margin-top-3 govuk-!-margin-bottom-0 padding-bottom40">
          <a
            onClick={() => router.back()}
            className="govuk-back-link"
            data-testid="govuk-back"
          >
            {gloss.buttons.back}
          </a>
        </div>
        <div className="govuk-grid-row govuk-body">
          <div className="govuk-grid-column-full">
            <h1
              className="govuk-heading-l"
              id="main-content-focus"
              tabIndex={-1}
            >
              Get updates about a grant
            </h1>
          </div>

          <div className="govuk-grid-column-two-thirds">
            <p className="govuk-body">
              You can choose to get updates about any grant. Updates are always
              sent by email.
            </p>
            <p>Updates include changes to :</p>
            <ul className="govuk-list govuk-list--bullet">
              <li>dates and grant deadlines</li>
              <li>the eligibility criteria</li>
            </ul>
            <p>
              We will also email you when a grant is near to its closing date.
            </p>
            <h2 className="govuk-heading-m">Manage your updates</h2>
            <p>
              See all your updates in one place. You can unsubscribe here too.{' '}
            </p>
            <p>
              <Link
                href={
                  emailAddress
                    ? notificationRoutes['manageNotifications']
                    : notificationRoutes['checkEmail']
                }
              >
                <a
                  className="govuk-link govuk-link--no-visited-state"
                  data-cy="ct"
                >
                  Manage your updates
                </a>
              </Link>
            </p>
            <h2 className="govuk-heading-m">Get support</h2>
            <p>
              If you do not get our updates, check your spam or junk folder.
            </p>
            <p>
              If you need help signing up for an update, email <br />
              <Link href="#">
                <a
                  className="govuk-link govuk-link--no-visited-state"
                  data-cy="ct"
                >
                  govtgrantscommunity@cabinetoffice.gov.uk
                </a>
              </Link>
              .
            </p>
          </div>

          <OneColumnAside
            title="Related link"
            links={[{ label: 'Browse all grants', link: '/grants' }]}
          />
        </div>
      </Layout>
    </>
  );
}

export default Notifications;
