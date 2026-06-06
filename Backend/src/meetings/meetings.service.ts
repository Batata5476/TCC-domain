import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
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
    private readonly dataSource: DataSource,
  ) {}

  private async validateMeetingAccess(meetingId: number, caller: any): Promise<Meeting> {
    const callerId = caller.userId || caller.sub;

    const meeting = await this.meetingRepository.findOne({
      where: { pk_id_reuniao: meetingId },
    });

    if (!meeting) {
      throw new NotFoundException('Reuniao nao encontrada');
    }

    const relations = await this.meetingParticipantRepository.find({
      where: { fk_id_reuniao: meetingId },
      relations: ['funcionario'],
    });

    if (caller.type === 'user') {
      const isParticipant = relations.some((r) => r.fk_id_func === callerId);
      if (!isParticipant) {
        throw new ForbiddenException('Voce nao participa desta reuniao');
      }
    }

    if (caller.type === 'company') {
      const belongsToCompany = relations.some(
        (r) => r.funcionario && r.funcionario.fk_cod_empresa === callerId,
      );
      if (!belongsToCompany) {
        throw new ForbiddenException('Esta reuniao nao pertence a funcionarios da sua empresa');
      }
    }

    return meeting;
  }

  private async validateParticipantsBelongToCompany(
    participantIds: number[],
    companyId: number,
  ): Promise<number[]> {
    const uniqueParticipantIds = [...new Set(participantIds)];

    if (uniqueParticipantIds.length === 0) {
      throw new BadRequestException('A reuniao deve possuir ao menos um participante');
    }

    const participants = await this.userRepository.find({
      where: { pk_id_func: In(uniqueParticipantIds) },
    });

    if (participants.length !== uniqueParticipantIds.length) {
      const foundIds = new Set(participants.map((p) => p.pk_id_func));
      const missingId = uniqueParticipantIds.find((id) => !foundIds.has(id));
      throw new NotFoundException(`Funcionario convidado com ID ${missingId} nao encontrado`);
    }

    const externalParticipant = participants.find((p) => p.fk_cod_empresa !== companyId);
    if (externalParticipant) {
      throw new ForbiddenException(
        `O funcionario ${externalParticipant.nome_func} (ID: ${externalParticipant.pk_id_func}) pertence a outra empresa`,
      );
    }

    return uniqueParticipantIds;
  }

  async create(createMeetingDto: CreateMeetingDto, caller: any) {
    const callerId = caller.userId || caller.sub;

    if (caller.type !== 'company') {
      throw new ForbiddenException('Apenas empresas podem criar reunioes');
    }

    const participantIds = await this.validateParticipantsBelongToCompany(
      createMeetingDto.participants,
      callerId,
    );

    const savedMeeting = await this.dataSource.transaction(async (manager) => {
      const meeting = manager.create(Meeting, {
        data_reuniao: new Date(createMeetingDto.data_reuniao),
        horario_reuniao: createMeetingDto.horario_reuniao,
        assunto_reuniao: createMeetingDto.assunto_reuniao,
        tipo_reuniao: createMeetingDto.tipo_reuniao,
      });

      const meetingResult = await manager.save(Meeting, meeting);

      const relations = participantIds.map((participantId) =>
        manager.create(MeetingParticipant, {
          fk_id_reuniao: meetingResult.pk_id_reuniao,
          fk_id_func: participantId,
        }),
      );
      await manager.save(MeetingParticipant, relations);

      return meetingResult;
    });

    return {
      status: 'success',
      message: 'Reuniao agendada e participantes vinculados com sucesso',
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

      const uniqueMeetings: Meeting[] = [];
      const seenIds = new Set<number>();
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

    throw new ForbiddenException('Tipo de usuario invalido');
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
      throw new ForbiddenException('Apenas empresas podem atualizar reunioes');
    }

    await this.validateMeetingAccess(id, caller);

    const meeting = await this.meetingRepository.findOne({
      where: { pk_id_reuniao: id },
    });

    if (!meeting) {
      throw new NotFoundException(`Reuniao com ID ${id} nao encontrada`);
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
      const participantIds = await this.validateParticipantsBelongToCompany(
        updateDto.participants,
        companyId,
      );

      const updated = await this.dataSource.transaction(async (manager) => {
        await manager.delete(MeetingParticipant, { fk_id_reuniao: id });

        const relations = participantIds.map((participantId) =>
          manager.create(MeetingParticipant, {
            fk_id_reuniao: id,
            fk_id_func: participantId,
          }),
        );
        await manager.save(MeetingParticipant, relations);

        return manager.save(Meeting, meeting);
      });

      return {
        status: 'success',
        message: 'Reuniao atualizada com sucesso',
        data: updated,
      };
    }

    const updated = await this.meetingRepository.save(meeting);

    return {
      status: 'success',
      message: 'Reuniao atualizada com sucesso',
      data: updated,
    };
  }

  async remove(id: number, caller: any) {
    if (caller.type !== 'company') {
      throw new ForbiddenException('Apenas empresas podem excluir reunioes');
    }

    await this.validateMeetingAccess(id, caller);

    const meeting = await this.meetingRepository.findOne({
      where: { pk_id_reuniao: id },
    });

    if (!meeting) {
      throw new NotFoundException(`Reuniao com ID ${id} nao encontrada`);
    }

    await this.meetingRepository.remove(meeting);

    return {
      status: 'success',
      message: 'Reuniao excluida com sucesso',
    };
  }
}
