import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import JwtPayload from '../interface/jwt-payload';
import TokenType from '../enum/token-type';

@Injectable()
export default class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: true,
      secretOrKey: configService.get('JWT.SECRET'),
      issuer: configService.get('JWT.ISSUER'),
    });
  }

  async validate(payload: JwtPayload<TokenType>) {
    // console.log('JwtStrategy validating');
    // console.log(payload);
    return payload;
  }
}
