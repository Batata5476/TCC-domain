import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Humor } from './entities/humor.entity';
import { User } from '../users/entities/user.entity';
import { CreateWellbeingDto } from './dto/create-wellbeing.dto';

@Injectable()
export class WellbeingService {
  constructor(
    @InjectRepository(Humor)
    private readonly humorRepository: Repository<Humor>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  private async validateWellbeingAccess(humorId: number, caller: any): Promise<Humor> {
    const callerId = caller.userId || caller.sub;

    const humor = await this.humorRepository.findOne({
      where: { pk_id_humor: humorId },
    });

    if (!humor) {
      throw new NotFoundException(`Registro de humor com ID ${humorId} não encontrado`);
    }

    if (caller.type === 'user') {
      if (humor.fk_id_func !== callerId) {
        throw new ForbiddenException('Você não possui acesso a este registro de humor');
      }
    }

    if (caller.type === 'company') {
      const employee = await this.userRepository.findOne({
        where: { pk_id_func: humor.fk_id_func },
      });

      if (!employee || employee.fk_cod_empresa !== callerId) {
        throw new ForbiddenException('Este registro de humor não pertence a um funcionário da sua empresa');
      }
    }

    return humor;
  }

  async create(createWellbeingDto: CreateWellbeingDto, caller: any) {
    if (caller.type !== 'user') {
      throw new ForbiddenException('Apenas funcionários podem registrar humor');
    }

    const callerId = caller.userId || caller.sub;

    // Validar se o funcionário já postou humor hoje (Ajuste 2)
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const existingToday = await this.humorRepository.findOne({
      where: {
        fk_id_func: callerId,
        dth_humor: Between(startOfDay, endOfDay),
      },
    });

    if (existingToday) {
      throw new ConflictException('Você já registrou seu humor hoje');
    }

    const humor = this.humorRepository.create({
      humor_func: createWellbeingDto.humor_func,
      fk_id_func: callerId,
      dth_humor: new Date(),
    });

    const saved = await this.humorRepository.save(humor);

    return {
      status: 'success',
      message: 'Registro de humor criado com sucesso',
      data: saved,
    };
  }

  async findAll(caller: any) {
    const callerId = caller.userId || caller.sub;

    if (caller.type === 'user') {
      const humores = await this.humorRepository.find({
        where: { fk_id_func: callerId },
        order: { dth_humor: 'DESC' },
      });
      return {
        status: 'success',
        data: humores,
      };
    }

    if (caller.type === 'company') {
      // Filtrar apenas humores dos últimos 30 dias (Ajuste 3)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const humores = await this.humorRepository.createQueryBuilder('humor')
        .innerJoin(User, 'user', 'humor.fk_id_func = user.pk_id_func')
        .where('user.fk_cod_empresa = :companyId', { companyId: callerId })
        .andWhere('humor.dth_humor >= :thirtyDaysAgo', { thirtyDaysAgo })
        .orderBy('humor.dth_humor', 'DESC')
        .getMany();

      return {
        status: 'success',
        data: humores,
      };
    }

    throw new ForbiddenException('Tipo de usuário inválido');
  }

  async findOne(id: number, caller: any) {
    const humor = await this.validateWellbeingAccess(id, caller);
    return {
      status: 'success',
      data: humor,
    };
  }
}
