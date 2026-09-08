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
    const callerId = caller.sub;
    const isCompanyAdmin =
      caller.role === 'Administrador Master' || caller.role === 'Administrador';

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

    if (!isCompanyAdmin) {
      const isParticipant = relations.some((r) => r.fk_id_func === callerId);
      if (!isParticipant) {
        throw new ForbiddenException('Voce nao participa desta reuniao');
      }
    } else {
      const belongsToCompany = relations.some(
        (r) => r.funcionario && r.funcionario.empresa_id === caller.empresa_id,
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
      where: { id: In(uniqueParticipantIds) },
    });

    if (participants.length !== uniqueParticipantIds.length) {
      const foundIds = new Set(participants.map((p) => p.id));
      const missingId = uniqueParticipantIds.find((id) => !foundIds.has(id));
      throw new NotFoundException(`Funcionario convidado com ID ${missingId} nao encontrado`);
    }

    const externalParticipant = participants.find((p) => p.empresa_id !== companyId);
    if (externalParticipant) {
      throw new ForbiddenException(
        `O funcionario ${externalParticipant.nome} (ID: ${externalParticipant.id}) pertence a outra empresa`,
      );
    }

    return uniqueParticipantIds;
  }

  async create(createMeetingDto: CreateMeetingDto, caller: any) {
    const rawParticipants =
      createMeetingDto.participants && createMeetingDto.participants.length > 0
        ? createMeetingDto.participants
        : [caller.sub];

    const participantIds = await this.validateParticipantsBelongToCompany(
      rawParticipants,
      caller.empresa_id,
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
      message: 'Reunião agendada com sucesso',
      data: savedMeeting,
    };
  }

  async findAll(caller: any) {
    const callerId = caller.sub;
    const isCompanyAdmin =
      caller.role === 'Administrador Master' || caller.role === 'Administrador';

    if (!isCompanyAdmin) {
      const relations = await this.meetingParticipantRepository.find({
        where: { fk_id_func: callerId },
        relations: ['reuniao'],
      });
      const meetings = relations.map((r) => r.reuniao).filter((m) => m !== null);
      return {
        status: 'success',
        data: meetings,
      };
    } else {
      const meetings = await this.meetingRepository.createQueryBuilder('meeting')
        .innerJoin(MeetingParticipant, 'mp', 'mp.fk_id_reuniao = meeting.pk_id_reuniao')
        .innerJoin(User, 'user', 'mp.fk_id_func = user.id')
        .where('user.empresa_id = :companyId', { companyId: caller.empresa_id })
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
  }

  async findOne(id: number, caller: any) {
    const meeting = await this.validateMeetingAccess(id, caller);
    return {
      status: 'success',
      data: meeting,
    };
  }

  async update(id: number, updateDto: UpdateMeetingDto, caller: any) {
    const isCompanyAdmin =
      caller.role === 'Administrador Master' || caller.role === 'Administrador';

    if (!isCompanyAdmin) {
      throw new ForbiddenException('Apenas empresas podem atualizar reunioes');
    }

    const meeting = await this.validateMeetingAccess(id, caller);

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
      const participantIds = await this.validateParticipantsBelongToCompany(
        updateDto.participants,
        caller.empresa_id,
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
    const isCompanyAdmin =
      caller.role === 'Administrador Master' || caller.role === 'Administrador';

    if (!isCompanyAdmin) {
      throw new ForbiddenException('Apenas empresas podem excluir reunioes');
    }

    const meeting = await this.validateMeetingAccess(id, caller);

    await this.meetingRepository.remove(meeting);

    return {
      status: 'success',
      message: 'Reuniao excluida com sucesso',
    };
  }
}
