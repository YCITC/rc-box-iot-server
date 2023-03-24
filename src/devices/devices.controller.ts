import { Controller, Body, Param } from '@nestjs/common';
import { Get, Put, Delete, Patch } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DevicesService } from './devices.service';
import { BindDeviceDto } from './dto/bind-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { Device } from './entities/device.entity';

@ApiTags('Devices')
@Controller('devices')
export class DevicesController {
  constructor(private devicesService: DevicesService) {}

  @Put('bind')
  @ApiOperation({ summary: 'bind device' })
  @ApiResponse({
    status: 200,
    description: 'Device bound successfully',
  })
  bind(@Body() bindDeviceDto: BindDeviceDto): Promise<Device> {
    return this.devicesService.bind(bindDeviceDto);
  }

  @Patch('update')
  @ApiOperation({ summary: 'Register device' })
  @ApiResponse({
    status: 200,
    description: 'Update device alias successfully',
  })
  update(@Body() updateDeviceDto: UpdateDeviceDto): Promise<Device> {
    return this.devicesService.update(updateDeviceDto);
  }

  @Get('findByUser/:id')
  @ApiOperation({ summary: "Find all of User's devices" })
  @ApiResponse({
    status: 200,
    description: 'Devices found',
    type: [Device],
  })
  findAllWithUserId(@Param('id') ownerUserId: number) {
    return this.devicesService.findAllWithUserId(ownerUserId);
  }

  @Delete('unbind/:id')
  @ApiOperation({ summary: 'Unbind device' })
  @ApiResponse({
    status: 200,
    description: 'Device unbound successfully',
  })
  unbind(@Param('id') id: number): Promise<any> {
    return this.devicesService.unbind(id);
  }
}
