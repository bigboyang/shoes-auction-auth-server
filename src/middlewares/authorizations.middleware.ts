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

  if ( !authorization ) {
    throw new ErrorException( badData );
  }

  const token = authorization.split( 'Bearer ' )[1]; // header에서 access token을 가져옵니다.
  const result = jwtUtils.verify( token ); // token을 검증합니다.
    
  // 유효한 토큰이면 헤더에 payload를 넣어줍니다.
  req.headers.userId = result.userId;
  req.headers.role = result.role;
    
  next();
};
