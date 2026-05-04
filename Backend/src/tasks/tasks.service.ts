import { Injectable } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';

@Injectable()
export class TasksService {
  findAll() {
    return [];
  }

  findOne(id: number) {
    return { id, message: 'Tarefa encontrada' };
  }

  create(createTaskDto: CreateTaskDto) {
    return { message: 'Tarefa criada', data: createTaskDto };
  }

  update(id: number, updateDto: Partial<CreateTaskDto>) {
    return { id, message: 'Tarefa atualizada', data: updateDto };
  }

  remove(id: number) {
    return { id, message: 'Tarefa removida' };
  }
}
