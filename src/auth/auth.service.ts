import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersDto } from '../users/dto/users.dto';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { jwtConstants } from './constants';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(userDto: UsersDto): Promise<any> {
    const user = await this.usersService.findOne(userDto.username);
    const returnUser = { ...user };
    if (user && user.password === userDto.password) {
      delete returnUser.password;
      return Promise.resolve(returnUser);
    }
    return Promise.reject(
      new UnauthorizedException('username or password incorrect'),
    );
  }

  async createToken(user: any) {
    const signOptions = { secret: jwtConstants.secret };
    const token = this.jwtService.sign(user, signOptions);
    return {
      access_token: token,
    };
  }
}
