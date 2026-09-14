import { Controller, Post, Body, Ip, Headers } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Throttle } from '@nestjs/throttler'
import { ValidateFirstAccessDto } from './dto/validate-first-access.dto';
import { ActivateFirstAccessDto } from './dto/activate-first-access.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}


  // Limite de requisições para 5 por minuto para evitar brute force
  @Throttle({ default: { limit: 5, ttl: 60 * 1000} })
  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    return this.authService.login(dto, ip, userAgent);
  }
  // Limite de requisições para 5 por minuto para evitar brute force
  @Throttle({ default: { limit: 5, ttl: 60 * 1000} })
  @Post('first-access/validate')
  async validateFirstAccess(@Body() dto: ValidateFirstAccessDto) {
    return this.authService.validateFirstAccess(dto);
  }

  // Limite de requisições para 5 por minuto para evitar brute force
  @Throttle({ default: { limit: 5, ttl: 60 * 1000} })
  @Post('first-access/activate')
  async activateFirstAccess(
    @Body() dto: ActivateFirstAccessDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    return this.authService.activateFirstAccess(dto, ip, userAgent);
  }

  // Limite de requisições para a cada 15 minutos para evitar brute force
  @Throttle({ default: { limit: 5, ttl: 15 * 60 * 1000 } })
  @Post('forgot-password')
  async forgotPassword(
    @Body() dto: ForgotPasswordDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    return this.authService.forgotPassword(dto, ip, userAgent);
  }
}
