import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import axios from 'axios';

import { InjectRepository } from '@nestjs/typeorm';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InternalServerErrorException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { paginate } from 'nestjs-typeorm-paginate';

import UserRegisterDto from './dto/user.register.dto';
import UserProfileDto from './dto/user.profile.dto';
import UserGetAllDto from './dto/user.getall.dto';
import User from './entity/user.entity';
import UserAction from './entity/user-action.entity';
import { PaginateInterface } from '../common/interface';

@Injectable()
export default class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(UserAction)
    private userActionRepository: Repository<UserAction>,
  ) {}

  async addOne(userRegisterDto: UserRegisterDto): Promise<User> {
    if (userRegisterDto.email === undefined) {
      throw new BadRequestException('Require email');
    }
    if (userRegisterDto.username === undefined) {
      throw new BadRequestException('Require username');
    }

    const hashedPassword = await bcrypt.hash(userRegisterDto.password, 5);
    let user;
    try {
      user = await this.usersRepository.save({
        ...userRegisterDto,
        password: hashedPassword,
        userAction: {
          loginTimes: 0,
          sessionId: '',
        },
      });
    } catch (error) {
      if (error.sqlMessage.indexOf('Duplicate entry') > -1) {
        throw new BadRequestException(`Email [${userRegisterDto.email}] exist`);
      }
      throw error;
    }
    return Promise.resolve(user);
  }

  async changePassword(id: number, password: string): Promise<boolean> {
    try {
      const hashedPassword = await bcrypt.hash(password, 5);
      await this.usersRepository.save({ id, password: hashedPassword });
      return await Promise.resolve(true);
    } catch (error) {
      return Promise.reject(
        new InternalServerErrorException('Can not change user password'),
      );
    }
  }

  async getUser(userId: number): Promise<User> {
    return this.usersRepository.findOneBy({ id: userId });
  }

  async getUserAndUserAction(userId: number): Promise<User> {
    return this.usersRepository.findOne({
      where: { id: userId },
      relations: ['userAction'],
    });
  }

  async updateProfile(userProfileDto: UserProfileDto): Promise<User> {
    const user = await this.usersRepository.save(userProfileDto);
    return Promise.resolve(user);
  }

  async getUserAction(user: User): Promise<UserAction> {
    return this.userActionRepository.findOneBy({
      id: user.id,
    });
  }

  async updateUserAction(
    user: User,
    sessionId: string,
  ): Promise<string | null> {
    let oldSessionId: string | null = null;
    let userAction = await this.userActionRepository.findOneBy({
      id: user.id,
    });

    if (userAction) {
      oldSessionId = userAction.sessionId;
      userAction.loginTimes += 1;
      userAction.sessionId = sessionId;
    } else {
      userAction = {
        loginTimes: 1,
        sessionId,
        user,
      } as UserAction;
    }

    await this.userActionRepository.save(userAction);
    return oldSessionId;
  }

  async deleteOne(id: number): Promise<boolean> {
    const response = await this.usersRepository.delete({ id });
    /*
     * usersRepository response like this
     * DeleteResult { raw: [], affected: 1 }
     */
    if (response.affected === 1) {
      return Promise.resolve(true);
    }
    throw new BadRequestException('User not found');
  }

  async findOneById(id: number): Promise<User> {
    const userObj = await this.usersRepository.findOneBy({ id });
    if (userObj) {
      return Promise.resolve(userObj);
    }
    throw new BadRequestException('Cannot find user');
  }

  async findOneByMail(email: string): Promise<User> {
    const userObj = await this.usersRepository.findOne({
      where: { email },
      relations: ['userAction'],
    });
    if (userObj) {
      return Promise.resolve(userObj);
    }
    throw new BadRequestException('Cannot find user');
  }

  async emailVerify(id: number): Promise<boolean> {
    try {
      const userObj = await this.usersRepository.findOneBy({ id });
      // TODO:
      /* 
      * 流程設計上，驗證過就在驗證過一次。
      * 怕有人無聊一直點，就用token過期來處理。
      // if (userObj.isEmailVerified) {
      //   throw new BadRequestException('Email already Verified');
      // }
      */
      userObj.isEmailVerified = true;
      await this.usersRepository.save({
        id,
        isEmailVerified: true,
      });
      return await Promise.resolve(true);
    } catch (error) {
      if (error.message.indexOf('Cannot set properties of null') > -1) {
        throw new BadRequestException(`Cannot find user with id:${id}`);
      }
      throw new BadRequestException(error.message);
    }
  }

  async countAllUsers(): Promise<number> {
    return this.usersRepository.count();
  }

  async getAll(dto: UserGetAllDto): Promise<PaginateInterface<User>> {
    const result = await paginate(this.usersRepository, dto.paginateOptions, {
      order: {
        id: 'DESC',
      },
      relations: ['userAction'],
    });
    return result;
  }

  async getGravatarUrl(email: string): Promise<string | null> {
    const hash = crypto.createHash('md5').update(email).digest('hex');
    try {
      await axios.get(`https://www.gravatar.com/avatar/${hash}?d=404`);
      return `https://www.gravatar.com/avatar/${hash}`;
    } catch (error) {
      return '';
    }
  }
}
