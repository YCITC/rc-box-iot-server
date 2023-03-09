import { SwaggerModule, SwaggerDocumentOptions } from '@nestjs/swagger';
import { DocumentBuilder } from '@nestjs/swagger';
import { ExpressAdapter } from '@nestjs/platform-express';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import * as fs from 'fs';
import * as express from 'express';
import * as https from 'https';
import * as http from 'http';

async function buildDocument(app) {

  const config = new DocumentBuilder()
    .setTitle('RC-Box API documents')
    .setDescription('The cats API description')
    .setVersion('1.0')
    .addTag('RC-Box')
    .build();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const options: SwaggerDocumentOptions = {
    deepScanRoutes: true,
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
  };
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  return app;
}

async function httpServer() {
  const app = await NestFactory.create(AppModule, { cors: true });
  // app.enableCors(); //enable CORS
  buildDocument(app);
  await app.listen(3000);
}

async function httpsServer() {
  const httpsOptions = {
    // key: fs.readFileSync('./secrets/private-key.pem'),
    // cert: fs.readFileSync('./secrets/public-certificate.pem'),
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
  await app.listen(443);
}

async function multipleServers() {
  const httpsOptions = {
    // key: fs.readFileSync('./secrets/private-key.pem'),
    // cert: fs.readFileSync('./secrets/public-certificate.pem'),
    key: fs.readFileSync('./secrets/sslforfree/private.key'),
    cert: fs.readFileSync('./secrets/sslforfree/certificate.crt'),
  };

  const server = express();
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));
  app.enableCors();
  await app.init();

  http.createServer(server).listen(80);
  https.createServer(httpsOptions, server).listen(443);
}

// httpServer();
// httpsServer();
multipleServers();
