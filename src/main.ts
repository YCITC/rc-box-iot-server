import { SwaggerModule, SwaggerDocumentOptions } from '@nestjs/swagger';
import { DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { ExpressAdapter } from '@nestjs/platform-express';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import * as fs from 'fs';
import * as express from 'express';
import * as https from 'https';
import * as http from 'http';

async function buildDocument(app) {
  const configService = app.get(ConfigService);

  const config = new DocumentBuilder()
    .setTitle('RC-Box API documents')
    // .setDescription('')
    .setVersion(configService.get('common.VERSION'))
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

async function httpServer() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.setGlobalPrefix('api');
  // app.enableCors(); //enable CORS

  const configService = app.get(ConfigService);
  if (configService.get('common.DOCUMENT_ENABLE') === true) {
    buildDocument(app);
  }
  await app.listen(3000);
}

async function httpsServer() {
  const httpsOptions = {
    key: fs.readFileSync('./secrets/sslforfree/private.key'),
    cert: fs.readFileSync('./secrets/sslforfree/certificate.crt'),
  };
  // const server = express();
  // const app = await NestFactory.create(
  //   AppModule,
  //   new ExpressAdapter(server),
  // );

  // await app.init();

  // https.createServer(httpsOptions, server).listen(3000);

  const app = await NestFactory.create(AppModule, {
    httpsOptions,
  });
  app.setGlobalPrefix('api');
  await app.listen(443);
}

async function multipleServers() {
  const httpsOptions = {
    key: fs.readFileSync('./secrets/sslforfree/private.key'),
    cert: fs.readFileSync('./secrets/sslforfree/certificate.crt'),
  };

  const server = express();
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));
  app.setGlobalPrefix('api');
  app.enableCors(); //enable CORS
  // TODO enable CORS need white list.

  const configService = app.get(ConfigService);
  if (configService.get('common.DOCUMENT_ENABLE') === true) {
    buildDocument(app);
  }

  await app.init();

  http.createServer(server).listen(80);
  https.createServer(httpsOptions, server).listen(443);
}

// httpServer();
// httpsServer();
multipleServers();
