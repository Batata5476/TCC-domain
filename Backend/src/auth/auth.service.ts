import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoginUserDto } from './dto/login-user.dto';
import { LoginCompanyDto } from './dto/login-company.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { RegisterCompanyDto } from './dto/register-company.dto';
import { Company } from '../company/entities/company.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
  ) {}

  loginUser(data: LoginUserDto) {
    return { message: 'Login de funcionário funcionando', data };
  }

  async loginCompany(dto: LoginCompanyDto): Promise<any> {
    const { cnpj, senha } = dto;

    const cleanCnpj = cnpj.replace(/\D/g, '');

    const company = await this.companyRepository.findOne({
      where: { cnpj_empresa: cleanCnpj },
    });

    if (!company) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const isPasswordValid = await bcrypt.compare(
      senha,
      company.senha_empresa,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    return {
      message: 'Login realizado com sucesso',
      data: {
        company: {
          nome_empresa: company.nome_empresa,
          cnpj_empresa: company.cnpj_empresa,
          email_empresa: company.email_empresa,
          tipo_empresa: company.tipo_empresa,
        },
      },
    };
  }

  registerUser(data: RegisterUserDto) {
    return { message: 'Registro de funcionário funcionando', data };
  }

  async registerCompany(data: RegisterCompanyDto): Promise<any> {
    const { senha, cnpj, ...rest } = data;

    const cleanCnpj = cnpj.replace(/\D/g, '');

    const hashedPassword = await bcrypt.hash(senha, 10);

    const company = this.companyRepository.create({
      nome_empresa: rest.nome,
      email_empresa: rest.email,
      tipo_empresa: rest.tipo,
      cnpj_empresa: cleanCnpj,
      senha_empresa: hashedPassword,
    });

    await this.companyRepository.save(company);

    return {
      message: 'Empresa registrada com sucesso',
      data: {
        company: {
          nome_empresa: company.nome_empresa,
          email_empresa: company.email_empresa,
        },
      },
    };
  }
}
