
import { Module } from '@nestjs/common';
import { ReceivedLogModule } from './recived_log.module';
import { ReceivedLogService } from './recived_log.service';
// import { ReceivedLogController } from './recived_log.controller';

@Module({
  imports: [ReceivedLogModule],
  providers: [ReceivedLogService],
  // controllers: [ReceivedLogController]
})
export class UserHttpModule {}
