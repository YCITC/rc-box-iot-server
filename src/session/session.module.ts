import { Module, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisModule } from '@liaoliaots/nestjs-redis';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';

import redisConfig from '../config/redis.config';
import SessionService from './session.service';
import sessionConfig from '../config/session.config';
import SessionController from './session.controller';
import SessionMiddleware from './session.middleware';
import ActiveSession from './eneity/active-session.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ActiveSession]),
    ConfigModule.forFeature(redisConfig),
    ConfigModule.forFeature(sessionConfig),
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        return configService.get('REDIS');
      },
      inject: [ConfigService],
    }),
    ScheduleModule.forRoot(),
  ],
  providers: [SessionService, SessionMiddleware],
  controllers: [SessionController],
  exports: [SessionService, TypeOrmModule],
})
export default class SessionModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(SessionMiddleware).forRoutes('*');
  }
}
