import * as dayjs from 'dayjs';
import Redis from 'ioredis';
import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { InjectRepository } from '@nestjs/typeorm';
import { Cron } from '@nestjs/schedule';
import { Repository } from 'typeorm';
import ActiveSession from './eneity/active-session.entity';

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
  }

  async countSessions(): Promise<number> {
    return this.redis.scard('sessions_sets');
  }

  // Every 00:01:00
  @Cron('* 1 0 * * *')
  async saveActiveSessions() {
    const count = await this.redis.scard('daily_active_sessions');
    this.activeSessionRepository.save({
      count,
      day: dayjs().subtract(1, 'day').toDate(),
    });
    this.redis.del('daily_active_sessions');
  }

  // Every 00:05:00
  @Cron('* 5 0 * * *')
  async removeExpiredSession() {
    let sessionId = await this.redis.lindex('sessions_list', 0);
    const createTime = await this.redis.hmget(
      `session:${sessionId}`,
      'createTime',
    )[0];
    const createDay = dayjs(createTime);
    if (dayjs().diff(createDay) > 30) {
      await this.redis.del(`session:${sessionId}`);
      await this.redis.lpop('sessions_list');
      await this.redis.srem('sessions_sets', sessionId);
      this.removeExpiredSession();

      sessionId = await this.redis.lindex('sessions_list', 0);
    }
  }
}
