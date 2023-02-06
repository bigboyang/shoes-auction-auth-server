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
    expiresIn: '1m', 	  // 유효기간
  });
};

const verify = ( token ) => { // access token 검증
  let result;
  try {
    result = jwt.verify( token, jwtSecret );
  } catch ( err ) {
    // ! middleware 단에서도 if문으로 에러 메세지가 어떤 값인지 체크하고 있던데,
    // ! 에러 메세지 체크를 여기서도 하고 middleware 쪽에서도 하는 건 중복 작업인 듯!
    // ! 여기서든, middleware 쪽에서든 어느 한 곳의 작업은 줄이는 게 좋은 코드일 듯!

    console.log( "err-message : " + err.message );

    if ( err.message === 'invalid signature' ) { // 1. 유효하지 않은 토큰
      console.log( "유효하지 않은 토큰" );
      throw new ErrorException ( unAuthorizedToken );
    }
    if ( err.message === 'jwt expired' ) {   // 2. 만료 체크
      console.log( "만료된 토큰" );
      throw new ErrorException ( expiredToken );
    } 
    
  }
  return result;
};

const createRefresh = () => { // refresh token 발급
  return jwt.sign({}, jwtSecret, { // refresh token은 payload 없이 발급
    algorithm: 'HS256',
    expiresIn: '10m',
  });
};

const refreshVerify = async ( token, userId ) => { // refresh token 검증

  const data = await redisClient.get( userId ); // refresh token 가져오기
    
  console.log( "data :" + data );
  // ! 밑쪽은 보기에 안 좋은 코드인 듯! 전체적인 리팩토링이 필요할 듯!
  // ! 나중에 고칠 거였다면 쏘리!
  let isValidate = true;

  if ( token != data || data === null ) {
    throw new ErrorException ( unAuthorizedToken );
  }

  try {
    jwt.verify( token, jwtSecret );
  }catch ( err ) {
    isValidate = false;
  }

  return isValidate;
};

export default { sign, verify, createRefresh, refreshVerify };
