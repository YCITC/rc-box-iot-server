import * as dayjs from 'dayjs';
import Redis from 'ioredis';
import { Test, TestingModule } from '@nestjs/testing';
import { getRedisToken } from '@liaoliaots/nestjs-redis';
import { getRepositoryToken } from '@nestjs/typeorm';

import ActiveSession from './eneity/active-session.entity';
import SessionService from './session.service';

describe('SessionService', () => {
  let sessionService: SessionService;
  let redisClient: Redis;
  const redisHmset = jest.fn();
  const redisScard = jest.fn().mockResolvedValue(10);
  const redisRpush = jest.fn();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionService,
        {
          provide: getRepositoryToken(ActiveSession),
          useValue: {
            find: jest.fn().mockImplementation(async (): Promise<any> => {
              const activeSessions = [];
              const day = 7;
              for (let i = 0; i < day; i += 1) {
                activeSessions.push({
                  count: Math.floor(Math.random() * 10 + 1),
                  day: dayjs()
                    .subtract(day - i, 'day')
                    .toDate(),
                });
              }
              return activeSessions;
            }),
            save: jest.fn(),
          },
        },
        {
          provide: getRedisToken('default'),
          useValue: {
            hmset: redisHmset,
            hmget: jest.fn().mockResolvedValue([null]),
            sadd: jest.fn(),
            srem: jest.fn(),
            scard: redisScard,
            rpush: redisRpush,
            lindex: jest.fn().mockResolvedValue(null),
            lpop: jest.fn(),
            del: jest.fn(),
          },
        },
      ],
    }).compile();
    redisClient = module.get<Redis>(getRedisToken('default'));
    sessionService = module.get<SessionService>(SessionService);
  });

  it('should be defined', () => {
    expect(sessionService).toBeDefined();
  });

  describe('addSession', () => {
    it('should call redis rpush', async () => {
      const redisSaddSpy = jest.spyOn(redisClient, 'sadd');

      await sessionService.addSession('fake-sessionId');

      expect(redisHmset).toHaveBeenCalled();
      expect(redisSaddSpy).toHaveBeenCalledTimes(2);
      expect(redisRpush).toHaveBeenCalled();
    });
  });

  describe('removeSession', () => {
    it('should call redis del, srem', async () => {
      const redisDelSpy = jest.spyOn(redisClient, 'del');
      const redisSremSpy = jest.spyOn(redisClient, 'srem');

      await sessionService.removeSession('fake-sessionId');

      expect(redisDelSpy).toHaveBeenCalled();
      expect(redisSremSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('todayActive', () => {
    it('should return number', async () => {
      const result = await sessionService.todayActive();

      expect(redisScard).toHaveBeenCalled();
      expect(typeof result).toBe('number');
    });
  });

  describe('averageActive', () => {
    it('should return average with number', async () => {
      const result = await sessionService.averageActive(7);

      expect(typeof result.average).toBe('number');
    });
  });

  describe('saveActiveSessions', () => {
    it('should call redisScard, redisDel', async () => {
      const redisDelSpy = jest.spyOn(redisClient, 'del');

      await sessionService.saveActiveSessions();

      expect(redisScard).toHaveBeenCalled();
      expect(redisDelSpy).toHaveBeenCalled();
    });
  });

  describe('removeExpiredSession', () => {
    it('should call redisDel, redisLpop, redisSrem once', async () => {
      const redisLindexSpy = jest.spyOn(redisClient, 'lindex');
      redisLindexSpy.mockResolvedValueOnce('fake-sessionId');

      const redisHmgetSpy = jest.spyOn(redisClient, 'hmget');
      redisHmgetSpy.mockResolvedValueOnce([
        dayjs().subtract(31, 'day').toDate().toString(),
      ]);

      const redisDelSpy = jest.spyOn(redisClient, 'del');
      const redisLpopSpy = jest.spyOn(redisClient, 'lpop');
      const redisSremSpy = jest.spyOn(redisClient, 'srem');

      await sessionService.removeExpiredSession();

      expect(redisLindexSpy).toHaveBeenCalled();
      expect(redisHmgetSpy).toHaveBeenCalled();
      expect(redisDelSpy).toHaveBeenCalledTimes(1);
      expect(redisLpopSpy).toHaveBeenCalledTimes(1);
      expect(redisSremSpy).toHaveBeenCalledTimes(1);
    });
    it('should not call redisDel, redisLpop, redisSrem', async () => {
      const redisLindexSpy = jest.spyOn(redisClient, 'lindex');
      redisLindexSpy.mockResolvedValueOnce('fake-sessionId');
      const redisHmgetSpy = jest.spyOn(redisClient, 'hmget');

      const redisDelSpy = jest.spyOn(redisClient, 'del');
      const redisLpopSpy = jest.spyOn(redisClient, 'lpop');
      const redisSremSpy = jest.spyOn(redisClient, 'srem');

      await sessionService.removeExpiredSession();

      expect(redisLindexSpy).toHaveBeenCalled();
      expect(redisHmgetSpy).toHaveBeenCalledTimes(1);
      expect(redisDelSpy).toHaveBeenCalledTimes(0);
      expect(redisLpopSpy).toHaveBeenCalledTimes(0);
      expect(redisSremSpy).toHaveBeenCalledTimes(0);
    });
    it('should not call redisHmget, redisDel, redisLpop, redisSrem', async () => {
      const redisLindexSpy = jest.spyOn(redisClient, 'lindex');
      redisLindexSpy.mockResolvedValueOnce(null);
      const redisHmgetSpy = jest.spyOn(redisClient, 'hmget');

      const redisDelSpy = jest.spyOn(redisClient, 'del');
      const redisLpopSpy = jest.spyOn(redisClient, 'lpop');
      const redisSremSpy = jest.spyOn(redisClient, 'srem');

      await sessionService.removeExpiredSession();

      expect(redisLindexSpy).toHaveBeenCalled();
      expect(redisHmgetSpy).toHaveBeenCalledTimes(0);
      expect(redisDelSpy).toHaveBeenCalledTimes(0);
      expect(redisLpopSpy).toHaveBeenCalledTimes(0);
      expect(redisSremSpy).toHaveBeenCalledTimes(0);
    });
  });
});
