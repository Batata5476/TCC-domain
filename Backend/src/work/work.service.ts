import { Injectable } from '@nestjs/common';
import { CreateWorkDto } from './dto/create-work.dto';

@Injectable()
export class WorkService {
  findAll() {
    return [];
  }

  findOne(id: number) {
    return { id, message: 'Registro de trabalho encontrado' };
  }

  create(createWorkDto: CreateWorkDto) {
    return { message: 'Registro de trabalho criado', data: createWorkDto };
  }

  update(id: number, updateDto: Partial<CreateWorkDto>) {
    return { id, message: 'Registro de trabalho atualizado', data: updateDto };
  }

  remove(id: number) {
    return { id, message: 'Registro de trabalho removido' };
  }
}
