import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import SessionService from './session.service';
import AverageActiveSession from './interface/session.interface';

@ApiTags('Session')
@Controller('session')
export default class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Get('todayActive')
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
