import * as fs from 'fs';
import { Controller, Get } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('version')
@Controller('version')
export default class VersionController {
  @Get()
  @ApiResponse({
    status: 200,
    schema: {
      example: '0.4.2',
      type: 'string',
    },
  })
  version() {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    return packageJson.version;
  }
}
