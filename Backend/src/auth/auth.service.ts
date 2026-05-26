import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto } from './dto/login-user.dto';
import { LoginCompanyDto } from './dto/login-company.dto';
import { Company } from '../company/entities/company.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async loginUser(dto: LoginUserDto) {
    const { cpf, senha } = dto;

    const cleanCpf = cpf.replace(/\D/g, '');

    const user = await this.userRepository
      .createQueryBuilder('user')
      .where('user.cpf_func = :cpf', { cpf: cleanCpf })
      .addSelect('user.senha_func')
      .getOne();

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const isPasswordValid = await bcrypt.compare(senha, user.senha_func);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const payload = {
      sub: user.pk_id_func,
      cpf: user.cpf_func,
      type: 'user' as const,
    };

    const token = this.jwtService.sign(payload);

    return {
      status: 'success',
      message: 'Login realizado com sucesso',
      data: {
        access_token: token,
        user: {
          id: user.pk_id_func,
          nome: user.nome_func,
          email: user.email_func,
        },
      },
    };
  }

  async loginCompany(dto: LoginCompanyDto) {
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

    const payload = {
      sub: company.pk_cod_empresa,
      cnpj: company.cnpj_empresa,
      type: 'company' as const,
    };

    const token = this.jwtService.sign(payload);

    return {
      status: 'success',
      message: 'Login realizado com sucesso',
      data: {
        access_token: token,
      },
    };
  }
}
