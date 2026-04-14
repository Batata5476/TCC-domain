import { Injectable } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  loginUser(data: LoginDto) {
    return { message: 'Login de funcionário funcionando', data };
  }

  loginCompany(data: LoginDto) {
    return { message: 'Login de empresa funcionando', data };
  }

  registerUser(data: RegisterDto) {
    return { message: 'Registro de funcionário funcionando', data };
  }

  registerCompany(data: RegisterDto) {
    return { message: 'Registro de empresa funcionando', data };
  }
}
