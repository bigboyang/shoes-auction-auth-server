import jwt from 'jsonwebtoken'; 
import { expiredToken, unAuthorizedToken } from '../exceptions/definition.exception';
import ErrorException from '../exceptions/form.exception';
import envConfig from '../config/env.config';
import redisClient from './redis';

const { jwtSecret } = envConfig;

const TOKEN_EXPIRED = '-1';  // 토큰 만료
const TOKEN_INVALID = '-2';  // 유효하지 않은 토큰

const sign = ({ role, userId }) => { // access token 발급
  console.log( "jwtSecret : " + jwtSecret );
  const payload = { // accesks token에 들어갈 payload
    role : role,
    userId: userId,
  };

  return jwt.sign( payload, jwtSecret, { // secret으로 sign하여 발급하고 return
    algorithm: 'HS256', // 암호화 알고리즘
    expiresIn: '45d', 	  // 유효기간
  });
};

const verify = ( token ) => { // access token 검증

  const result = jwt.verify( token, jwtSecret, ( err, result ) => {
    return { err, result };
  });
  return result;
};

const createRefresh = () => { // refresh token 발급
  return jwt.sign({}, jwtSecret, { // refresh token은 payload 없이 발급
    algorithm: 'HS256',
    expiresIn: '90d',
  });
};

const verifyRefresh = async ( token ) => { // refresh token 검증
  const { err, result } = jwt.verify( token, jwtSecret, ( err ,result ) => {
    console.log( "err : " + err );
    console.log( "result : " + result );
    return { err, result };
  });

  return { err, result };
};

export default { sign, verify, createRefresh, verifyRefresh };
