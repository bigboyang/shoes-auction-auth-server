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
    
  // ! 논리적으로 유효하지 않은 토큰 체크가 먼저 되고 만료 체크는 그 다음일 듯.
  // ! 그리고 else if는 괜히 헷갈리니까 꼭 필요한 경우 아니면 나는 잘 안 씀ㅎㅎ
  // ! 지금 같은 경우는 else if 안 쓰더라도 상관 없으니까 제거ㅎㅎ
  if ( result.message === 'invalid token' ) { // 1. 유효하지 않은 토큰
    throw new ErrorException ( unAuthorizedToken );
  }
  if ( result.message === 'token expired' ) { // 2. 만료 체크
    throw new ErrorException ( expiredToken );
  }

  // 유효한 토큰이면 헤더에 payload를 넣어줍니다.
  req.headers.userId = result.userId;
  req.headers.role = result.role;
    
  next();
};
