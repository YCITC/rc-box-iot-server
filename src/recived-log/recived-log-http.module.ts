
import { Module } from '@nestjs/common';
import { ReceivedLogModule } from './recived-log.module';
import { ReceivedLogService } from './recived-log.service';
// import { ReceivedLogController } from './recived_log.controller';

@Module({
  imports: [ReceivedLogModule],
  providers: [ReceivedLogService],
  // controllers: [ReceivedLogController]
})
export class UserHttpModule {}
