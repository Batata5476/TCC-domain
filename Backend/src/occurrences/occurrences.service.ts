import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Occurrence } from './entities/occurrence.entity';
import { User } from '../users/entities/user.entity';
import { CreateOccurrenceDto } from './dto/create-occurrence.dto';
import { UpdateOccurrenceDto } from './dto/update-occurrence.dto';

@Injectable()
export class OccurrencesService {
  constructor(
    @InjectRepository(Occurrence)
    private readonly occurrenceRepository: Repository<Occurrence>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  private async validateOccurrenceAccess(occurrenceId: number, caller: any): Promise<Occurrence> {
    const callerId = caller.userId || caller.sub;

    const occurrence = await this.occurrenceRepository.findOne({
      where: { pk_id_his_medico: occurrenceId },
    });

    if (!occurrence) {
      throw new NotFoundException(`Registro médico com ID ${occurrenceId} não encontrado`);
    }

    if (caller.type === 'user') {
      if (occurrence.fk_id_func !== callerId) {
        throw new ForbiddenException('Você não possui acesso a este registro médico');
      }
    }

    if (caller.type === 'company') {
      const employee = await this.userRepository.findOne({
        where: { pk_id_func: occurrence.fk_id_func },
      });

      if (!employee || employee.fk_cod_empresa !== callerId) {
        throw new ForbiddenException('Este registro médico não pertence a um funcionário da sua empresa');
      }
    }

    return occurrence;
  }

  async create(createOccurrenceDto: CreateOccurrenceDto, caller: any) {
    if (caller.type !== 'user') {
      throw new ForbiddenException('Apenas funcionários podem registrar ocorrências médicas');
    }

    const callerId = caller.userId || caller.sub;

    const occurrence = this.occurrenceRepository.create({
      atestado_func: createOccurrenceDto.atestado_func,
      ocorrencias: createOccurrenceDto.ocorrencias,
      fk_id_func: callerId,
    });

    const saved = await this.occurrenceRepository.save(occurrence);

    return {
      status: 'success',
      message: 'Registro médico criado com sucesso',
      data: saved,
    };
  }

  async findAll(caller: any) {
    const callerId = caller.userId || caller.sub;

    if (caller.type === 'user') {
      const occurrences = await this.occurrenceRepository.find({
        where: { fk_id_func: callerId },
        order: { pk_id_his_medico: 'DESC' },
      });
      return {
        status: 'success',
        data: occurrences,
      };
    }

    if (caller.type === 'company') {
      const occurrences = await this.occurrenceRepository.createQueryBuilder('occurrence')
        .innerJoin(User, 'user', 'occurrence.fk_id_func = user.pk_id_func')
        .where('user.fk_cod_empresa = :companyId', { companyId: callerId })
        .orderBy('occurrence.pk_id_his_medico', 'DESC')
        .getMany();

      return {
        status: 'success',
        data: occurrences,
      };
    }

    throw new ForbiddenException('Tipo de usuário inválido');
  }

  async findOne(id: number, caller: any) {
    const occurrence = await this.validateOccurrenceAccess(id, caller);
    return {
      status: 'success',
      data: occurrence,
    };
  }

  async update(id: number, updateDto: UpdateOccurrenceDto, caller: any) {
    if (caller.type !== 'user') {
      throw new ForbiddenException('Apenas funcionários podem atualizar seus registros médicos');
    }

    const occurrence = await this.validateOccurrenceAccess(id, caller);

    if (updateDto.atestado_func !== undefined) {
      occurrence.atestado_func = updateDto.atestado_func;
    }
    if (updateDto.ocorrencias !== undefined) {
      occurrence.ocorrencias = updateDto.ocorrencias;
    }

    const updated = await this.occurrenceRepository.save(occurrence);

    return {
      status: 'success',
      message: 'Registro médico atualizado com sucesso',
      data: updated,
    };
  }

  async remove(id: number, caller: any) {
    if (caller.type !== 'user') {
      throw new ForbiddenException('Apenas funcionários podem excluir seus registros médicos');
    }

    const occurrence = await this.validateOccurrenceAccess(id, caller);

    await this.occurrenceRepository.remove(occurrence);

    return {
      status: 'success',
      message: 'Registro médico removido com sucesso',
    };
  }
}
