import { Controller, NotAcceptableException } from '@nestjs/common';
import { Get, Put, Delete, Patch, Body, Param, Req } from '@nestjs/common';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotAcceptableResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

import DevicesService from './devices.service';
import DeviceDto from './dto/device.dto';
import Device from './entities/device.entity';
import { Auth } from '../common/decorator';
import RolesEnum from '../common/enum';

@ApiTags('Devices')
@ApiBearerAuth()
@Controller('devices')
export default class DevicesController {
  constructor(private devicesService: DevicesService) {}

  @Put('bind')
  @Auth(RolesEnum.ADMIN, RolesEnum.USER)
  @ApiOperation({ summary: 'bind device' })
  @ApiResponse({
    status: 200,
    description: 'Device bound successfully',
  })
  @ApiNotAcceptableResponse({
    description: 'current user has no device',
  })
  async bind(@Body() deviceDto: DeviceDto, @Req() req): Promise<Device> {
    const deviceInDB = await this.devicesService.findByOneDeviceId(
      deviceDto.deviceId,
    );
    if (deviceInDB) {
      if (deviceInDB.ownerUserId === req.user.id) {
        throw new NotAcceptableException(
          `The device [${deviceDto.deviceId}] has already been bound`,
        );
      } else {
        throw new UnauthorizedException(`Can not bind other user's device`);
      }
    }
    return this.devicesService.bind({ ...deviceDto, ownerUserId: req.user.id });
  }

  @Patch('update')
  @Auth(RolesEnum.ADMIN, RolesEnum.USER)
  @ApiOperation({ summary: 'Update device' })
  @ApiResponse({
    status: 200,
    description: 'Update device alias successfully',
  })
  @ApiNotAcceptableResponse({
    description: "Can not update other user's device",
  })
  async update(@Body() deviceDto: DeviceDto, @Req() req): Promise<Device> {
    const userHasDevice = await this.devicesService.checkDeviceWithUser(
      req.user.id,
      deviceDto.deviceId,
    );
    if (userHasDevice === false) {
      throw new NotAcceptableException("Can not update other user's device");
    }
    return this.devicesService.update(deviceDto);
  }

  @Get('findAllByUser/')
  @Auth(RolesEnum.ADMIN, RolesEnum.USER)
  @ApiOperation({ summary: "Find all of User's devices" })
  @ApiResponse({
    status: 200,
    description: 'Devices found',
    type: [Device],
  })
  findAllWithUserId(@Req() req) {
    return this.devicesService.findAllWithUserId(req.user.id);
  }

  @Get('checkDeviceWithUser/:deviceId')
  @Auth(RolesEnum.ADMIN, RolesEnum.USER)
  @ApiOperation({ summary: 'Verify that the user has the device.' })
  @ApiResponse({
    status: 200,
    description: 'Devices found',
    schema: {
      type: 'boolean',
    },
  })
  checkDeviceWithUser(
    @Param('deviceId') deviceId: string,
    @Req() req,
  ): Promise<boolean> {
    return this.devicesService.checkDeviceWithUser(req.user.id, deviceId);
  }

  @Delete('unbind/:deviceId')
  @Auth(RolesEnum.ADMIN, RolesEnum.USER)
  @ApiOperation({ summary: 'Unbind device' })
  @ApiResponse({
    status: 200,
    description: 'Device unbound successfully',
  })
  @ApiNotAcceptableResponse({
    description: 'Can not found this device',
  })
  async unbind(@Param('deviceId') deviceId: string, @Req() req): Promise<any> {
    const userHasDevice = await this.devicesService.checkDeviceWithUser(
      req.user.id,
      deviceId,
    );
    if (userHasDevice === false) {
      throw new NotAcceptableException('Can not found this device');
    }
    return this.devicesService.unbind(deviceId);
  }
}
