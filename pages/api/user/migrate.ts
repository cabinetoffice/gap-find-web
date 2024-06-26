import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { logger } from '../../../src/utils';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const response = await axios({
      method: 'patch',
      url: `${process.env.BACKEND_HOST}/user/migrate`,
      data: req.body,
    });

    res.status(200).json(response.data);
  } catch (error) {
    logger.error(
      `Error migrating user ${req.body.sub}`,
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
