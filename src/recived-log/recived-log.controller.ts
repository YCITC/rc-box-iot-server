import { Controller, Query, UseGuards } from '@nestjs/common';
import { Req, Body, Param } from '@nestjs/common';
import { Get, Put, Delete } from '@nestjs/common';
import { DefaultValuePipe, ParseIntPipe } from '@nestjs/common';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

import ReceivedLog from './entity/recived-log.entity';
import ReceivedLogDto from './dto/recived-log.dto';
import ReceivedLogService from './recived-log.service';
import DevicesService from '../devices/devices.service';
import JwtAuthGuard from '../guards/jwt-auth.guard';
import { ReceivedLogInterface } from './interface/recived-log.interface';
import { PaginateInterface } from '../common/interface';

@ApiTags('Log')
@ApiBearerAuth()
@Controller('log')
export default class ReceivedLogController {
  constructor(
    private readonly receiveService: ReceivedLogService,
    private readonly devicesService: DevicesService,
  ) {}

  /*
  @ApiOperation({
    summary: "Don't use this on production environment.",
  })
  @Get('getAll')
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
   */

  @Put('add')
  @ApiResponse({
    status: 200,
    description: 'Return a log',
    type: ReceivedLog,
  })
  add(@Body() receivedLogDto: ReceivedLogDto): Promise<ReceivedLog> {
    if (receivedLogDto.deviceId?.length > 0) {
      return this.receiveService.add(receivedLogDto);
    }

    // ? Unit test example of reject exception
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
    if (!userHasDevice)
      throw new UnauthorizedException(`You have no device ${deviceId}`);

    return this.receiveService.findByDeviceId(deviceId);
  }

  @Get('getByUser')
  @UseGuards(JwtAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Return logs',
    schema: {
      example: [
        {
          items: [
            {
              time: '2024-01-22T08:08:58.204Z',
              id: 3,
              deviceId: 'rc-box-test-a12302',
            },
            {
              time: '2024-01-22T07:52:12.188Z',
              id: 2,
              deviceId: 'rc-box-test-a12302',
            },
            {
              time: '2024-01-22T07:52:11.210Z',
              id: 1,
              deviceId: 'rc-box-test-a12303',
            },
          ],
          meta: {
            totalItems: 45,
            itemCount: 10,
            itemsPerPage: 10,
            totalPages: 5,
            currentPage: 1,
          },
        },
      ],
    },
  })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  async getByUser(
    @Req() req,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit,
  ): Promise<PaginateInterface<ReceivedLogInterface>> {
    return this.receiveService.getByUser({
      userId: req.user.id,
      paginateOptions: {
        page,
        limit: limit > 100 ? 100 : limit,
      },
    });
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
    if (!deviceId || deviceId.length === 0)
      throw new BadRequestException('deviceId length cannot be zero');

    const userHasDevice = await this.devicesService.checkDeviceWithUser(
      req.user.id,
      deviceId,
    );
    if (!userHasDevice)
      throw new UnauthorizedException("Can not unbind other user's device");

    await this.receiveService.clean(deviceId);
    return Promise.resolve({
      statusCode: 200,
      message: `Logs has been successfully deleted using the provided deviceId ${deviceId}.`,
    });
  }
}
