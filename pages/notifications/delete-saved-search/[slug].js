import {
  cookieName,
  notificationRoutes,
  URL_ACTIONS,
} from '../../../src/utils/constants';
import Head from 'next/head';
import gloss from '../../../src/utils/glossary.json';
import Layout from '../../../src/components/partials/Layout';
import Link from 'next/link';
import {
  deleteSaveSearch,
  getBySavedSearchId,
} from '../../../src/service/saved_search_service';
import { decrypt } from '../../../src/utils/encryption';
import { decryptSignedApiKey } from '../../../src/service/api-key-service';
import cookieExistsAndContainsValidJwt from '../../../src/utils/cookieAndJwtChecker';
import { getJwtFromCookies } from '../../../src/utils';
import { axios } from '../../../src/utils/axios';

const redirect = (uri) => {
  return {
    redirect: {
      statusCode: 302,
      destination: uri,
    },
  };
};

async function getEmailAddressFromCookies(ctx) {
  const decodedEmailCookie = decryptSignedApiKey(
    ctx.req.cookies['currentEmailAddress'],
  );
  return decrypt(decodedEmailCookie.email);
}

const getUserId = async (ctx) => {
  if (process.env.ONE_LOGIN_ENABLED != 'true') {
    return getEmailAddressFromCookies(ctx);
  }
  const { jwtPayload } = getJwtFromCookies(ctx.req);

  return jwtPayload.sub;
};

export async function getServerSideProps(ctx) {
  if (
    process.env.ONE_LOGIN_ENABLED != 'true' &&
    !cookieExistsAndContainsValidJwt(ctx, cookieName['currentEmailAddress'])
  ) {
    return {
      redirect: {
        permanent: false,
        destination: notificationRoutes['checkEmail'],
      },
    };
  }

  const userId = await getUserId(ctx);

  let errorMessage = '';
  const slug = ctx.query.slug;

  if (ctx.req.method === 'POST') {
    try {
      const savedSearch = await getBySavedSearchId(slug);
      await deleteSaveSearch(slug, userId);
      return redirect(
        `${notificationRoutes['manageNotifications']}?action=${URL_ACTIONS.DELETE_SAVED_SEARCH}&savedSearchName=${savedSearch.name}`,
      );
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response.data.message === 'Email does not match') {
          errorMessage =
            'You do not have permission to delete this saved search.';
        } else {
          throw error;
        }
      } else {
        throw error;
      }
    }
  }

  return {
    props: { saveSearchId: slug, errorMessage: errorMessage },
  };
}

function deletingSavedSearches({ saveSearchId, errorMessage }) {
  return (
    <>
      <Head>
        <title>{`Confirm Deletion of Safe Search - ${gloss.title}`}</title>
      </Head>
      <Layout description="confirm">
        <div className="govuk-!-margin-top-3 govuk-!-margin-bottom-0 padding-bottom40">
          <a
            href={notificationRoutes.manageNotifications}
            className="govuk-back-link"
          >
            Back
          </a>
        </div>
        {errorMessage && (
          <div className="govuk-grid-row govuk-body">
            <div className="govuk-grid-column-full">
              <p className="govuk-body" data-cy="cyErrorMessage">
                {errorMessage}
              </p>
            </div>
          </div>
        )}
        {!errorMessage && (
          <div className="govuk-grid-row govuk-body">
            <div className="govuk-grid-column-full">
              <h1
                className="govuk-heading-l"
                data-cy="cyConfirmSavedSearchDelete"
                id="main-content-focus"
                tabIndex={-1}
              >
                Are you sure you want to delete this saved search?
              </h1>
              <div className="govuk-grid-row">
                <div className="govuk-grid-column-two-thirds">
                  <form
                    action={`/notifications/delete-saved-search/${saveSearchId}`}
                    method="POST"
                  >
                    <button
                      className="govuk-button"
                      data-module="govuk-button"
                      data-cy="cyDeleteConfirmationButton"
                      aria-label="Confirm delete"
                    >
                      Yes, delete
                    </button>
                  </form>
                  <Link href={notificationRoutes['manageNotifications']}>
                    <a className="govuk-link" data-cy="cyCancelUnsubscribe">
                      Cancel
                    </a>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </Layout>
    </>
  );
}
export default deletingSavedSearches;
