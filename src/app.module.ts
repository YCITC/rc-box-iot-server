import { join } from 'path';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ConfigModule, ConfigService } from '@nestjs/config';

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
          ...configService.get('DB'),
          host: configService.get('DB_HOST'), // Get DB_HOST from .env file
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
  controllers: [VersionController],
  providers: [],
})
export default class AppModule {}
