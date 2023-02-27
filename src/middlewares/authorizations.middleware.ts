import { Request, Response, NextFunction } from 'express';
import ErrorException from '../exceptions/form.exception';
import { badData, expiredToken, unAuthorizedToken } from '../exceptions/definition.exception';
import jwtUtils from '../utils/jwt-utils';

// accessToken 검증 관련 작업
export const verifyHeaders = async ( req: Request, res: Response, next: NextFunction ) => {
  try {

    const { authorization, authorizationPass } = req.headers;

    if ( authorizationPass === 'ok' ) {
      next();
    }
    if ( !authorization ) {
      throw new ErrorException( badData );
    }
  
    const token = authorization.split( 'Bearer ' )[1]; // header에서 access token을 가져옵니다.
    const { err, result } = jwtUtils.verify( token ); // token을 검증합니다.
    if ( err.message === 'invalid signature' ) { // 1. 유효하지 않은 토큰
      console.log( "유효하지 않은 토큰" );
      throw new ErrorException ( unAuthorizedToken );
    }
    if ( err.message === 'jwt expired' ) {   // 2. 만료 체크
      console.log( "만료된 토큰" );
      throw new ErrorException ( expiredToken );
    } 
      
    // 유효한 토큰이면 헤더에 payload를 넣어줍니다.
    req.headers.userUuid = result.userUuid;
    req.headers.role = result.role;
      
    next();
  }catch ( err ) {
    next( err );
  }
};
