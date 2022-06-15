import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PushController } from './push.controller';
import { PushService } from './push.service';
import { PushClient } from './interface/push.client.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PushClient])],
  exports: [TypeOrmModule],
  controllers: [PushController],
  providers: [PushService],
})
export class PushModule {}
