import bodyParser from 'body-parser';
import { GetServerSidePropsContext } from 'next';
import util from 'util';

const middleware = util.promisify(bodyParser.urlencoded({ extended: true }));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function parseBody<B = any>(
  req: GetServerSidePropsContext['req'],
  res: GetServerSidePropsContext['res'],
) {
  await middleware(req, res);
  return (req as typeof req & { body: B }).body;
}
