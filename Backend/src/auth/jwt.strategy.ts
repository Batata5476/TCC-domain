import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  // The returned object is injected as req.user in every guarded route
  async validate(payload: JwtPayload) {
    return {
      userId: payload.sub,
      sub: payload.sub,
      empresa_id: payload.empresa_id,
      role: payload.role,
      type: payload.type || (payload.role === 'Administrador Master' ? 'company' : 'user'),
      permissions: payload.permissions,
    };
  }
}
