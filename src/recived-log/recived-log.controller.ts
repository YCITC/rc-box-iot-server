import { Body, Controller, Get, Post, Param } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ReceivedLog } from './entity/recived-log.entity';
import { ReceivedLogService } from './recived-log.service';
import { ReceivedLogDto } from './dto/recived-log.dto';

@ApiTags('Log')
@Controller('log')
export class ReceivedLogController {
  constructor(private readonly receiveService: ReceivedLogService) {}

  @Get('get')
  getAll(): Promise<ReceivedLog[]> {
    return this.receiveService.getAll();
  }

  @Get('get/:deviceId')
  findByDeviceId(@Param('deviceId') deviceId: string): Promise<ReceivedLog[]> {
    return this.receiveService.findByDeviceId(deviceId);
  }

  @Post('add')
  create(@Body() receivedLogDto: ReceivedLogDto): Promise<ReceivedLog> {
    if (receivedLogDto.deviceId.length > 0) {
      return this.receiveService.create(receivedLogDto);
    } else {
      return Promise.reject(
        new BadRequestException('deviceId length cannot be zero'),
      );
    }
  }
}
