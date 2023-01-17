import { Request, Response, NextFunction } from 'express';
import logger from '../config/log.config';
import ErrorException from '../exceptions/form.exception';
import { econnrefused } from '../exceptions/definition.exception';

export const resSuccess = ( res: Response, resultMessage: any ) => {
  logger.info({ status: 200, resultCode: 0, resultMessage });
  res.status( 200 ).json({ resultCode: 0, resultMessage });
};

export const resError = ( res: Response, error: any ) => {
  const status = error?.status ||  500;
  const resultCode = error?.resultCode || 19999;
  const resultMessage = error?.resultMessage || "undefined error";
  logger.error({ stack: error.stack });
  logger.error({ status, resultCode, resultMessage });
  res.status( status ).json({ resultCode, resultMessage });
};

export const proxyError = ( err, req, res ) => {
  resError( res, new ErrorException( econnrefused ) );
};

export const responseWrapper = ( func ) => async ( req: Request, res: Response, next: NextFunction ) => {
  try {
    await func( req, res );
  } catch ( error ) {
    next( error );
  }
};

export const middleWareWrapper = ( func ) => async ( req: Request, res: Response, next: NextFunction ) => {
  try {
    await func();
    next();
  } catch ( error ) {
    next( error );
  }
};
