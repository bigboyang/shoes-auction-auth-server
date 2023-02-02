import jwt from 'jsonwebtoken'; 
import envConfig from '../config/env.config';
import redisClient from './redis';

const { jwtSecret } = envConfig;

const TOKEN_EXPIRED = '-1';  // 토큰 만료
const TOKEN_INVALID = '-2';  // 유효하지 않은 토큰


// 로그인 시 사용자 정보를 토대로 access token 발급
// ! 매개변수로 객체를 받으면서, 객체 그 자체가 아니라 객체 속성만 사용할 경우에는 구조 분해 할당 형식을 많이 사용!
// ! user -> {role, userId}
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
    // ! result.ok 값을 사용하지 않는 것 같던데, 왜 있는지 모르겠음!
    result.ok = true;
    result.message = 'valid token';
  } catch ( err ) {
    result.ok = false;
    // ! middleware 단에서도 if문으로 에러 메세지가 어떤 값인지 체크하고 있던데,
    // ! 에러 메세지 체크를 여기서도 하고 middleware 쪽에서도 하는 건 중복 작업인 듯!
    // ! 여기서든, middleware 쪽에서든 어느 한 곳의 작업은 줄이는 게 좋은 코드일 듯!
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
    // ! 밑쪽은 보기에 안 좋은 코드인 듯! 전체적인 리팩토링이 필요할 듯!
    // ! 나중에 고칠 거였다면 쏘리!
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
