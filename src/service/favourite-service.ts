import { GetServerSidePropsContext, NextApiRequest } from 'next';
import { axios } from '../utils/axios';
import { getJwtFromCookies } from '../utils/jwt';
import { logger } from '../utils/logger';

type Favourite = {
  id: number;
  contentfulGrantId: string;
  createdAt: string;
};

type FavouriteUser = {
  jwt: string;
  sub: string;
  email: string;
};

type Request = NextApiRequest | GetServerSidePropsContext['req'];

const favouritesUrl = () => `${process.env.BACKEND_HOST}/favourites`;

/**
 * Returns the One Login user from the request cookie, or null when One Login
 * is off or there is no usable user cookie. It does not check the session is
 * still active; use checkUserLoggedIn for that before changing data.
 */
export const getFavouriteUserFromRequest = (
  req?: Request,
): FavouriteUser | null => {
  if (process.env.ONE_LOGIN_ENABLED !== 'true' || !req) return null;

  try {
    const { jwt, jwtPayload } = getJwtFromCookies(req);
    const { sub, email } = jwtPayload;
    if (typeof sub !== 'string' || !sub) return null;
    if (typeof email !== 'string' || !email) return null;
    return { jwt, sub, email };
  } catch {
    return null;
  }
};

export const addFavourite = async ({
  sub,
  emailAddress,
  contentfulGrantId,
}: {
  sub: string;
  emailAddress: string;
  contentfulGrantId: string;
}): Promise<Favourite> => {
  const response = await axios.post<Favourite>(favouritesUrl(), {
    sub,
    emailAddress,
    contentfulGrantId,
  });
  return response.data;
};

export const getFavouriteGrantIds = async (sub: string): Promise<string[]> => {
  const response = await axios.get<Favourite[]>(
    `${favouritesUrl()}/users/${encodeURIComponent(sub)}`,
  );
  return response.data.map(({ contentfulGrantId }) => contentfulGrantId);
};

/**
 * Grant IDs the logged-in user has favourited. Returns an empty list when
 * nobody is logged in, or if the lookup fails, so search still works.
 */
export const getFavouriteGrantIdsForRequest = async (
  req?: Request,
): Promise<string[]> => {
  const user = getFavouriteUserFromRequest(req);
  if (!user) return [];

  try {
    return await getFavouriteGrantIds(user.sub);
  } catch (error) {
    logger.error(
      'Failed to fetch favourites',
      logger.utils.addErrorInfo(error, req),
    );
    return [];
  }
};
