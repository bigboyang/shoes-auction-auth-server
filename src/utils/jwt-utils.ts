// import { promisify } from 'util';
import jwt from 'jsonwebtoken'; 
// const redisClient = require( './redis' );
import envConfig from '../config/env.config';

const { jwtSecret } = envConfig;

// 로그인 시 사용자 정보를 토대로 access token 발급
const sign = ( user ) => { // access token 발급
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
  console.log( "verify token : " + token );
  try {
    const decoded = jwt.verify( token, jwtSecret );
    return {
      ok: true,
      userId: decoded.userId,
    };
  } catch ( err ) {
    return {
      ok: false,
      message: err.message,
    };
  }
};

const createRefresh = () => { // refresh token 발급
  return jwt.sign({}, jwtSecret, { // refresh token은 payload 없이 발급
    algorithm: 'HS256',
    expiresIn: '2h',
  });
};

const refreshVerify = async ( token, userId ) => { // refresh token 검증

  // const data = await redisClient.get( userId ); // refresh token 가져오기
  const data = "";
    
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
