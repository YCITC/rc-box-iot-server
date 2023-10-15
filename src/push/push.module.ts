import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import PushController from './push.controller';
import PushService from './push.service';
import ChromeClient from './entity/chrome.client.entity';
import IOSClient from './entity/ios.client.entity';
import Device from '../devices/entities/device.entity';
import DevicesService from '../devices/devices.service';
import googleConfig from '../config/google.config';

@Module({
  imports: [
    ConfigModule.forFeature(googleConfig),
    TypeOrmModule.forFeature([ChromeClient, IOSClient, Device]),
  ],
  exports: [TypeOrmModule],
  controllers: [PushController],
  providers: [PushService, DevicesService, ConfigService],
})
export default class PushModule {}
