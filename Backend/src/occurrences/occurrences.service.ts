import { Injectable } from '@nestjs/common';
import { CreateOccurrenceDto } from './dto/create-occurrence.dto';

@Injectable()
export class OccurrencesService {
  findAll() {
    return [];
  }

  findOne(id: number) {
    return { id, message: 'Ocorrência encontrada' };
  }

  create(createOccurrenceDto: CreateOccurrenceDto) {
    return { message: 'Ocorrência criada', data: createOccurrenceDto };
  }

  update(id: number, updateDto: Partial<CreateOccurrenceDto>) {
    return { id, message: 'Ocorrência atualizada', data: updateDto };
  }

  remove(id: number) {
    return { id, message: 'Ocorrência removida' };
  }
}
