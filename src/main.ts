import * as express from 'express';
import * as fs from 'fs';
import * as https from 'https';
import * as http from 'http';
import * as session from 'express-session';
import * as cookieParser from 'cookie-parser';
import * as expressHttpToHttps from 'express-http-to-https';

import { NestApplicationOptions } from '@nestjs/common';
import { SwaggerModule, SwaggerDocumentOptions } from '@nestjs/swagger';
import { DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { ExpressAdapter } from '@nestjs/platform-express';
import { NestFactory } from '@nestjs/core';

import AppModule from './app.module';

async function buildDocument(app) {
  const configService = app.get(ConfigService);

  const config = new DocumentBuilder()
    .setTitle('RC-Box API documents')
    // .setDescription('')
    .setVersion(configService.get('COMMON.VERSION'))
    .addBearerAuth()
    .build();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const options: SwaggerDocumentOptions = {
    deepScanRoutes: true,
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
  };
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('document', app, document);
  return app;
}

async function nestServer() {
  const httpsOptions = {
    key: fs.readFileSync('./secrets/letsencrypt/privkey.pem'),
    cert: fs.readFileSync('./secrets/letsencrypt/cert.pem'),
  };
  const options = {} as NestApplicationOptions;
  if (process.env.NODE_ENV === 'development') {
    options.cors = true;
  } else {
    options.httpsOptions = httpsOptions;
  }
  const app = await NestFactory.create(AppModule, options);

  const configService = app.get(ConfigService);
  app.setGlobalPrefix('api');

  app.use(cookieParser());
  app.use(session(configService.get('SESSION')));

  if (configService.get('COMMON.DOCUMENT_ENABLE') === true) {
    buildDocument(app);
  }

  if (process.env.NODE_ENV === 'development') {
    await app.listen(3000);
  } else {
    app.use(expressHttpToHttps.redirectToHTTPS());
    await app.listen(443);
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function expressServers() {
  const httpsOptions = {
    key: fs.readFileSync('./secrets/letsencrypt/privkey.pem'),
    cert: fs.readFileSync('./secrets/letsencrypt/cert.pem'),
  };

  const server = express();
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));
  const configService = app.get(ConfigService);
  app.setGlobalPrefix('api');
  // app.enableCors(); // enable CORS
  // TODO enable CORS need white list.

  app.use(cookieParser());
  app.use(session(configService.get('SESSION')));

  if (configService.get('COMMON.DOCUMENT_ENABLE') === true) {
    buildDocument(app);
  }

  await app.init();

  http.createServer(server).listen(80);
  https.createServer(httpsOptions, server).listen(443);
}

nestServer();

/*
 * 透過 express 同時開 http, https server
 TODO iot模組目前call 送 log的 api 是透過http，要換成https
 */
// expressServers();
