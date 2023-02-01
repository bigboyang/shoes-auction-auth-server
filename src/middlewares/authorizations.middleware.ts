import { Request, Response, NextFunction } from 'express';
import ErrorException from '../exceptions/form.exception';
import logger from '../config/log.config';
import { badData, expiredToken, unAuthorizedToken } from '../exceptions/definition.exception';
import jwtUtils from '../utils/jwt-utils';

// accessToken 검증 관련 작업
export const verifyHeaders = async ( req: Request, res: Response, next: NextFunction ) => {
  const { authorization, authorizationPass } = req.headers;

  if ( authorizationPass === 'ok' ) {
    next();
  }

  try {
    if ( !authorization ) {
      throw new ErrorException( badData );
    }

    const token = req.headers.authorization.split( 'Bearer ' )[1]; // header에서 access token을 가져옵니다.
    const result = jwtUtils.verify( token ); // token을 검증합니다.
    
    if ( result.message === 'token expired' ) {       // 1. 만료
      throw new ErrorException ( unAuthorizedToken );
    }else if ( result.message === 'invalid token' ) { // 2. 유효하지 않은 토큰
      throw new ErrorException ( expiredToken );
    }

    // 유효한 토큰이면 헤더에 payload를 넣어줍니다.
    req.headers.userId = result.userId;
    req.headers.role = result.role;
    
    next();
  } catch ( error ) {
    logger.error( error );
    throw next( error );
  }
};
