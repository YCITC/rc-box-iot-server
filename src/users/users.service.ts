import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserRegisterDto } from './dto/user.register.dto';
import { User } from './entity/user.entity';

export type UserObj = any;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async addOne(userRegisterDto: UserRegisterDto): Promise<User> {
    if (userRegisterDto.password === undefined) {
      throw new BadRequestException('Require password');
    }
    if (userRegisterDto.email === undefined) {
      throw new BadRequestException('Require email');
    }
    if (userRegisterDto.username === undefined) {
      throw new BadRequestException('Require username');
    }

    const hashedPassword = await bcrypt.hash(userRegisterDto.password, 5);
    try {
      const user = await this.usersRepository.save({
        ...userRegisterDto,
        password: hashedPassword,
      });
      return Promise.resolve(user);
    } catch (error) {
      if (error.sqlMessage.indexOf('Duplicate entry') > -1) {
        throw new BadRequestException(`Email [${userRegisterDto.email}] exist`);
      }
    }
  }

  async deleteOne(id: number): Promise<any> {
    const response = await this.usersRepository.delete({ id });
    /*
     * usersRepository response like this
     * DeleteResult { raw: [], affected: 1 }
     */
    if (response.affected == 1) {
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
  async emailVerify(id: number): Promise<any> {
    try {
      const userObj = await this.usersRepository.findOneBy({ id });
      /*
      * 流程設計上，驗證過就在驗證過一次。
      * 怕有人無聊一直點，就用token過期來處理。
      // if (userObj.isEmailVerified) {
      //   throw new BadRequestException('Email already Verified');
      // }
      */
      userObj.isEmailVerified = true;
      const updateResult = await this.usersRepository.update(id, userObj);
      if (updateResult.affected == 1) {
        return Promise.resolve(userObj);
      } else {
        throw new BadRequestException(
          'Email Verify Failed, Cannot update user with id:' + id,
        );
      }
    } catch (error) {
      console.log(error);
      if (error.message.indexOf('Cannot set properties of null') > -1) {
        throw new BadRequestException('Cannot find user with id:' + id);
      }
      throw new BadRequestException(error.message);
    }
  }
}
