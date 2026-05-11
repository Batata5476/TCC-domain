import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Company } from './entities/company.entity';
import { CreateCompanyDto } from './dto/create-company.dto';

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
  ) {}

  async findAll(userId: number) {
    const companies = await this.companyRepository.find({
      where: { pk_cod_empresa: userId },
    });
    return {
      status: 'success',
      message: 'Empresas listadas com sucesso',
      data: companies,
    };
  }

  async findOne(id: number, userId: number) {
    const company = await this.companyRepository.findOne({
      where: { pk_cod_empresa: id },
    });

    if (!company) {
      throw new NotFoundException(`Empresa com ID ${id} não encontrada`);
    }

    // Segurança: Uma empresa só pode ver seus próprios dados
    if (company.pk_cod_empresa !== userId) {
      throw new ForbiddenException('Você não tem permissão para acessar esta empresa');
    }

    return {
      status: 'success',
      message: 'Empresa encontrada',
      data: company,
    };
  }

  async create(createCompanyDto: CreateCompanyDto) {
    const { senha_empresa, ...rest } = createCompanyDto;
    const hashedPassword = await bcrypt.hash(senha_empresa, 10);
    
    const company = this.companyRepository.create({
      ...rest,
      senha_empresa: hashedPassword,
    });
    const saved = await this.companyRepository.save(company);
    return {
      status: 'success',
      message: 'Empresa criada com sucesso',
      data: saved,
    };
  }

  async update(id: number, updateCompanyDto: Partial<CreateCompanyDto>, userId: number) {
    await this.findOne(id, userId); // Já verifica existência e permissão
    await this.companyRepository.update(id, updateCompanyDto);
    const updated = await this.findOne(id, userId);
    return {
      status: 'success',
      message: 'Empresa atualizada com sucesso',
      data: updated.data,
    };
  }

  async remove(id: number, userId: number) {
    const response = await this.findOne(id, userId);
    await this.companyRepository.remove(response.data as Company);
    return {
      status: 'success',
      message: 'Empresa removida com sucesso',
    };
  }
}
