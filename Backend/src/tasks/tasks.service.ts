import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
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

  private async validateTaskAccess(taskId: number, caller: any): Promise<FuncTarefa> {
    const callerId = caller.userId || caller.sub;

    const relations = await this.funcTarefaRepository.find({
      where: { fk_id_tarefa: taskId },
    });

    if (relations.length === 0) {
      throw new NotFoundException('Tarefa não encontrada');
    }

    if (caller.type === 'user') {
      const userRelation = relations.find((r) => r.fk_id_func === callerId);
      if (!userRelation) {
        throw new ForbiddenException('Você não possui acesso a esta tarefa');
      }
      return userRelation;
    }

    if (caller.type === 'company') {
      const companyRelation = relations.find((r) => r.fk_cod_empresa === callerId);
      if (!companyRelation) {
        throw new ForbiddenException('Esta tarefa não pertence à sua empresa');
      }
      return companyRelation;
    }

    throw new ForbiddenException('Tipo de usuário inválido');
  }

  async create(
    data: {
      tipo_tarefa: string;
      validade_tarefa: Date;
      prioridade_tarefa: number;
      fk_id_func: number;
    },
    caller: any,
  ) {
    if (caller.type !== 'company') {
      throw new ForbiddenException('Apenas empresas podem criar tarefas');
    }

    const callerId = caller.userId || caller.sub;

    if (!data.fk_id_func) {
      throw new BadRequestException('É necessário informar o funcionário (fk_id_func) para atribuir a tarefa');
    }

    // Validar se o funcionário existe e pertence à mesma empresa
    const employee = await this.userRepository.findOne({
      where: { pk_id_func: data.fk_id_func },
    });

    if (!employee) {
      throw new NotFoundException('Funcionário não encontrado');
    }

    if (employee.fk_cod_empresa !== callerId) {
      throw new ForbiddenException('Este funcionário não pertence à sua empresa');
    }

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
      fk_cod_empresa: callerId,
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

  async updateStatus(taskId: number, status: number, caller: any) {
    await this.validateTaskAccess(taskId, caller);

    const task = await this.taskRepository.findOne({
      where: { pk_id_tarefas: taskId },
    });

    if (!task) {
      throw new NotFoundException(`Tarefa com ID ${taskId} não encontrada`);
    }

    // Regras de transição de status para funcionários
    if (caller.type === 'user') {
      const currentStatus = task.status_tarefa;
      const isAllowed =
        (currentStatus === 3 && status === 2) || // Pendente -> Em andamento
        (currentStatus === 2 && status === 1);   // Em andamento -> Concluída

      if (!isAllowed) {
        throw new ForbiddenException(
          `Transição de status inválida para funcionários (de ${currentStatus} para ${status})`,
        );
      }
    }

    // Regras de transição para Empresa (Opção B)
    if (caller.type === 'company') {
      if (status === 1) {
        throw new ForbiddenException(
          'Empresas não podem marcar tarefas diretamente como concluídas (evita concessão imprópria de pontos)',
        );
      }
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

  async findOne(id: number, caller: any) {
    await this.validateTaskAccess(id, caller);

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

  async remove(id: number, caller: any) {
    if (caller.type !== 'company') {
      throw new ForbiddenException('Apenas empresas podem excluir tarefas');
    }

    await this.validateTaskAccess(id, caller);

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
