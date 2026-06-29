import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateWorkDto } from './dto/create-work.dto';
import { UpdateWorkDto } from './dto/update-work.dto';
import { Work } from './entities/work.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class WorkService {
  constructor(
    @InjectRepository(Work)
    private readonly workRepository: Repository<Work>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  private async validateWorkAccess(workId: number, caller: any): Promise<Work> {
    const callerId = caller.sub;
    const isCompanyAdmin =
      caller.role === 'Administrador Master' || caller.role === 'Administrador';

    const work = await this.workRepository.findOne({
      where: { pk_id_ponto: workId },
    });

    if (!work) {
      throw new NotFoundException(`Registro de ponto com ID ${workId} nao encontrado`);
    }

    if (!isCompanyAdmin) {
      if (work.fk_id_func !== callerId) {
        throw new ForbiddenException('Voce nao possui acesso a este registro de ponto');
      }
    } else {
      const employee = await this.userRepository.findOne({
        where: { id: work.fk_id_func },
      });

      if (!employee || employee.empresa_id !== caller.empresa_id) {
        throw new ForbiddenException('Este registro de ponto nao pertence a um funcionario da sua empresa');
      }
    }

    return work;
  }

  async findAll(caller: any) {
    const callerId = caller.sub;
    const isCompanyAdmin =
      caller.role === 'Administrador Master' || caller.role === 'Administrador';

    if (!isCompanyAdmin) {
      const registros = await this.workRepository.find({
        where: { fk_id_func: callerId },
        order: { data_ponto: 'DESC', entrada: 'DESC' },
      });

      return {
        status: 'success',
        data: registros,
      };
    } else {
      const registros = await this.workRepository.createQueryBuilder('work')
        .innerJoin(User, 'user', 'work.fk_id_func = user.id')
        .where('user.empresa_id = :companyId', { companyId: caller.empresa_id })
        .orderBy('work.data_ponto', 'DESC')
        .addOrderBy('work.entrada', 'DESC')
        .getMany();

      return {
        status: 'success',
        data: registros,
      };
    }
  }

  async findOne(id: number, caller: any) {
    const work = await this.validateWorkAccess(id, caller);

    return {
      status: 'success',
      data: work,
    };
  }

  async create(createWorkDto: CreateWorkDto, caller: any) {
    if (caller.role !== 'Funcionário') {
      throw new ForbiddenException('Apenas funcionarios podem criar registros de ponto');
    }

    const callerId = caller.sub;

    const work = this.workRepository.create({
      entrada: createWorkDto.entrada,
      saida: createWorkDto.saida,
      data_ponto: new Date(createWorkDto.data_ponto),
      total_dia: '00:00:00',
      fk_id_func: callerId,
    });

    const saved = await this.workRepository.save(work);

    return {
      status: 'success',
      message: 'Registro de ponto criado com sucesso',
      data: saved,
    };
  }

  async update(id: number, updateDto: UpdateWorkDto, caller: any) {
    if (caller.role !== 'Funcionário') {
      throw new ForbiddenException('Apenas funcionarios podem atualizar seus registros de ponto');
    }

    const work = await this.validateWorkAccess(id, caller);

    if (updateDto.entrada !== undefined) {
      work.entrada = updateDto.entrada;
    }
    if (updateDto.saida !== undefined) {
      work.saida = updateDto.saida;
    }
    if (updateDto.data_ponto !== undefined) {
      work.data_ponto = new Date(updateDto.data_ponto);
    }

    const updated = await this.workRepository.save(work);

    return {
      status: 'success',
      message: 'Registro de ponto atualizado com sucesso',
      data: updated,
    };
  }

  async remove(id: number, caller: any) {
    if (caller.role !== 'Funcionário') {
      throw new ForbiddenException('Apenas funcionarios podem excluir seus registros de ponto');
    }

    const work = await this.validateWorkAccess(id, caller);

    await this.workRepository.remove(work);

    return {
      status: 'success',
      message: 'Registro de ponto removido com sucesso',
    };
  }
}
