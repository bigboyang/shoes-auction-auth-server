import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

import envConfig from '../config/env.config';
import logger from '../config/log.config';
import ErrorException from '../exceptions/form.exception';
import { econnrefused } from '../exceptions/definition.exception';
import { verifyHeaders } from './authorizations.middleware';

const app: express.Application = express();
const { userServer, productServer, logServer } = envConfig;

// proxy setting
app.use( '/user-service', verifyHeaders, createProxyMiddleware({
  target: userServer, 
  changeOrigin: true, 
  pathRewrite: { ['/user-service']: '' }, 
  logLevel: 'error', 
  logProvider: () => logger, 
  onError: ( error ) => {
    logger.error( error ); 
    throw new ErrorException( econnrefused ); }, 
}) );
app.use( '/log-service', verifyHeaders, createProxyMiddleware({
  target: logServer, 
  changeOrigin: true, 
  pathRewrite: { ['/log-service']: '' }, 
  logLevel: 'error', 
  logProvider: () => logger, 
  onError: ( error ) => {
    logger.error( error ); 
    throw new ErrorException( econnrefused ); }, 
}) );
app.use( '/product-service', verifyHeaders, createProxyMiddleware({
  target: productServer,
  changeOrigin: true, 
  pathRewrite: { ['/product-service']: '' }, 
  logLevel: 'error', 
  logProvider: () => logger, 
  onError: ( error ) => {
    logger.error( error );
    throw new ErrorException( econnrefused ); }, 
}) );

export default app;
