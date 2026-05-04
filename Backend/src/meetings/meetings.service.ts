import { Injectable } from '@nestjs/common';
import { CreateMeetingDto } from './dto/create-meeting.dto';

@Injectable()
export class MeetingsService {
  findAll() {
    return [];
  }

  findOne(id: number) {
    return { id, message: 'Reunião encontrada' };
  }

  create(createMeetingDto: CreateMeetingDto) {
    return { message: 'Reunião criada', data: createMeetingDto };
  }

  update(id: number, updateDto: Partial<CreateMeetingDto>) {
    return { id, message: 'Reunião atualizada', data: updateDto };
  }

  remove(id: number) {
    return { id, message: 'Reunião removida' };
  }
}
