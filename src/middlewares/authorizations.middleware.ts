import { Request, Response, NextFunction } from 'express';
import logger from '../config/log.config';

export const verifyHeaders = async ( req: Request, res: Response, next: NextFunction ) => {
  const { authorization } = req.headers;

  try {
    console.log( 0 );
    
    next();
  } catch ( error ) {
    logger.error( error );
    throw error;
  }
};