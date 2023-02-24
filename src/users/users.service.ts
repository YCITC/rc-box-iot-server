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
      return Promise.reject(new BadRequestException('Require password'));
    }
    if (userRegisterDto.email === undefined) {
      return Promise.reject(new BadRequestException('Require email'));
    }
    if (userRegisterDto.username === undefined) {
      return Promise.reject(new BadRequestException('Require username'));
    }

    const hashedPassword = await bcrypt.hash(userRegisterDto.password, 5);
    return this.usersRepository
      .save({
        ...userRegisterDto,
        password: hashedPassword,
      })
      .catch((error) => {
        console.error('[Error] sqlMessage: ', error.sqlMessage);
        // console.error('[Error] message: ', error.message);
        if (error.sqlMessage.indexOf('Duplicate entry') > -1) {
          return Promise.reject('Email [' + userRegisterDto.email + '] exist');
        }
      });
  }

  async findOneById(id: number): Promise<User> {
    const userObj = await this.usersRepository.findOneBy({ id });
    if (userObj) {
      const returnUser = { ...userObj };
      return Promise.resolve(returnUser);
    }
    return Promise.reject(new BadRequestException('Cannot find user'));
  }

  async findOneByMail(email: string): Promise<User> {
    const userObj = await this.usersRepository.findOneBy({ email });
    if (userObj) {
      const returnUser = { ...userObj };
      return Promise.resolve(returnUser);
    }
    return Promise.reject(new BadRequestException('Cannot find user'));
  }
}
