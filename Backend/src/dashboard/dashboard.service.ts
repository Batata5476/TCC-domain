import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Task } from '../tasks/entities/task.entity';
import { Humor } from '../wellbeing/entities/humor.entity';
import { FuncTarefa } from '../tasks/entities/func-tarefa.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(Humor)
    private humorRepository: Repository<Humor>,
    @InjectRepository(FuncTarefa)
    private funcTarefaRepository: Repository<FuncTarefa>,
  ) {}

  async getUserDashboard(userId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`Funcionário com ID ${userId} não encontrado`);
    }

    // Conta tarefas associadas a este funcionário que estão pendentes (status = 3) ou em andamento (status = 2)
    const associations = await this.funcTarefaRepository.find({
      where: { fk_id_func: userId },
      relations: ['tarefa'],
    });

    const pendingTasksCount = associations.filter(
      (assoc) =>
        assoc.tarefa &&
        (assoc.tarefa.status_tarefa === 3 || assoc.tarefa.status_tarefa === 2),
    ).length;

    const completedTasksCount = associations.filter(
      (assoc) => assoc.tarefa && assoc.tarefa.status_tarefa === 1,
    ).length;

    return {
      status: 'success',
      data: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        pontos: user.pontos_acumulados || 0,
        foto: user.foto_func,
        tarefasPendentes: pendingTasksCount,
        tarefasConcluidas: completedTasksCount,
      },
    };
  }

  async getCompanyDashboard(companyId: number) {
    const totalFuncionarios = await this.userRepository.count({
      where: { empresa_id: companyId },
    });

    const totalTarefas = await this.taskRepository.count();

    const tarefasPendentes = await this.taskRepository.count({
      where: { status_tarefa: 3 }, // 3 = pendente
    });

    const tarefasConcluidas = await this.taskRepository.count({
      where: { status_tarefa: 1 }, // 1 = concluida
    });

    // Dashboard V3 - Humor
    const humorMedioRaw = await this.humorRepository
      .createQueryBuilder('humor')
      .select('AVG(humor.humor_func)', 'media')
      .getRawOne();

    const humorMedio = Number(humorMedioRaw.media || 0).toFixed(1);

    const ultimoHumor = await this.humorRepository.findOne({
      where: {},
      order: {
        dth_humor: 'DESC',
      },
    });

    const totalHumores = await this.humorRepository.count();

    return {
      totalFuncionarios,
      totalTarefas,
      tarefasPendentes,
      tarefasConcluidas,
      humor: {
        media: humorMedio,
        totalRegistros: totalHumores,
        ultimoRegistro: ultimoHumor,
      },
    };
  }
}
