import type { NextApiRequest, NextApiResponse } from 'next';
import { getSessionIdFromCookies } from '../../src/utils/session';
import axios from 'axios';

const Logout = async (req: NextApiRequest, res: NextApiResponse) => {
  const sessionCookie = getSessionIdFromCookies(req);
  if (sessionCookie) await logoutAdmin(sessionCookie);

  res.setHeader(
    'Set-Cookie',
    `session_id=deleted; Path=/; secure; HttpOnly; SameSite=Strict; expires=Thu, 01 Jan 2003 00:00:00 GMT`,
  );
  res.redirect(302, process.env.V2_LOGOUT_URL);
};

const axiosSessionConfig = (sessionId: string) => ({
  withCredentials: true,
  headers: {
    Cookie: `SESSION=${sessionId};`,
  },
});

const logoutAdmin = async (sessionCookie: string) =>
  axios.delete(
    `${process.env.ADMIN_BACKEND_HOST}/logout`,
    axiosSessionConfig(sessionCookie),
  );

export default Logout;
