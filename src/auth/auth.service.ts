import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import UserLoginDto from '../users/dto/user.login.dto';
import UsersService from '../users/users.service';

@Injectable()
export default class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(userDto: UserLoginDto): Promise<any> {
    const user = await this.usersService.findOneByMail(userDto.email);
    const result = await bcrypt.compare(userDto.password, user.password);
    if (user && result === true) {
      delete user.password;
      return Promise.resolve(user);
    }
    return Promise.reject(
      new UnauthorizedException('email or password incorrect'),
    );
  }

  async validateGoogleUser(details): Promise<any> {
    try {
      return await this.usersService.findOneByMail(details.email);
    } catch (error) {
      const user = this.usersService.addOne(details);
      return user;
    }
  }

  createToken(user: any) {
    const signOptions = {
      secret: this.configService.get('JWT.SECRET'),
    };
    const payload = { id: user.id, username: user.username };
    const token = this.jwtService.sign(payload, signOptions);
    return token;
  }

  // TODO: createRefreshToken, setcookie, httponly

  createOneDayToken(user: any) {
    const signOptions = {
      expiresIn: '1d',
      issuer: this.configService.get('JWT.ISSUER'),
      secret: this.configService.get('JWT.SECRET'),
    };
    const payload = { id: user.id, username: user.username };
    const token = this.jwtService.sign(payload, signOptions);
    return token;
  }

  async verifyToken(token: string): Promise<any> {
    const payload = await this.jwtService.verify(token, {
      secret: this.configService.get('JWT.SECRET'),
    });
    return Promise.resolve(payload);
  }
}
