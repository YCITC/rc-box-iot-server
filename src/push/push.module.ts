import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PushController } from './push.controller';
import { PushService } from './push.service';
import { WebClient } from './entity/web.client.entity';
import { iOSClient } from './entity/ios.client.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WebClient, iOSClient])],
  exports: [TypeOrmModule],
  controllers: [PushController],
  providers: [PushService],
})
export class PushModule {}
