import { Controller, UseGuards } from '@nestjs/common';
import { Req, Body, Param } from '@nestjs/common';
import { Get, Put, Delete } from '@nestjs/common';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

import ReceivedLog from './entity/recived-log.entity';
import ReceivedLogDto from './dto/recived-log.dto';
import ReceivedLogService from './recived-log.service';
import DevicesService from '../devices/devices.service';
import JwtAuthGuard from '../auth/guards/jwt-auth.guard';

@ApiTags('Log')
@ApiBearerAuth()
@Controller('log')
export default class ReceivedLogController {
  constructor(
    private readonly receiveService: ReceivedLogService,
    private readonly devicesService: DevicesService,
  ) {}

  // @ApiOperation({
  //   summary: "Don't use this on production environment.",
  // })
  // @Get('getAll')
  // @ApiResponse({
  //   status: 200,
  //   description: 'Return all of logs',
  //   schema: {
  //     example: [
  //       {
  //         time: '2023-01-16T16:57:49.000Z',
  //         id: 5,
  //         deviceId: 'macbook',
  //       },
  //       {
  //         time: '2023-02-03T11:24:38.000Z',
  //         id: 18,
  //         deviceId: 'Postman_test',
  //       },
  //     ],
  //     type: 'object',
  //     properties: {
  //       time: { type: 'string' },
  //       id: { type: 'number' },
  //       deviceId: { type: 'string' },
  //     },
  //   },
  // })
  // getAll(): Promise<ReceivedLog[]> {
  //   return this.receiveService.getAll();
  // }

  @Put('add')
  @ApiResponse({
    status: 200,
    description: 'Return a log',
    type: ReceivedLog,
  })
  add(@Body() receivedLogDto: ReceivedLogDto): Promise<ReceivedLog> {
    if (receivedLogDto.deviceId.length > 0) {
      return this.receiveService.add(receivedLogDto);
    }
    return Promise.reject(
      new BadRequestException('deviceId length cannot be zero'),
    );
  }

  @Get('get/:deviceId')
  @UseGuards(JwtAuthGuard)
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
  async findByDeviceId(
    @Param('deviceId') deviceId: string,
    @Req() req,
  ): Promise<ReceivedLog[]> {
    const userHasDevice = await this.devicesService.checkDeviceWithUser(
      req.user.id,
      deviceId,
    );
    if (userHasDevice === false) {
      throw new UnauthorizedException(`You have no device ${deviceId}`);
    }
    return this.receiveService.findByDeviceId(deviceId);
  }

  @Get('getAllByUser/')
  @UseGuards(JwtAuthGuard)
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
  async getAllByUser(@Req() req): Promise<ReceivedLog[]> {
    const devices = await this.devicesService.findAllWithUserId(req.user.id);
    const allLogs: ReceivedLog[] = [];

    const logPromises = devices.map(async (device) => {
      const logs = await this.receiveService.findByDeviceId(device.deviceId);
      logs.forEach((log) => {
        allLogs.push(log);
      });
    });
    await Promise.all(logPromises);

    allLogs.sort((a, b) => b.id - a.id);
    return Promise.resolve(allLogs);
  }

  @Delete('clean/:deviceId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete logs with deviceId ' })
  @ApiResponse({
    status: 200,
    description:
      'Logs has been successfully deleted using the provided deviceId.',
  })
  @ApiResponse({ status: 400, description: 'Log not found' })
  async clean(@Param('deviceId') deviceId: string, @Req() req): Promise<any> {
    const userHasDevice = await this.devicesService.checkDeviceWithUser(
      req.user.id,
      deviceId,
    );
    if (userHasDevice === false) {
      throw new UnauthorizedException("Can not unbind other user's device");
    }
    if (deviceId.length > 0) {
      await this.receiveService.clean(deviceId);
      return Promise.resolve({
        statusCode: 200,
        message: `Logs has been successfully deleted using the provided deviceId ${deviceId}.`,
      });
    }
    return Promise.reject(
      new BadRequestException('deviceId length cannot be zero'),
    );
  }
}
