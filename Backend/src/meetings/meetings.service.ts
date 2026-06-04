import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Meeting } from './entities/meeting.entity';
import { MeetingParticipant } from './entities/meeting-participant.entity';
import { User } from '../users/entities/user.entity';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { UpdateMeetingDto } from './dto/update-meeting.dto';

@Injectable()
export class MeetingsService {
  constructor(
    @InjectRepository(Meeting)
    private readonly meetingRepository: Repository<Meeting>,
    @InjectRepository(MeetingParticipant)
    private readonly meetingParticipantRepository: Repository<MeetingParticipant>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  private async validateMeetingAccess(meetingId: number, caller: any): Promise<Meeting> {
    const callerId = caller.userId || caller.sub;

    const meeting = await this.meetingRepository.findOne({
      where: { pk_id_reuniao: meetingId },
    });

    if (!meeting) {
      throw new NotFoundException('Reunião não encontrada');
    }

    const relations = await this.meetingParticipantRepository.find({
      where: { fk_id_reuniao: meetingId },
      relations: ['funcionario'],
    });

    if (caller.type === 'user') {
      const isParticipant = relations.some((r) => r.fk_id_func === callerId);
      if (!isParticipant) {
        throw new ForbiddenException('Você não participa desta reunião');
      }
    }

    if (caller.type === 'company') {
      const belongsToCompany = relations.some(
        (r) => r.funcionario && r.funcionario.fk_cod_empresa === callerId,
      );
      if (!belongsToCompany) {
        throw new ForbiddenException('Esta reunião não pertence a funcionários da sua empresa');
      }
    }

    return meeting;
  }

  async create(createMeetingDto: CreateMeetingDto, caller: any) {
    const callerId = caller.userId || caller.sub;

    let companyId: number;
    if (caller.type === 'company') {
      companyId = callerId;
    } else {
      const employee = await this.userRepository.findOne({
        where: { pk_id_func: callerId },
      });
      if (!employee) {
        throw new NotFoundException('Funcionário organizador não encontrado');
      }
      companyId = employee.fk_cod_empresa;
    }

    // Validar se todos os participantes convidados pertencem ao mesmo grupo
    for (const participantId of createMeetingDto.participants) {
      const p = await this.userRepository.findOne({
        where: { pk_id_func: participantId },
      });
      if (!p) {
        throw new NotFoundException(`Funcionário convidado com ID ${participantId} não encontrado`);
      }
      if (p.fk_cod_empresa !== companyId) {
        throw new ForbiddenException(
          `O funcionário ${p.nome_func} (ID: ${participantId}) pertence a outra empresa`,
        );
      }
    }

    const meeting = this.meetingRepository.create({
      data_reuniao: new Date(createMeetingDto.data_reuniao),
      horario_reuniao: createMeetingDto.horario_reuniao,
      assunto_reuniao: createMeetingDto.assunto_reuniao,
      tipo_reuniao: createMeetingDto.tipo_reuniao,
    });

    const savedMeeting = await this.meetingRepository.save(meeting);

    for (const participantId of createMeetingDto.participants) {
      const relation = this.meetingParticipantRepository.create({
        fk_id_reuniao: savedMeeting.pk_id_reuniao,
        fk_id_func: participantId,
      });
      await this.meetingParticipantRepository.save(relation);
    }

    return {
      status: 'success',
      message: 'Reunião agendada e participantes vinculados com sucesso',
      data: savedMeeting,
    };
  }

  async findAll(caller: any) {
    const callerId = caller.userId || caller.sub;

    if (caller.type === 'user') {
      const relations = await this.meetingParticipantRepository.find({
        where: { fk_id_func: callerId },
        relations: ['reuniao'],
      });
      const meetings = relations.map((r) => r.reuniao).filter((m) => m !== null);
      return {
        status: 'success',
        data: meetings,
      };
    }

    if (caller.type === 'company') {
      const meetings = await this.meetingRepository.createQueryBuilder('meeting')
        .innerJoin(MeetingParticipant, 'mp', 'mp.fk_id_reuniao = meeting.pk_id_reuniao')
        .innerJoin(User, 'user', 'mp.fk_id_func = user.pk_id_func')
        .where('user.fk_cod_empresa = :companyId', { companyId: callerId })
        .orderBy('meeting.data_reuniao', 'DESC')
        .getMany();

      const uniqueMeetings = [];
      const seenIds = new Set();
      for (const m of meetings) {
        if (!seenIds.has(m.pk_id_reuniao)) {
          seenIds.add(m.pk_id_reuniao);
          uniqueMeetings.push(m);
        }
      }

      return {
        status: 'success',
        data: uniqueMeetings,
      };
    }

    throw new ForbiddenException('Tipo de usuário inválido');
  }

  async findOne(id: number, caller: any) {
    const meeting = await this.validateMeetingAccess(id, caller);
    return {
      status: 'success',
      data: meeting,
    };
  }

  async update(id: number, updateDto: UpdateMeetingDto, caller: any) {
    if (caller.type !== 'company') {
      throw new ForbiddenException('Apenas empresas podem atualizar reuniões');
    }

    await this.validateMeetingAccess(id, caller);

    const meeting = await this.meetingRepository.findOne({
      where: { pk_id_reuniao: id },
    });

    if (!meeting) {
      throw new NotFoundException(`Reunião com ID ${id} não encontrada`);
    }

    if (updateDto.data_reuniao !== undefined) {
      meeting.data_reuniao = new Date(updateDto.data_reuniao);
    }
    if (updateDto.horario_reuniao !== undefined) {
      meeting.horario_reuniao = updateDto.horario_reuniao;
    }
    if (updateDto.assunto_reuniao !== undefined) {
      meeting.assunto_reuniao = updateDto.assunto_reuniao;
    }
    if (updateDto.tipo_reuniao !== undefined) {
      meeting.tipo_reuniao = updateDto.tipo_reuniao;
    }

    if (updateDto.participants !== undefined) {
      const companyId = caller.userId || caller.sub;
      for (const participantId of updateDto.participants) {
        const p = await this.userRepository.findOne({
          where: { pk_id_func: participantId },
        });
        if (!p) {
          throw new NotFoundException(`Funcionário convidado com ID ${participantId} não encontrado`);
        }
        if (p.fk_cod_empresa !== companyId) {
          throw new ForbiddenException(
            `O funcionário ${p.nome_func} (ID: ${participantId}) pertence a outra empresa`,
          );
        }
      }

      await this.meetingParticipantRepository.delete({ fk_id_reuniao: id });

      for (const participantId of updateDto.participants) {
        const relation = this.meetingParticipantRepository.create({
          fk_id_reuniao: id,
          fk_id_func: participantId,
        });
        await this.meetingParticipantRepository.save(relation);
      }
    }

    const updated = await this.meetingRepository.save(meeting);

    return {
      status: 'success',
      message: 'Reunião atualizada com sucesso',
      data: updated,
    };
  }

  async remove(id: number, caller: any) {
    if (caller.type !== 'company') {
      throw new ForbiddenException('Apenas empresas podem excluir reuniões');
    }

    await this.validateMeetingAccess(id, caller);

    const meeting = await this.meetingRepository.findOne({
      where: { pk_id_reuniao: id },
    });

    if (!meeting) {
      throw new NotFoundException(`Reunião com ID ${id} não encontrada`);
    }

    await this.meetingRepository.remove(meeting);

    return {
      status: 'success',
      message: 'Reunião excluída com sucesso',
    };
  }
}
