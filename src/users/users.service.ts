import * as bcrypt from 'bcrypt';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import UserRegisterDto from './dto/user.register.dto';
import UserProfileDto from './dto/user.profile.dto';
import User from './entity/user.entity';

@Injectable()
export default class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
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
      });
    } catch (error) {
      if (error.sqlMessage.indexOf('Duplicate entry') > -1) {
        throw new BadRequestException(`Email [${userRegisterDto.email}] exist`);
      }
    }
    return Promise.resolve(user);
  }

  async changePassword(id: number, password: string): Promise<boolean> {
    try {
      const hashedPassword = await bcrypt.hash(password, 5);
      await this.usersRepository.save({ id, password: hashedPassword });
    } catch (error) {
      return Promise.reject(
        new InternalServerErrorException('Can not change user password'),
      );
    }
    return Promise.resolve(true);
  }

  async updateProfile(userProfileDto: UserProfileDto): Promise<User> {
    const user = await this.usersRepository.save(userProfileDto);
    return Promise.resolve(user);
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
      const returnUser = { ...userObj };
      return Promise.resolve(returnUser);
    }
    throw new BadRequestException('Cannot find user');
  }

  async findOneByMail(email: string): Promise<User> {
    const userObj = await this.usersRepository.findOneBy({ email });
    if (userObj) {
      const returnUser = { ...userObj };
      return Promise.resolve(returnUser);
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
}
