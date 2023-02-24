import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entity/user.entity';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let repo: Repository<User>;
  const rawUser = {
    email: '1@2.3',
    username: 'Tester',
    fullName: 'Tester Jest',
    password: 'weNeedPassword',
    phoneNumber: '0900123456',
    address: 'No. 7, Section 5, Xinyi Road, Xinyi District · Taipei · Taiwan',
    zipCode: '110',
  };

  beforeEach(async () => {
    const testUser = new User(
      rawUser.email,
      rawUser.username,
      rawUser.fullName,
      rawUser.password,
      rawUser.phoneNumber,
      rawUser.address,
      rawUser.zipCode,
    );
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOneBy: jest.fn().mockResolvedValue(testUser),
            save: (user) => {
              user.createdTime = new Date();
              user.isEmailConfirmed = false;
              return Promise.resolve(user);
            },
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repo = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addOne', () => {
    it('should return a user', async () => {
      const user = await service.addOne(rawUser);
      expect(user.createdTime).toBeDefined();
      expect(user.isEmailConfirmed).toBeDefined();
    });
    it('password should be hashed', async () => {
      const user = await service.addOne(rawUser);
      expect(user.password == rawUser.password).toBeFalsy();
    });
  });

  describe('findByMail', () => {
    it('should trigger repo findOneBy', async () => {
      const repoSpy = jest.spyOn(repo, 'findOneBy');
      const user = await service.findOneByMail('1@.2.3');
      expect(user.isEmailConfirmed).toBeFalsy();
      expect(user.createdTime).toBeDefined();
      expect(repoSpy).toBeCalled();
    });
  });
});
