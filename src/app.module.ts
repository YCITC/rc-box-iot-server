import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { ReceivedLogModule } from './recived_log/recived_log.module'

@Module({
  imports: [TypeOrmModule.forRoot(), ReceivedLogModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
