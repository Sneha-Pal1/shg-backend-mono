import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ShgAuthService } from '../shg-auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: ShgAuthService) {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET environment variable is not defined');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }
  async validate(payload: any) {
    try {
      const user = this.authService.getUserById(payload.sub);
      return {
        ...user,
        role: payload.role,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid access token');
    }
  }
}
