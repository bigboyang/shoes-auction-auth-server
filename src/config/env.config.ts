import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const envConfig = {
  // env
  env: process.env.ENV,
  
  // port
  port: process.env.AUTH_PORT || 3000,
  
  // another server url
  authServer: process.env.AUTH_SERVER_ADDRESS,
  userServer: process.env.USER_SERVER_ADDRESS,
  productServer: process.env.PRODUCT_SERVER_ADDRESS,
  logServer: process.env.LOG_SERVER_ADDRESS,

  jwtSecret: process.env.JWT_SECRET,
};

export default envConfig;
