import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('user/login')
  loginUser(@Body() body: LoginDto) {
    return this.authService.loginUser(body);
  }

  @Post('company/login')
  loginCompany(@Body() body: LoginDto) {
    return this.authService.loginCompany(body);
  }

  @Post('user/register')
  registerUser(@Body() body: RegisterDto) {
    return this.authService.registerUser(body);
  }

  @Post('company/register')
  registerCompany(@Body() body: RegisterDto) {
    return this.authService.registerCompany(body);
  }
}
