import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';

import EmailService from './email.service';
import emailConfig from '../config/email.config';

@Module({
  imports: [
    ConfigModule.forFeature(emailConfig),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        return configService.get('EMAIL');
      },
      inject: [ConfigService],
    }),
  ],
  providers: [EmailService],
})
export default class EmailModule {}
