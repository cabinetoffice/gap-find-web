import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { decodeJwt } from 'jose';
import { logger } from '../../../src/utils';
import { checkUserLoggedIn } from '../../../src/service/user-service';

const hasSuperAdminRole = (roles: unknown) =>
  Array.isArray(roles)
    ? roles.includes('SUPER_ADMIN')
    : typeof roles === 'string' && roles.includes('SUPER_ADMIN');

// Only user-service calls this route, when a super admin deletes a user. It
// sends the super admin's user token as a Bearer token, which is checked the
// same way gap-find-admin-backend's delete user route checks it.
const getAuthError = async (
  authorization: string | undefined,
): Promise<{ status: number; message: string } | null> => {
  if (!authorization?.startsWith('Bearer ')) {
    return {
      status: 401,
      message: 'Delete user: Expected Authorization header not provided',
    };
  }

  const jwt = authorization.slice('Bearer '.length);
  const isValid = await checkUserLoggedIn(jwt);
  if (isValid !== true) {
    return { status: 401, message: 'Delete user: Token is not valid' };
  }

  // Safe to read once user-service has confirmed the token is genuine
  if (!hasSuperAdminRole(decodeJwt(jwt).roles)) {
    return { status: 403, message: 'User not authorised to delete users' };
  }

  return null;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const authError = await getAuthError(req.headers.authorization);
    if (authError) {
      logger.error(authError.message, logger.utils.addErrorInfo({}, req));
      return res.status(authError.status).json({ error: authError.message });
    }

    const queryParams: { [key: string]: string } = {};
    if (req.query?.sub) {
      queryParams.sub = req.query.sub as string;
    }
    if (req.query?.email) {
      queryParams.email = req.query.email as string;
    }

    const response = await axios({
      method: 'delete',
      url: `${process.env.BACKEND_HOST}/user/delete`,
      params: queryParams,
    });

    res.status(200).json(response.data);
  } catch (error) {
    logger.error(
      `Error deleting user ${req.query}`,
      logger.utils.addErrorInfo(error, req),
    );

    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({
        error,
      });
    }
  }
}
