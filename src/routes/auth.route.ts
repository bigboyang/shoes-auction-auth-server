import { Router, Request, Response } from 'express';
import ErrorException from '../exceptions/form.exception';
import { badRequest, badData, unAuthorized } from '../exceptions/definition.exception';
import { resSuccess, responseWrapper } from '../utils/handler';
import { AuthorizationService } from '../services';
import { verifyHeaders } from '../middlewares/authorizations.middleware';
// const redisClient = require( '../utils/redis' );
import jwtUtils from '../utils/jwt-utils';
import redisClient from '../utils/redis';

const router = Router();

router.get( '/authorization/:userUuid', responseWrapper( async ( req: Request, res: Response ) => {
  const { userUuid } = req.params;
  
  if ( !userUuid ) {
    throw new ErrorException( badData );
  }

  console.log( userUuid );
  resSuccess( res, { result: userUuid });
}) );

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

// access, refresh token 재발급 - 미완성
router.get( '/reissuance', responseWrapper( async ( req: Request, res: Response ) => {
  const { refresh } = req.headers;
  const { userId } = req.query;

  // refresh token 검증
  const isValidToken = await jwtUtils.refreshVerify( refresh, userId as string );
  if ( !isValidToken ) {
    throw new ErrorException( unAuthorized );
  }

  const accessToken = jwtUtils.sign( req.body );
  const refreshToken = jwtUtils.createRefresh();
  await redisClient.set( userId as string, refreshToken ); // refresh token redis에 저장

  resSuccess( res , { accessToken, refreshToken });
}) );

// 헤더 테스트
router.get( '/header', verifyHeaders, responseWrapper( async ( req: Request, res: Response ) => {

  console.log( 3 );
  resSuccess( res, { result: req.body.userId });
}) );


export default router;
