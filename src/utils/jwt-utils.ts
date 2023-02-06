import jwt from 'jsonwebtoken'; 
import { expiredToken, unAuthorizedToken } from '../exceptions/definition.exception';
import ErrorException from '../exceptions/form.exception';
import envConfig from '../config/env.config';
import redisClient from './redis';

const { jwtSecret } = envConfig;

const TOKEN_EXPIRED = '-1';  // 토큰 만료
const TOKEN_INVALID = '-2';  // 유효하지 않은 토큰


// 로그인 시 사용자 정보를 토대로 access token 발급
// ! 매개변수로 객체를 받으면서, 객체 그 자체가 아니라 객체 속성만 사용할 경우에는 구조 분해 할당 형식을 많이 사용!
// ! user -> {role, userId}
const sign = ({ role, userId }) => { // access token 발급
  console.log( "jwtSecret : " + jwtSecret );
  const payload = { // accesks token에 들어갈 payload
    role : role,
    userId: userId,
  };

  return jwt.sign( payload, jwtSecret, { // secret으로 sign하여 발급하고 return
    algorithm: 'HS256', // 암호화 알고리즘
    expiresIn: '1h', 	  // 유효기간
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
    expiresIn: '2h',
  });
};

const verifyRefresh = async ( token ) => { // refresh token 검증
  const { err, result } = jwt.verify( token, jwtSecret, ( err,result ) => {
    return { err, result };
  });

  return { err, result };
};

export default { sign, verify, createRefresh, verifyRefresh };
