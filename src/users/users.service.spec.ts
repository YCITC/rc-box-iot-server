import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException } from '@nestjs/common';
import User from './entity/user.entity';
import UsersService from './users.service';
import UserAction from './entity/user-action.entity';

describe('UsersService', () => {
  let service: UsersService;
  let user: User;
  let userRepository: Repository<User>;
  let userActionRepository: Repository<UserAction>;
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
            findOne: jest.fn().mockResolvedValue(testUser),
            create: jest.fn().mockResolvedValue(testUser),
            save: (inputUser: User) => {
              return Promise.resolve({
                ...inputUser,
                createdTime: new Date(),
                isEmailVerified: false,
              });
            },
            update: jest.fn().mockResolvedValue({ affected: 1 }),
            delete: jest.fn().mockResolvedValue({ affected: 1 }),
            count: jest.fn().mockResolvedValue(10),
          },
        },
        {
          provide: getRepositoryToken(UserAction),
          useValue: {
            findOneBy: jest.fn().mockResolvedValue(testUser),
            save: (userAction) => {
              return Promise.resolve({
                ...userAction,
                id: 1,
              });
            },
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    userActionRepository = module.get<Repository<UserAction>>(
      getRepositoryToken(UserAction),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addOne', () => {
    it('should return a user', async () => {
      user = await service.addOne(rawUser);
      expect(user.createdTime).toBeDefined();
      expect(user.isEmailVerified).toBeDefined();
      expect(user.password === rawUser.password).toBeFalsy();
    });
    it('should throw Exception with "Require email"', async () => {
      const userData = { ...rawUser };
      delete userData.email;
      const process = service.addOne(userData);
      await expect(process).rejects.toThrowError(
        new BadRequestException('Require email'),
      );
    });
    it('should throw Exception with "Require username"', async () => {
      const userData = { ...rawUser };
      delete userData.username;
      const process = service.addOne(userData);
      await expect(process).rejects.toThrowError(
        new BadRequestException('Require username'),
      );
    });
    it('should throw Exception when save user failed', async () => {
      jest.spyOn(userRepository, 'save').mockRejectedValueOnce({
        sqlMessage: 'Duplicate entry',
      });
      const userData = { ...rawUser };
      const process = service.addOne(userData);
      await expect(process).rejects.toThrow(BadRequestException);
    });
  });

  describe('changePasswosrd', () => {
    it('should return true', async () => {
      const result = await service.changePassword(rawUser.id, rawUser.password);
      expect(result).toEqual(true);
    });
  });

  describe('getUser', () => {
    it('should trigger userRepository findOneBy', async () => {
      const repoSpy = jest.spyOn(userRepository, 'findOneBy');
      user = await service.getUser(rawUser.id);
      expect(repoSpy).toBeCalled();
    });
  });

  describe('getUserAndUserAction', () => {
    it('should trigger userRepository findOne', async () => {
      const repoSpy = jest.spyOn(userRepository, 'findOne');
      await service.getUserAndUserAction(rawUser.id);
      expect(repoSpy).toBeCalled();
    });
  });

  describe('updateProfile', () => {
    it('should trigger userRepository save', async () => {
      const newData = { ...rawUser, zipCode: '11005' };
      const repoSpy = jest.spyOn(userRepository, 'save');
      await service.updateProfile(newData);
      expect(repoSpy).toBeCalled();
    });
  });

  describe('getUserAction', () => {
    it('should trigger userActionRepository findOne', async () => {
      const repoSpy = jest.spyOn(userActionRepository, 'findOneBy');
      await service.getUserAction(user);
      expect(repoSpy).toBeCalled();
    });
  });

  describe('updateUserAction', () => {
    it('should trigger userRepository save', async () => {
      const repoSpy = jest.spyOn(userActionRepository, 'save');
      await service.updateUserAction(user, 'fake-sessionId-1');
      await service.updateUserAction(user, 'fake-sessionId-2');
      expect(repoSpy).toBeCalled();
    });
  });

  describe('findOneById', () => {
    it('should trigger userRepository findOneBy', async () => {
      const repoSpy = jest.spyOn(userRepository, 'findOneBy');
      await service.findOneById(1);
      expect(repoSpy).toBeCalled();
    });
  });

  describe('findByMail', () => {
    it('should trigger userRepository findOneBy', async () => {
      const repoSpy = jest.spyOn(userRepository, 'findOne');
      await service.findOneByMail('1@.2.3');
      expect(repoSpy).toBeCalled();
    });
  });

  describe('emailVerify', () => {
    it('should trigger userRepository findOneBy & save', async () => {
      const repoSpyFind = jest.spyOn(userRepository, 'findOneBy');
      const updateSpy = jest.spyOn(userRepository, 'save');
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

  describe('countAllUsers', () => {
    it('should call usersRepository.count', async () => {
      const spy = jest.spyOn(userRepository, 'count');
      const response = await service.countAllUsers();
      expect(response).toBe(10);
      expect(spy).toBeCalled();
    });
  });
});
