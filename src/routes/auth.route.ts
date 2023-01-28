import { Router, Request, Response } from 'express';
import { Joi, Segments, celebrate } from 'celebrate';

import ErrorException from '../exceptions/form.exception';
import { badRequest, badData, unAuthorized } from '../exceptions/definition.exception';
import { resSuccess, responseWrapper } from '../utils/handler';
import { AuthorizationService } from 'src/services';
import { verifyHeaders } from '../middlewares/authorizations.middleware';
// const redisClient = require( '../utils/redis' );
const jwtUtils = require( '../utils/jwt-utils' );

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
router.post( '/login', responseWrapper( async ( req: Request, res: Response ) => {
  const { userId, password } = req.body;

  if ( !userId || !password ) {
    throw new ErrorException( badRequest );
  }

  // user-server에서 유저 정보 가져오기
  const success = true;

  if ( !success ) {
    throw new ErrorException( unAuthorized );
  }

  const accessToken = jwtUtils.sign( req.body );
  const refreshToken = jwtUtils.refresh();

  res.header({ 'Authorization': accessToken, 'refresh': refreshToken });

  // redisClient.set( userId, refreshToken ); // refresh token redis에 저장
  resSuccess( res , { access_token: accessToken, refresh_token : refreshToken });
}) );

// 헤더 테스트
router.get( '/header', verifyHeaders, responseWrapper( async ( req: Request, res: Response ) => {

  console.log( 3 );
  resSuccess( res, { result: req.body.userId });
}) );


export default router;
