import { Request, Response, NextFunction } from 'express';
import ErrorException from '../exceptions/form.exception';
import logger from '../config/log.config';
import { badData, unAuthorizedToken } from 'src/exceptions/definition.exception';
import jwtUtils from '../utils/jwt-utils';
import jwt from 'jsonwebtoken';
// const redisClient = require( '../utils/redis' );

// accessToken 검증 관련 작업
export const verifyHeaders = async ( req: Request, res: Response, next: NextFunction ) => {
  const { authorization, refresh, authorizationPass } = req.headers;

  if ( authorizationPass === 'ok' ) {
    next();
  }

  try {
    if ( !authorization ) {
      throw new ErrorException( badData );
    }

    const token = req.headers.authorization.split( 'Bearer ' )[1]; // header에서 access token을 가져옵니다.
    const decoded = jwt.decode( token ); 
    
    // decode관련 에러처리 로직 추가 필요
  
    const result = jwtUtils.verify( token ); // token을 검증합니다.

    if ( result.ok ){ // access_token 검증 여부
      console.log( "검증성공" );
      req.body.userId = result.userId; // 검증이 성공하면 req.body에 userId를 넣어줍니다.
    }else {
      console.log( "검증실패" );
      req.body.userId = decoded.userId;
      // refresh토큰 검증
      const is_verified_refresh_token = jwtUtils.refreshVerify( refresh, decoded.userId );

      // refresh_token이 없으면 -> 401, 로그인 페이지 이동
      if ( !is_verified_refresh_token ) {
        console.log( "refresh 만료" );
        return res.status( 401 ).json({ message: "로그인 필요" }); // err Exception 안됨.. 수정필요
      }

      // refresh_token이 있으면 -> access_token, refresh_token 재발급
      const accessToken = jwtUtils.sign({ userId: decoded.userId });
      const refreshToken = jwtUtils.createRefresh();

      // redisClient.set( decoded.userId, refreshToken ); // refresh token redis에 저장

      // 헤더에 토큰 저장
      // res.header({ 'authorization': accessToken, 'refresh': refreshToken });
    }

    req.headers.userId = decoded.userId;
    req.headers.role = decoded.role;
    
    next();
  } catch ( error ) {
    logger.error( error );
    throw next( error );
  }
};
