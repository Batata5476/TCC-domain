import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Task } from '../tasks/entities/task.entity';
import { Humor } from '../wellbeing/entities/humor.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(Humor)
    private humorRepository: Repository<Humor>,
  ) {}

  async getCompanyDashboard(companyId: number) {
    const totalFuncionarios = await this.userRepository.count({
      where: { fk_cod_empresa: companyId },
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
