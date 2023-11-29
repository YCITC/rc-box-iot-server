import { join } from 'path';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ConfigModule, ConfigService } from '@nestjs/config';

import ExampleAppController from './example/example.controller';
import ExampleAppService from './example/example.service';
import VersionController from './version.controller';
import ReceivedLogModule from './recived-log/recived-log.module';
import PushModule from './push/push.module';
import AuthModule from './auth/auth.module';
import DevicesModule from './devices/devices.module';
import commonConfig from './config/common.config';
import dbConfig from './config/db.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV === 'development'
          ? ['.development.env']
          : ['.production.env'],
    }),
    ConfigModule.forFeature(commonConfig),
    ConfigModule.forFeature(dbConfig),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'frontend'),
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const dbInfo = {
          type: configService.get('DB.type'),
          host: configService.get('DB_HOST'), // Get DB_HOST from .env file
          port: configService.get('DB.port'),
          username: configService.get('DB.username'),
          password: configService.get('DB.password'),
          database: configService.get('DB.database'),
          entities: ['dist/**/*.entity{.ts,.js}'],
          synchronize: true,
        };
        return dbInfo;
      },
      inject: [ConfigService],
    }),
    ReceivedLogModule,
    PushModule,
    // UsersModule,  //UserModule is already imported in the 'AuthModule'.
    AuthModule,
    DevicesModule,
  ],
  // 我們可以把單一個 Controller/Service 以下面方式放進來，或者用上面的方法把整個module import進來。
  controllers: [VersionController, ExampleAppController],
  providers: [ExampleAppService],
})
export default class AppModule {}
