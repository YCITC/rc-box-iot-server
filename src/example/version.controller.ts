import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';

@ApiTags('version')
@Controller('version')
export class VersionController {
  constructor(private readonly configService: ConfigService) {}

  @Get()
  async version() {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    return packageJson.version;
  }
}
