import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Company } from './entities/company.entity';
import { CreateCompanyDto } from './dto/create-company.dto';
import { User } from '../users/entities/user.entity';
import { Role } from '../users/entities/role.entity';

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  async findAll(empresaId: number) {
    const companies = await this.companyRepository.find({
      where: { id: empresaId },
    });
    return {
      status: 'success',
      message: 'Empresas listadas com sucesso',
      data: companies,
    };
  }

  async findOne(id: number, empresaId: number) {
    const company = await this.companyRepository.findOne({
      where: { id },
    });

    if (!company) {
      throw new NotFoundException(`Empresa com ID ${id} não encontrada`);
    }

    if (company.id !== empresaId) {
      throw new ForbiddenException('Você não tem permissão para acessar esta empresa');
    }

    return {
      status: 'success',
      message: 'Empresa encontrada',
      data: company,
    };
  }

  async create(createCompanyDto: CreateCompanyDto) {
    const { senha_empresa, cnpj, nome, email, tipo_empresa } = createCompanyDto;
    
    // 1. Salvar empresa na tabela 'empresa'
    const company = this.companyRepository.create({
      cnpj: cnpj.replace(/\D/g, ''),
      nome,
      email,
      tipo_empresa,
    });
    const savedCompany = await this.companyRepository.save(company);

    // 2. Criar correspondente usuário master na tabela 'usuario'
    const adminRole = await this.roleRepository.findOne({
      where: { nome: 'Administrador Master' },
    });
    if (!adminRole) {
      throw new NotFoundException('Role Administrador Master não encontrada no banco');
    }

    const hashedPassword = await bcrypt.hash(senha_empresa, 10);
    const uniqueCpf = String(10000000000 + savedCompany.id); // CPF único fictício

    const masterUser = this.userRepository.create({
      empresa_id: savedCompany.id,
      role_id: adminRole.id,
      nome: `Admin ${savedCompany.nome}`,
      email: savedCompany.email,
      cpf: uniqueCpf,
      senha: hashedPassword,
      status: 'ACTIVE',
      primeiro_acesso: false,
      cargo: 'Administrador Master',
    });
    await this.userRepository.save(masterUser);

    return {
      status: 'success',
      message: 'Empresa e Usuário Master criados com sucesso',
      data: savedCompany,
    };
  }

  async update(id: number, updateCompanyDto: Partial<CreateCompanyDto>, empresaId: number) {
    await this.findOne(id, empresaId); // Verifica existência e permissão
    const cleanedDto: any = {};
    if (updateCompanyDto.nome !== undefined) cleanedDto.nome = updateCompanyDto.nome;
    if (updateCompanyDto.email !== undefined) cleanedDto.email = updateCompanyDto.email;
    if (updateCompanyDto.cnpj !== undefined) cleanedDto.cnpj = updateCompanyDto.cnpj.replace(/\D/g, '');
    if (updateCompanyDto.tipo_empresa !== undefined) cleanedDto.tipo_empresa = updateCompanyDto.tipo_empresa;

    await this.companyRepository.update(id, cleanedDto);
    const updated = await this.findOne(id, empresaId);
    return {
      status: 'success',
      message: 'Empresa atualizada com sucesso',
      data: updated.data,
    };
  }

  async remove(id: number, empresaId: number) {
    const response = await this.findOne(id, empresaId);
    await this.companyRepository.remove(response.data as Company);
    return {
      status: 'success',
      message: 'Empresa removida com sucesso',
    };
  }
}
