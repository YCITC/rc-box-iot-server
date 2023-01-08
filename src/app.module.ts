import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { ReceivedLogModule } from './recived-log/recived-log.module';
import { PushModule } from './push/push.module';

@Module({
  imports: [
    // ServeStaticModule.forRoot({
    //   rootPath: join(__dirname, '..', 'client'),
    // }),
    TypeOrmModule.forRoot({
      type: 'mariadb',
      host: '34.80.129.4',
      port: 3306,
      username: 'root',
      password: '12345',
      database: 'rc-box',
      entities: ['dist/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    ReceivedLogModule,
    PushModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
