// eslint-disable-next-line @next/next/no-server-import-in-page
import { NextRequest, NextResponse } from 'next/server';
import { v4 } from 'uuid';
import { logger } from './src/utils';
import { HEADERS } from './src/utils/constants';

const asObject = (entries: IterableIterator<[string, string]>) =>
  Array.from(entries)
    .filter(([key]) => !(key === 'cookie'))
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {} as object);

const formatRequest = (req: NextRequest) => ({
  url: req.url,
  method: req.method,
  cookies: Array.from(req.cookies.values()).filter(
    (value) => !value.startsWith('user-service-token'),
  ),
  headers: asObject(req.headers.entries()),
});

const formatResponse = (res: NextResponse) => ({
  url: res.url,
  status: res.status,
  headers: asObject(res.headers.entries()),
});

export const middleware = async (req: NextRequest) => {
  const correlationId = v4();
  req.headers.set(HEADERS.CORRELATION_ID, correlationId);
  logger.http('Incoming request', { ...formatRequest(req), correlationId });
  const res = NextResponse.next();
  logger.http('Outgoing response', { ...formatResponse(res), correlationId });
};
