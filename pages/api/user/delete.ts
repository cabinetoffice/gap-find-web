import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { logger } from '../../../src/utils';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
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
