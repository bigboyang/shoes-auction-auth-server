import jwt from 'jsonwebtoken'; 
import ErrorException from 'src/exceptions/form.exception';
import envConfig from '../config/env.config';
import redisClient from './redis';

const { jwtSecret } = envConfig;

const TOKEN_EXPIRED = '-1';  // 토큰 만료
const TOKEN_INVALID = '-2';  // 유효하지 않은 토큰


// 로그인 시 사용자 정보를 토대로 access token 발급
const sign = ( user ) => { // access token 발급
  console.log( "jwtSecret : " + jwtSecret );
  const payload = { // accesks token에 들어갈 payload
    role : user.role,
    userId: user.userId,
  };

  return jwt.sign( payload, jwtSecret, { // secret으로 sign하여 발급하고 return
    algorithm: 'HS256', // 암호화 알고리즘
    expiresIn: '1h', 	  // 유효기간
  });
};

const verify = ( token ) => { // access token 검증
  let result;
  try {
    result = jwt.verify( token, jwtSecret );
    result.ok = true;
    result.message = 'valid token';
  } catch ( err ) {
    result.ok = false;
    if ( err.message === 'jwt expired' ) {
      result.message = 'token expired';
    } else {
      result.message = 'invalid token';
    }
  }
  return result;
};

const createRefresh = () => { // refresh token 발급
  return jwt.sign({}, jwtSecret, { // refresh token은 payload 없이 발급
    algorithm: 'HS256',
    expiresIn: '2h',
  });
};

const refreshVerify = async ( token, userId ) => { // refresh token 검증

  const data = await redisClient.get( userId ); // refresh token 가져오기
    
  try {
    console.log( "data :" + data );
    if ( token === data ) { // header의 refresh token과 redis의 refresh token이 같은지 확인
      try {
        jwt.verify( token, jwtSecret );
        return true;
      } catch ( err ) {
        return false;
      }
    } else {
      return false;
    }
  } catch ( err ) {
    return false;
  }
};

export default { sign, verify, createRefresh, refreshVerify };
