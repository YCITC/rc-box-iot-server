
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReceivedLog } from './recived_log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ReceivedLog])],
  exports: [TypeOrmModule],
})
export class ReceivedLogModule {}
