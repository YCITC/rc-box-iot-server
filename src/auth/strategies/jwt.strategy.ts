import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

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

  async validate(payload: any) {
    // console.log('JwtStrategy validating');
    // console.log(payload);
    return { username: payload.username, id: payload.id };
  }
}
