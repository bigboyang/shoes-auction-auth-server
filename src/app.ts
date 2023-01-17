import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { isCelebrateError } from 'celebrate';

import envConfig from './config/env.config';
import logger from './config/log.config';
import router from './routes/index.route';
import { AuthorizationMiddleware } from './middlewares';

import { resError, proxyError } from './utils/handler';
import ErrorException from './exceptions/form.exception';
import { notFoundRoute, badData } from './exceptions/definition.exception';
import { checkDbConnection } from './models/index.model';

const app: express.Application = express();

const { port, userServer, productServer, logServer } = envConfig;
const { verifyHeaders } = AuthorizationMiddleware;

// cors
const corsOptions: cors.CorsOptions = {   
  credentials: true,
  methods: [ 'GET','POST','PUT','DELETE','PATCH' ],
  preflightContinue: false,
};
app.use( cors( corsOptions ) );

// favicon 204
app.get( '/favicon.ico', ( req: Request, res: Response ) => res.sendStatus( 204 ) );

// incoming log
app.use( ({ hostname, ip, method, url, headers, body }: Request, res: Response, next: NextFunction ) => {
  logger.info({ hostname, ip, method, url, headers, body });
  next();
});

// proxy setting
app.use( '/user-service', verifyHeaders, createProxyMiddleware({ target: userServer, changeOrigin: true, pathRewrite: { ['/user-service']: '' }, logLevel: 'error', logProvider: () => logger, onError: proxyError }) );
app.use( '/product-service', verifyHeaders, createProxyMiddleware({ target: productServer, changeOrigin: true, pathRewrite: { ['/product-service']: '' }, logLevel: 'error', logProvider: () => logger, onError: proxyError }) );
app.use( '/log-service', verifyHeaders, createProxyMiddleware({ target: logServer, changeOrigin: true, pathRewrite: { ['/log-service']: '' }, logLevel: 'error', logProvider: () => logger, onError: proxyError }) );

app.use( express.json({ limit: '50mb' }) );
app.use(
  express.urlencoded({
    limit: '50mb',
    extended: false,
    parameterLimit: 1000000,
  })
);

// health check end point
app.use( '/actuator/health', ( req: Request, res: Response ) => {
  res.send({ resultCode: 0, resultMessage: 'OK' }); 
});

// service router
app.use( '/auth-service', router );

// server on
app.listen( port , async () => {
  logger.info({ serverStart : `[SERVER] Auth server start on port ${port}` });
  await checkDbConnection();
});

// Unknown route error
app.use( ( req: Request, res: Response, next: NextFunction ) => {
  return next( new ErrorException( notFoundRoute ) );
});

// celebrate exception
app.use( ( error: ErrorException, req: Request, res: Response, next: NextFunction ) => {
  if ( !isCelebrateError( error ) ) {
    return next( error );
  }
  throw new ErrorException( badData );
});

// exception middleware
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use( ( error: ErrorException, req: Request, res: Response, next: NextFunction ) => {
  resError( res, error );
});
