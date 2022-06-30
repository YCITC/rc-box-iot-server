import { Controller, Get, Post, Body } from '@nestjs/common';
import { ReceivedLog } from './recived-log.entity';
import { ReceivedLogService } from './recived-log.service';
import { ReceivedLogDto } from './dto/recived-log.dto';

@Controller('log')
export class ReceivedLogController {
  constructor(private readonly receiveService: ReceivedLogService) {}

  @Get()
  getAll(): Promise<ReceivedLog[]> {
    return this.receiveService.findAll();
  }

  @Post('add')
  create(@Body() receivedLogDto: ReceivedLogDto): Promise<ReceivedLog> {
    return this.receiveService.create(receivedLogDto);
  }
}
