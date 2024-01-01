import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import jwtConfig from '../config/jwt.config';
import googleConfig from '../config/google.config';
import sessionConfig from '../config/session.config';
import EmailService from '../email/email.service';
import AuthService from './auth.service';
import EmailModule from '../email/email.module';
import UsersModule from '../users/users.module';
import GoogleStrategy from './strategies/google.strategy';
import JwtStrategy from './strategies/jwt.strategy';
import AuthController from './auth.controller';

@Module({
  imports: [
    ConfigModule.forFeature(jwtConfig),
    ConfigModule.forFeature(googleConfig),
    ConfigModule.forFeature(sessionConfig),
    UsersModule,
    EmailModule,
    ConfigModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const obj = {
          secret: configService.get('JWT.SECRET'),
          signOptions: {
            expiresIn: `${configService.get('JWT.EXPIRATION_TIME')}`,
            issuer: configService.get('JWT.ISSUER'),
          },
        };
        return obj;
      },
    }),
  ],
  providers: [AuthService, JwtStrategy, EmailService, GoogleStrategy],
  controllers: [AuthController],
})
export default class AuthModule {}
