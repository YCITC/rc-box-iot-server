import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import User from './entity/user.entity';
import UsersController from './users.controller';
import UsersService from './users.service';

describe('Users controller', () => {
  let controller: UsersController;
  let service: UsersService;
  const rawUser = {
    email: '1@2.3',
    username: 'Tester',
    fullName: 'Tester Jest',
    password: 'weNeedPassword',
    phoneNumber: '0900123456',
    address: 'No. 7, Section 5, Xinyi Road, Xinyi District · Taipei · Taiwan',
    zipCode: '110',
  };
  const testUser = new User(
    rawUser.email,
    rawUser.username,
    rawUser.fullName,
    rawUser.password,
    rawUser.phoneNumber,
    rawUser.address,
    rawUser.zipCode,
  );

  beforeEach(async () => {
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
    service = app.get<UsersService>(UsersService);
  });
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('addOne', () => {
    it('UsersService.addOne should be called', async () => {
      const spy = jest.spyOn(service, 'addOne').mockResolvedValue(testUser);
      await controller.addOne(rawUser);
      expect(spy).toBeCalled();
    });
  });

  describe('findByMail', () => {
    it('UsersService.findOneByMail should be called', async () => {
      const spy = jest
        .spyOn(service, 'findOneByMail')
        .mockResolvedValue(testUser);
      const user = await controller.findByMail('1@.2.3');
      expect(user).toBe(testUser);
      expect(spy).toBeCalled();
    });
  });

  describe('findById', () => {
    it('should return a user', async () => {
      const spy = jest
        .spyOn(service, 'findOneById')
        .mockResolvedValue(testUser);
      const user = await controller.findById(1);
      expect(user).toBe(testUser);
      expect(spy).toBeCalled();
    });
  });

  describe('delete', () => {
    it('UserService.deleteOne should delete an user', async () => {
      const spy = jest.spyOn(service, 'deleteOne').mockResolvedValue(true);
      const response = await controller.deleteOne(1);
      expect(response).toBeTruthy();
      expect(spy).toBeCalled();
    });
  });
});
