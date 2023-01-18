import { Controller, Get, Post, Req, Param, Body} from '@nestjs/common';
import { Request, Response } from 'express';

import { ReceivedLog } from './entity/recived-log.entity';
import { ReceivedLogService } from './recived-log.service';
import { ReceivedLogDto } from './dto/recived-log.dto';

@Controller('log')
export class ReceivedLogController {
  constructor(private readonly receiveService: ReceivedLogService) {}

  @Get('get')
  getAll(): Promise<ReceivedLog[]> {
    return this.receiveService.getAll();
  }

  @Get('get/*')
  findByDeviceId(@Param() params: string): Promise<ReceivedLog[]> {
    const deviceId = params[0];
    console.log('deviceId:', deviceId);
    return this.receiveService.findByDeviceId(deviceId);
  }

  @Post('add')
  create(@Body() receivedLogDto: ReceivedLogDto): Promise<ReceivedLog> {
    return this.receiveService.create(receivedLogDto);
  }
}
