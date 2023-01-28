const { promisify } = require( 'util' );
const jwt = require( 'jsonwebtoken' );
const redisClient = require( './redis' );
const secret = 'secret';

module.exports = {

  // 로그인 시 사용자 정보를 토대로 access token 발급
  sign: ( user ) => { // access token 발급
    const payload = { // access token에 들어갈 payload
      userId: user.userId,
    };

    return jwt.sign( payload, secret, { // secret으로 sign하여 발급하고 return
      algorithm: 'HS256', // 암호화 알고리즘
      expiresIn: '1h', 	  // 유효기간
    });
  },

  verify: ( token ) => { // access token 검증
    let decoded = null;
    console.log( "verify token : " + token );
    try {
      decoded = jwt.verify( token, secret );
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
  },

  refresh: () => { // refresh token 발급
    return jwt.sign({}, secret, { // refresh token은 payload 없이 발급
      algorithm: 'HS256',
      expiresIn: '2h',
    });
  },

  refreshVerify: async ( token, userId ) => { // refresh token 검증

    const data = await redisClient.get( userId ); // refresh token 가져오기

    try {
      console.log( "data :" + data );
      if ( token === data ) { // header의 refresh token과 redis의 refresh token이 같은지 확인
        try {
          jwt.verify( token, secret );
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
  },
  
};
