import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PushController } from './push.controller';
import { PushService } from './push.service';
import { PushClient } from './interface/push.client.entity';
import { iOSClient } from './interface/ios.client.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PushClient, iOSClient])],
  exports: [TypeOrmModule],
  controllers: [PushController],
  providers: [PushService],
})
export class PushModule {}
