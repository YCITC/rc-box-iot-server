import * as dayjs from 'dayjs';
import Redis from 'ioredis';
import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { InjectRepository } from '@nestjs/typeorm';
import { Cron } from '@nestjs/schedule';
import { Between, Repository } from 'typeorm';
import ActiveSession from './eneity/active-session.entity';
import AverageActiveSession from './interface/session.interface';

@Injectable()
export default class SessionService {
  constructor(
    @InjectRepository(ActiveSession)
    private readonly activeSessionRepository: Repository<ActiveSession>,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  async addSession(sessionId: string) {
    const objToSave = { createTime: new Date().toISOString() };
    await this.redis.hmset(`session:${sessionId}`, objToSave);
    await this.redis.sadd('sessions_sets', sessionId);
    await this.redis.sadd('daily_active_sessions', sessionId);
    await this.redis.rpush('sessions_list', sessionId);
  }

  async removeSession(sessionId: string) {
    await this.redis.del(`session:${sessionId}`);
    await this.redis.srem('sessions_sets', sessionId);
    await this.redis.srem('daily_active_sessions', sessionId);
  }

  async todayActive(): Promise<number> {
    return this.redis.scard('sessions_sets');
  }

  async activeHistory(day: number): Promise<AverageActiveSession> {
    const result = await this.activeSessionRepository.find({
      where: {
        day: Between(
          dayjs()
            .subtract(day + 1, 'day')
            .toDate(),
          dayjs().toDate(),
        ),
      },
    });

    let sum = 0;
    result.forEach((activeSession) => {
      sum += activeSession.count;
    });
    const returnObj = {
      activeHistory: result,
      days: result.length,
      average: sum / result.length,
    };
    return returnObj;
  }

  // Every 00:01:00
  @Cron('* 1 0 * * *')
  async saveActiveSessions() {
    const count = await this.redis.scard('daily_active_sessions');
    this.activeSessionRepository.save({
      count,
      day: dayjs().subtract(1, 'day').toDate(),
    });
    await this.redis.del('daily_active_sessions');
  }

  // Every 00:05:00
  @Cron('* 5 0 * * *')
  async removeExpiredSession() {
    const sessionId = await this.redis.lindex('sessions_list', 0);
    if (!sessionId) return;

    const hmget = await this.redis.hmget(`session:${sessionId}`, 'createTime');
    const createTime = hmget[0];
    if (!createTime) return;

    const createDay = dayjs(createTime);
    if (dayjs().diff(createDay, 'day') > 30) {
      await this.redis.del(`session:${sessionId}`);
      await this.redis.lpop('sessions_list');
      await this.redis.srem('sessions_sets', sessionId);
      this.removeExpiredSession();
    }
  }
}
