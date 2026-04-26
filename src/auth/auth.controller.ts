import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { LoginCompanyDto } from './dto/login-company.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { RegisterCompanyDto } from './dto/register-company.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('user/login')
  async loginUser(@Body() dto: LoginUserDto) {
    return this.authService.loginUser(dto);
  }

  @Post('company/login')
  async loginCompany(@Body() dto: LoginCompanyDto) {
    return this.authService.loginCompany(dto);
  }

  @Post('user/register')
  async registerUser(@Body() dto: RegisterUserDto) {
    return this.authService.registerUser(dto);
  }

  @Post('company/register')
  async registerCompany(@Body() dto: RegisterCompanyDto) {
    return this.authService.registerCompany(dto);
  }
}
