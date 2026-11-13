import { NextApiRequest, NextApiResponse } from 'next';
import { checkUserLoggedIn } from '../../../src/service/user-service';
import {
  addFavourite,
  getFavouriteUserFromRequest,
} from '../../../src/service/favourite-service';
import { FAVOURITE_QUERY_PARAMS } from '../../../src/utils/constants';
import { isFavouritesEnabled } from '../../../src/utils/featureFlags';
import { logger } from '../../../src/utils/logger';

const SEARCH_PAGE = '/grants';
const CONTENTFUL_ID_REGEX = /^[A-Za-z0-9_-]{1,64}$/;

/**
 * Sends the user back to the search results they came from, keeping their
 * search and filters. Only the search page path is ever used, so this can't
 * redirect anywhere else.
 */
export const buildReturnUrl = (
  referer: string | undefined,
  result?: { param: string; grantId: string },
) => {
  const target = new URL(SEARCH_PAGE, 'http://localhost');

  try {
    const previous = new URL(referer ?? '');
    if (previous.pathname === SEARCH_PAGE) target.search = previous.search;
  } catch {
    // No referer or not a URL: fall back to the search page
  }

  Object.values(FAVOURITE_QUERY_PARAMS).forEach((param) =>
    target.searchParams.delete(param),
  );
  if (result) target.searchParams.set(result.param, result.grantId);

  return `${target.pathname}${target.search}`;
};

const isLoggedIn = async (jwt: string, req: NextApiRequest) => {
  try {
    return Boolean(await checkUserLoggedIn(jwt));
  } catch (error) {
    logger.error(
      'Failed to check user is logged in',
      logger.utils.addErrorInfo(error, req),
    );
    return false;
  }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (!isFavouritesEnabled()) return res.status(404).end();

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const user = getFavouriteUserFromRequest(req);
  if (!user || !(await isLoggedIn(user.jwt, req))) {
    return res.redirect(303, process.env.APPLICANT_HOST);
  }

  const grantId =
    typeof req.body?.grantId === 'string' ? req.body.grantId.trim() : '';
  if (!CONTENTFUL_ID_REGEX.test(grantId)) {
    return res.redirect(303, buildReturnUrl(req.headers.referer));
  }

  try {
    await addFavourite({
      sub: user.sub,
      emailAddress: user.email,
      contentfulGrantId: grantId,
    });
  } catch (error) {
    logger.error(
      'Failed to add favourite',
      logger.utils.addErrorInfo(error, req),
    );
    return res.redirect(
      303,
      buildReturnUrl(req.headers.referer, {
        param: FAVOURITE_QUERY_PARAMS.ERROR,
        grantId,
      }),
    );
  }

  return res.redirect(
    303,
    buildReturnUrl(req.headers.referer, {
      param: FAVOURITE_QUERY_PARAMS.ADDED,
      grantId,
    }),
  );
}
