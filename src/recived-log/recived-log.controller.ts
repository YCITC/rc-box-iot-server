import { Controller, Body, Param, Delete } from '@nestjs/common';
import { Get, Put } from '@nestjs/common';
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
  @Get('get')
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
  getAll(): Promise<ReceivedLog[]> {
    return this.receiveService.getAll();
  }

  @Get('get/:deviceId')
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
  findByDeviceId(@Param('deviceId') deviceId: string): Promise<ReceivedLog[]> {
    return this.receiveService.findByDeviceId(deviceId);
  }

  @Put('add')
  @ApiResponse({
    status: 200,
    description: 'Return a log',
    // schema: {
    //   example: {
    //     time: '2023-03-09T10:15:39.000Z',
    //     id: 20,
    //     deviceId: 'rc-box-JixujH$zf',
    //   },
    //   type: 'object',
    //   properties: {
    //     time: { type: 'string' },
    //     id: { type: 'number' },
    //     deviceId: { type: 'string' },
    //   },
    // },
    type: ReceivedLog,
  })
  create(@Body() receivedLogDto: ReceivedLogDto): Promise<ReceivedLog> {
    if (receivedLogDto.deviceId.length > 0) {
      return this.receiveService.create(receivedLogDto);
    } else {
      return Promise.reject(
        new BadRequestException('deviceId length cannot be zero'),
      );
    }
  }

  @Delete('clean/:deviceId')
  @ApiOperation({ summary: 'Delete logs with deviceId ' })
  @ApiResponse({
    status: 200,
    description:
      'Logs has been successfully deleted using the provided deviceId.',
  })
  @ApiResponse({ status: 400, description: 'Log not found' })
  async clean(@Param('deviceId') deviceId: string): Promise<any> {
    if (deviceId.length > 0) {
      await this.receiveService.clean(deviceId);
      return Promise.resolve({
        statusCode: 200,
        message:
          'Logs has been successfully deleted using the provided deviceId ' +
          deviceId +
          '.',
      });
    } else {
      return Promise.reject(
        new BadRequestException('deviceId length cannot be zero'),
      );
    }
  }
}
