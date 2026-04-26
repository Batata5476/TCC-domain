import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from './dto/login-user.dto';
import { LoginCompanyDto } from './dto/login-company.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { RegisterCompanyDto } from './dto/register-company.dto';

@Injectable()
export class AuthService {
  loginUser(data: LoginUserDto) {
    return { message: 'Login de funcionário funcionando', data };
  }

  async loginCompany(dto: LoginCompanyDto): Promise<any> {
    const { cnpj, senha } = dto;

    const cleanCnpj = cnpj.replace(/\D/g, '');

    // 🔹 mock com hash fixo (bcrypt de '123456') para simular banco sem re-hash
    const companyMock = {
      cnpj: '12345678901234',
      senha: '$2b$10$EPD/pX.Zq.2/t.3bXhGjOu7G8.Yx8BwO2T6N3C/9XG2mF4d.M5e3i',
      nome: 'Empresa Teste',
    };

    if (
      cleanCnpj !== companyMock.cnpj ||
      !(await bcrypt.compare(senha, companyMock.senha))
    ) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    return {
      message: 'Login realizado com sucesso',
      data: {
        company: {
          nome: companyMock.nome,
          cnpj: companyMock.cnpj,
        },
      },
    };
  }

  registerUser(data: RegisterUserDto) {
    return { message: 'Registro de funcionário funcionando', data };
  }

  async registerCompany(data: RegisterCompanyDto): Promise<any> {
    const { senha, ...rest } = data;

    // 🔐 hash da senha
    const hashedPassword = await bcrypt.hash(senha, 10);

    // TODO: salvar no banco de dados

    return {
      message: 'Empresa registrada com sucesso',
      data: {
        company: {
          ...rest,
        },
      },
    };
  }
}
