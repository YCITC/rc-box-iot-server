import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { Profile, Strategy } from 'passport-google-oauth20';
import AuthService from '../auth.service';

@Injectable()
export default class GoogleStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      clientID: configService.get('google.OAuth2.clientID'),
      clientSecret: configService.get('google.OAuth2.clientSecret'),
      callbackURL:
        configService.get('PROTOCOL') +
        configService.get('SERVER_HOSTNAME') +
        configService.get('google.OAuth2.callbackRoute'),
      scope: ['profile', 'email'],
      // passReqToCallback: true,
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile) {
    const user = await this.authService.validateGoogleUser({
      email: profile.emails[0].value,
      username: profile.displayName,
      password: '',
      phoneNumber: '',
      address: '',
      zipCode: '',
      fullName: `${profile.name.givenName} ${profile.name.familyName}`,
      // eslint-disable-next-line no-underscore-dangle
      isEmailVerified: profile._json.email_verified,
    });
    const avatarUrl = profile.photos[0].value;
    return { ...user, avatarUrl } || null;
  }
}
