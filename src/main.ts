import { ExpressAdapter } from '@nestjs/platform-express';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import * as fs from 'fs';
import * as express from 'express';
import * as https from 'https';
import * as http from 'http';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
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

// bootstrap();
// httpsServer();
multipleServers();
