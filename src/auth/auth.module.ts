import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import jwtConfig from '../config/jwt.config';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { EmailService } from '../email/email.service';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    ConfigModule.forFeature(jwtConfig),
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
  providers: [AuthService, JwtStrategy, EmailService],
  controllers: [AuthController],
})
export class AuthModule { }
