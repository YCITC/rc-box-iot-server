import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entity/user.entity';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let repo: Repository<User>;
  const rawUser = {
    id: 1,
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
              user.isEmailVerified = false;
              return Promise.resolve(user);
            },
            update: jest.fn().mockResolvedValue({ affected: 1 }),
            delete: jest.fn().mockResolvedValue({ affected: 1 }),
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
      expect(user.isEmailVerified).toBeDefined();
    });
    it('password should be hashed', async () => {
      const user = await service.addOne(rawUser);
      expect(user.password == rawUser.password).toBeFalsy();
    });
  });

  describe('findOneById', () => {
    it('should trigger repo findOneBy', async () => {
      const repoSpy = jest.spyOn(repo, 'findOneBy');
      await service.findOneById(1);
      expect(repoSpy).toBeCalled();
    });
  });

  describe('findByMail', () => {
    it('should trigger repo findOneBy', async () => {
      const repoSpy = jest.spyOn(repo, 'findOneBy');
      await service.findOneByMail('1@.2.3');
      expect(repoSpy).toBeCalled();
    });
  });

  describe('emailVerify', () => {
    it('should trigger repo findOneBy & update', async () => {
      const repoSpyFind = jest.spyOn(repo, 'findOneBy');
      const updateSpy = jest.spyOn(repo, 'update');
      await service.emailVerify(1);

      expect(repoSpyFind).toBeCalled();
      expect(updateSpy).toBeCalled();
    });
  });

  describe('delete', () => {
    it('should delete an user', async () => {
      const response = await service.deleteOne(1);
      expect(response).toBeTruthy();
    });
  });
});
