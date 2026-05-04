import { Injectable } from '@nestjs/common';
import { CreateCompanyDto } from './dto/create-company.dto';

@Injectable()
export class CompanyService {
  findAll() {
    return [];
  }

  findOne(id: number) {
    return { id, message: 'Empresa encontrada' };
  }

  create(createCompanyDto: CreateCompanyDto) {
    return { message: 'Empresa criada', data: createCompanyDto };
  }

  update(id: number, updateCompanyDto: Partial<CreateCompanyDto>) {
    return { id, message: 'Empresa atualizada', data: updateCompanyDto };
  }

  remove(id: number) {
    return { id, message: 'Empresa removida' };
  }
}
