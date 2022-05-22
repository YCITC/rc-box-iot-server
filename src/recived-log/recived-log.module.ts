
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReceivedLog } from './recived-log.entity';
import { ReceivedLogService } from './recived-log.service';
import { ReceivedLogController } from './recived-log.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ReceivedLog])],
  exports: [TypeOrmModule],
  controllers: [ReceivedLogController],
  providers: [ReceivedLogService],
})
export class ReceivedLogModule {}
