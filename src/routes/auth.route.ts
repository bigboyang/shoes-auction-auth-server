import { Router, Request, Response } from 'express';
import ErrorException from '../exceptions/form.exception';
import { badData, unAuthorizedToken, expiredToken } from '../exceptions/definition.exception';
import { resSuccess, responseWrapper } from '../utils/handler';
import { verifyHeaders } from '../middlewares/authorizations.middleware';
import jwtUtils from '../utils/jwt-utils';
import redisClient from '../utils/redis';

const router = Router();

// 로그인 - 토큰 발급
router.post( '/tokens', responseWrapper( async ( req: Request, res: Response ) => {

  const { userId, role } = req.body;

  if ( !userId || !role ) {
    throw new ErrorException( badData );
  }

  const accessToken = jwtUtils.sign( req.body );
  const refreshToken = jwtUtils.createRefresh();
  await redisClient.set( userId, refreshToken ); // refresh token redis에 저장

  resSuccess( res , { accessToken, refreshToken });
}) );

// access, refresh token 재발급 - 미완성 (시간에 따른 재발급은 미구현)
router.get( '/reissuance', responseWrapper( async ( req: Request, res: Response ) => {
  const { refresh } = req.headers;
  const { role ,userId } = req.query;

  const dbRefreshToken = await redisClient.get( userId as string ); // refresh token 가져오기
  if ( dbRefreshToken === null || refresh != dbRefreshToken ) {
    throw new ErrorException ( unAuthorizedToken );
  }

  const accessToken = jwtUtils.sign({ role ,userId });
  let refreshToken = '';

  // refresh token 검증, 시간추가 로직 필요
  const { err, result } = await jwtUtils.verifyRefresh( refresh );
  if ( !!err && err.message === 'invalid signature' ) { // 1. 유효하지 않은 토큰
    console.log( "유효하지 않은 토큰" );
    throw new ErrorException ( unAuthorizedToken );
  }
  if ( !!err && err.message === 'jwt expired' ) {      // 2. 만료 체크
    console.log( "만료된 토큰" );
    throw new ErrorException ( expiredToken );
  }
  if ( result.exp - result.iat < 60 * 60 * 24 * 7 ) { // 3. 만료기간이 7일 미만이면 재발급
    refreshToken = jwtUtils.createRefresh();
    await redisClient.set( userId as string, refreshToken ); // refresh token redis에 저장
  }
  

  resSuccess( res , { accessToken, refreshToken });
}) );

// 헤더 테스트
router.get( '/header', verifyHeaders, responseWrapper( async ( req: Request, res: Response ) => {

  console.log( 3 );
  resSuccess( res, { result: req.body.userId });
}) );


export default router;
