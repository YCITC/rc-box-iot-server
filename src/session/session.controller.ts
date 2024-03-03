import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import SessionService from './session.service';
import AverageActiveSession from './interface/session.interface';
import { Auth, DisableRoute } from '../common/decorator';
import RolesEnum from '../common/enum';

@ApiTags('Session')
@Controller('session')
export default class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Get('todayActive')
  @Auth(RolesEnum.ADMIN)
  @ApiOperation({
    summary: 'Get the count of active sessions for today.',
  })
  @ApiResponse({
    status: 200,
  })
  async todayActive(): Promise<number> {
    return this.sessionService.todayActive();
  }

  @Get('activeHistory/:day')
  @Auth(RolesEnum.ADMIN)
  @ApiOperation({
    summary:
      'Return the active session history and the average for the specified days.',
  })
  @ApiResponse({
    status: 200,
    type: AverageActiveSession,
  })
  async activeHistory(
    @Param('day', ParseIntPipe) day: number,
  ): Promise<AverageActiveSession> {
    return this.sessionService.activeHistory(day);
  }

  @Get('saveActiveSessions')
  @Auth(RolesEnum.ADMIN)
  @DisableRoute()
  @ApiOperation({
    summary: 'Store the count of active sessions in the database.',
  })
  @ApiResponse({
    status: 200,
  })
  async saveActiveSessions(): Promise<boolean> {
    await this.sessionService.saveActiveSessions();
    return true;
  }
}
