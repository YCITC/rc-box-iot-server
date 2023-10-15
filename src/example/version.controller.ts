import * as fs from 'fs';
import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('version')
@Controller('version')
export default class VersionController {
  @Get()
  version() {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    return packageJson.version;
  }
}
