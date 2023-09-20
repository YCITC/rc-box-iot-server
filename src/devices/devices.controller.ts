import { Controller, UseGuards } from '@nestjs/common';
import { Get, Put, Delete, Patch, Body, Param, Req } from '@nestjs/common';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DevicesService } from './devices.service';
import { DeviceDto } from './dto/device.dto';
import { Device } from './entities/device.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Devices')
@ApiBearerAuth()
@Controller('devices')
export class DevicesController {
  constructor(private devicesService: DevicesService) {}

  @Put('bind')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'bind device' })
  @ApiResponse({
    status: 200,
    description: 'Device bound successfully',
  })
  async bind(@Body() deviceDto: DeviceDto, @Req() req): Promise<Device> {
    deviceDto.ownerUserId = req.user.id;
    const deviceInDB = await this.devicesService.findByOneDeviceId(
      deviceDto.deviceId,
    );
    if (deviceInDB) {
      const deviceId = deviceDto.deviceId;
      if (deviceInDB.ownerUserId == req.user.id) {
        throw new BadRequestException(
          `The device [${deviceId}] has already been bound`,
        );
      } else {
        throw new UnauthorizedException(`Can not bind other user's device`);
      }
    }
    return this.devicesService.bind(deviceDto);
  }

  @Patch('update')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update device' })
  @ApiResponse({
    status: 200,
    description: 'Update device alias successfully',
  })
  async update(@Body() deviceDto: DeviceDto, @Req() req): Promise<Device> {
    const userHasDevice = await this.devicesService.checkDeviceWithUser(
      req.user.id,
      deviceDto.deviceId,
    );
    if (userHasDevice == false) {
      throw new UnauthorizedException("Can not unbind other user's device");
    }
    return this.devicesService.update(deviceDto);
  }

  @Get('findAllByUser/')
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Find all of User's devices" })
  @ApiResponse({
    status: 200,
    description: 'Devices found',
    type: [Device],
  })
  checkDeviceWithUser(
    @Param('deviceId') deviceId: string,
    @Req() req,
  ): Promise<boolean> {
    return this.devicesService.checkDeviceWithUser(req.user.id, deviceId);
  }

  @Delete('unbind/:deviceId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Unbind device' })
  @ApiResponse({
    status: 200,
    description: 'Device unbound successfully',
  })
  async unbind(@Param('deviceId') deviceId: string, @Req() req): Promise<any> {
    const userHasDevice = await this.devicesService.checkDeviceWithUser(
      req.user.id,
      deviceId,
    );
    if (userHasDevice == false) {
      throw new UnauthorizedException("Can not unbind other user's device");
    }
    return this.devicesService.unbind(deviceId);
  }
}
