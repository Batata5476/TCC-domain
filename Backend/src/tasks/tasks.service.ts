import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { FuncTarefa } from './entities/func-tarefa.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(FuncTarefa)
    private readonly funcTarefaRepository: Repository<FuncTarefa>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(data: {
    tipo_tarefa: string;
    validade_tarefa: Date;
    prioridade_tarefa: number;
    fk_id_func: number;
    fk_cod_empresa: number;
  }) {
    // 1. Cria a tarefa
    const task = this.taskRepository.create({
      tipo_tarefa: data.tipo_tarefa,
      validade_tarefa: data.validade_tarefa,
      prioridade_tarefa: data.prioridade_tarefa,
      status_tarefa: 3, // 3 = Pendente por padrão
    });

    const savedTask = await this.taskRepository.save(task);

    // 2. Cria a associação em func_tarefa
    const funcTarefa = this.funcTarefaRepository.create({
      fk_id_func: data.fk_id_func,
      fk_cod_empresa: data.fk_cod_empresa,
      fk_id_tarefa: savedTask.pk_id_tarefas,
    });

    await this.funcTarefaRepository.save(funcTarefa);

    return {
      status: 'success',
      message: 'Tarefa criada e atribuída com sucesso',
      data: savedTask,
    };
  }

  async findAllByEmployee(employeeId: number) {
    const associations = await this.funcTarefaRepository.find({
      where: { fk_id_func: employeeId },
      relations: ['tarefa'],
    });

    const tasks = associations
      .filter((assoc) => assoc.tarefa !== null)
      .map((assoc) => ({
        id: assoc.tarefa.pk_id_tarefas,
        name: assoc.tarefa.tipo_tarefa,
        points: '100', // Padrão de pontos do trigger do banco de dados
        priority: assoc.tarefa.prioridade_tarefa,
        status: assoc.tarefa.status_tarefa,
        dueDate: assoc.tarefa.validade_tarefa,
      }));

    return {
      status: 'success',
      data: tasks,
    };
  }

  async updateStatus(taskId: number, status: number) {
    const task = await this.taskRepository.findOne({
      where: { pk_id_tarefas: taskId },
    });

    if (!task) {
      throw new NotFoundException(`Tarefa com ID ${taskId} não encontrada`);
    }

    task.status_tarefa = status;
    const updated = await this.taskRepository.save(task);

    return {
      status: 'success',
      message: 'Status da tarefa atualizado com sucesso',
      data: updated,
    };
  }

  async findOneUser(userId: number) {
    const user = await this.userRepository.findOne({
      where: { pk_id_func: userId },
    });
    if (!user) {
      throw new NotFoundException(`Funcionário com ID ${userId} não encontrado`);
    }
    return user;
  }

  async findOne(id: number) {
    const task = await this.taskRepository.findOne({
      where: { pk_id_tarefas: id },
    });
    if (!task) {
      throw new NotFoundException(`Tarefa com ID ${id} não encontrada`);
    }
    return {
      status: 'success',
      data: task,
    };
  }

  async remove(id: number) {
    const task = await this.taskRepository.findOne({
      where: { pk_id_tarefas: id },
    });
    if (!task) {
      throw new NotFoundException(`Tarefa com ID ${id} não encontrada`);
    }
    await this.taskRepository.remove(task);
    return {
      status: 'success',
      message: 'Tarefa removida com sucesso',
    };
  }
}
