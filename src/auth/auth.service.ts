import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import UserChangePasswrodDto from '../users/dto/user.change-password.dto';
import UserLoginDto from '../users/dto/user.login.dto';
import JwtPayload from './interface/jwt-payload';
import UsersService from '../users/users.service';
import UserInterface from '../users/interface/user.interface';
import TokenType from './enum/token-type';
import User from '../users/entity/user.entity';
import RolesEnum from '../common/enum';

@Injectable()
export default class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(dto: UserLoginDto): Promise<UserInterface> {
    const user = await this.usersService.findOneByMail(dto.email);
    const result = await bcrypt.compare(dto.password, user.password);
    if (user && result === true) {
      delete user.password;
      return Promise.resolve(user);
    }
    throw new UnauthorizedException('email or password incorrect');
  }

  async changePassword(
    userId: number,
    dto: UserChangePasswrodDto,
  ): Promise<boolean> {
    const passwordPolicy =
      /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@$!%*#?&_+=]).{8,}/.test(
        dto.newPassword,
      );
    if (passwordPolicy === false)
      throw new BadRequestException('Password policy failed');

    if (dto.newPassword !== dto.confirmNewPassword)
      throw new BadRequestException('New password verification failed');

    if (dto.oldPassword === dto.newPassword)
      throw new BadRequestException('Can not use same password');

    const user = await this.usersService.findOneById(userId);
    if (user.password.length > 0) {
      const oldPasswordVerification = await bcrypt.compare(
        dto.oldPassword,
        user.password,
      );
      if (oldPasswordVerification === false)
        throw new UnauthorizedException('Old password incorrect');
    }
    return this.usersService.changePassword(userId, dto.newPassword);
  }

  async resetPassword(
    userId: number,
    dto: UserChangePasswrodDto,
  ): Promise<boolean> {
    const passwordPolicy =
      /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@$!%*#?&]).{8,}/.test(
        dto.newPassword,
      );
    if (passwordPolicy === false)
      throw new BadRequestException('Password policy failed');

    if (dto.newPassword !== dto.confirmNewPassword)
      throw new BadRequestException('New password verification failed');

    return this.usersService.changePassword(userId, dto.newPassword);
  }

  async validateGoogleUser(details): Promise<User> {
    try {
      return await this.usersService.findOneByMail(details.email);
    } catch (error) {
      const user = this.usersService.addOne(details);
      return user;
    }
  }

  createToken(payload: JwtPayload<TokenType>): string {
    const signOptions = {
      secret: this.configService.get('JWT.SECRET'),
    } as JwtSignOptions;

    const newPayload = { ...payload };
    switch (payload.type) {
      case TokenType.RESET_PASSWORD:
        signOptions.expiresIn = '12hr';
        break;
      case TokenType.EMAIL_VERIFY:
        signOptions.expiresIn = '1d';
        break;
      case TokenType.REFRESH:
        signOptions.expiresIn = '60d';
        break;
      case TokenType.AUTH:
        signOptions.expiresIn = '1hr';
        if (payload.id === 1) newPayload.role = RolesEnum.ADMIN;
        break;
      default:
        signOptions.expiresIn = '1hr';
        break;
    }

    const token = this.jwtService.sign(newPayload, signOptions);
    return token;
  }

  async verifyToken(token: string): Promise<JwtPayload<TokenType>> {
    const payload = await this.jwtService.verify(token, {
      secret: this.configService.get('JWT.SECRET'),
    });
    return Promise.resolve(payload);
  }
}
