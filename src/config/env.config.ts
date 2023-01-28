import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const envConfig = {
  // env
  env: process.env.ENV,
  
  // port
  port: process.env.AUTH_PORT || 3000,

  // db
  database: process.env.AUTH_MYSQL_DB,
  username: process.env.AUTH_MYSQL_DB_USER,
  password: process.env.AUTH_MYSQL_DB_PASSWORD,
  host: process.env.AUTH_MYSQL_DB_HOST,
  dbPort: process.env.AUTH_MYSQL_DB_PORT,
  
  // another server url
  authServer: process.env.AUTH_SERVER_ADDRESS,
  userServer: process.env.USER_SERVER_ADDRESS,
  productServer: process.env.PRODUCT_SERVER_ADDRESS,
  logServer: process.env.LOG_SERVER_ADDRESS,

  jwtSecret: process.env.JWT_SECRET,
  
  // mq
  // mqServerAddress: process.env.MQ_SERVER_ADDRESS,
  // mqServerQueueName: process.env.MQ_SERVER_QUEUENAME,
};

export default envConfig;
