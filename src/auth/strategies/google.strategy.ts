import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { Profile, Strategy } from 'passport-google-oauth20';
import { AuthService } from '../auth.service';

// TODO 弄懂 @Inject(config.KEY) 和 直接用 configService 的差異

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      clientID: configService.get('google.OAuth2.clientID'),
      clientSecret: configService.get('google.OAuth2.clientSecret'),
      callbackURL: configService.get('google.OAuth2.callbackURL'),
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
      fullName: profile.name.givenName + ' ' + profile.name.familyName,
      isEmailVerified: profile._json.email_verified,
    });
    user['avatarUrl'] = profile.photos[0].value;
    return user || null;
  }
}
