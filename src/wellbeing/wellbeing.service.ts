import { Injectable } from '@nestjs/common';
import { CreateWellbeingDto } from './dto/create-wellbeing.dto';

@Injectable()
export class WellbeingService {
  findAll() {
    return [];
  }

  findOne(id: number) {
    return { id, message: 'Registro de bem-estar encontrado' };
  }

  create(createWellbeingDto: CreateWellbeingDto) {
    return { message: 'Registro de bem-estar criado', data: createWellbeingDto };
  }

  update(id: number, updateDto: Partial<CreateWellbeingDto>) {
    return { id, message: 'Registro de bem-estar atualizado', data: updateDto };
  }

  remove(id: number) {
    return { id, message: 'Registro de bem-estar removido' };
  }
}
