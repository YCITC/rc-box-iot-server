import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import User from './entity/user.entity';
import UsersController from './users.controller';
import UsersService from './users.service';

describe('Users controller', () => {
  let controller: UsersController;
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
    const app: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOneBy: jest.fn().mockResolvedValue(testUser),
            save: (user) => {
              return Promise.resolve({
                ...user,
                createdTime: new Date(),
                isEmailVerified: false,
              });
            },
            delete: jest.fn().mockResolvedValue({ affected: 1 }),
          },
        },
      ],
    }).compile();

    controller = app.get<UsersController>(UsersController);
  });
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('addOne', () => {
    it('should return a user', async () => {
      const user = await controller.addOne(rawUser);
      expect(user.createdTime).toBeDefined();
      expect(user.isEmailVerified).toBeDefined();
    });

    it('password should be hashed', async () => {
      const user = await controller.addOne(rawUser);
      expect(user.password === rawUser.password).toBeFalsy();
    });
  });

  describe('findByMail', () => {
    it('should return a user', async () => {
      const user = await controller.findByMail('1@.2.3');
      expect(user.isEmailVerified).toBeFalsy();
      expect(user.createdTime).toBeDefined();
    });
  });

  describe('delete', () => {
    it('should delete an user', async () => {
      const response = await controller.deleteOne(1);
      expect(response).toBeTruthy();
    });
  });
});
