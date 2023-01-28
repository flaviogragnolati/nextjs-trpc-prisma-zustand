import _ from 'lodash';
import { NextApiRequest, NextApiResponse } from 'next';

import C from '@/constants';
import { logger } from '@/logger';
import Errors, { CustomError } from '@/errors';
import { HttpStatusCode } from '@/types';

const DEFAULT_ERROR_CODE = HttpStatusCode.internalServerError;
const DEFAULT_ERROR_MESSAGE = 'Internal Server Error';

export async function apiRouteHandler<T extends any>(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<T>,
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const result = await handler(req, res);
      return res.status(200).json(result);
    } catch (error) {
      //   assertError(error);
      return uncatchedHandled(error as any, req, res);
    }
  };
}

function assertError(error: any): asserts error is Error {
  if (!(error instanceof Error)) {
    throw new Error('Unknow error');
  }
}

const uncatchedHandled = (
  error: Error,
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  if (error instanceof CustomError) {
    if (!error.code || !_.isNumber(error.code)) {
      error.code = DEFAULT_ERROR_CODE;
    }
    return res.status(error.code).send(error.toJson());
  }

  logger.error(`Uncatched error at ${req.url}. Error: ${error.message}x`);

  return res
    .status(DEFAULT_ERROR_CODE)
    .send(
      new Errors.InternalServerError(
        error.message || DEFAULT_ERROR_MESSAGE,
      ).toJson(),
    );
};
