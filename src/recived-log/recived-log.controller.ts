import { Body, Controller, Get, Post, Param } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import { ApiResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { ReceivedLog } from './entity/recived-log.entity';
import { ReceivedLogService } from './recived-log.service';
import { ReceivedLogDto } from './dto/recived-log.dto';

@ApiTags('Log')
@Controller('log')
export class ReceivedLogController {
  constructor(private readonly receiveService: ReceivedLogService) {}

  @ApiOperation({
    summary: "Don't use this on production environment.",
  })
  @ApiResponse({
    status: 200,
    description: 'Return all of logs',
    schema: {
      example: [
        {
          time: '2023-01-16T16:57:49.000Z',
          id: 5,
          deviceId: 'macbook',
        },
        {
          time: '2023-02-03T11:24:38.000Z',
          id: 18,
          deviceId: 'Postman_test',
        },
      ],
      type: 'object',
      properties: {
        time: { type: 'string' },
        id: { type: 'number' },
        deviceId: { type: 'string' },
      },
    },
  })
  @Get('get')
  getAll(): Promise<ReceivedLog[]> {
    return this.receiveService.getAll();
  }

  @ApiResponse({
    status: 200,
    description: 'Return logs of deviceId',
    schema: {
      example: [
        {
          time: '2023-01-16T16:57:49.000Z',
          id: 5,
          deviceId: 'macbook',
        },
      ],
      type: 'object',
      properties: {
        time: { type: 'string' },
        id: { type: 'number' },
        deviceId: { type: 'string' },
      },
    },
  })
  @Get('get/:deviceId')
  findByDeviceId(@Param('deviceId') deviceId: string): Promise<ReceivedLog[]> {
    return this.receiveService.findByDeviceId(deviceId);
  }

  @ApiResponse({
    status: 200,
    description: 'Return a log',
    schema: {
      example: {
        time: '2023-03-09T10:15:39.000Z',
        id: 20,
        deviceId: 'rc-box-JixujH$zf',
      },
      type: 'object',
      properties: {
        time: { type: 'string' },
        id: { type: 'number' },
        deviceId: { type: 'string' },
      },
    },
  })
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
