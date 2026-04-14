import { Injectable } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class ChatService {
  findAll() {
    return [];
  }

  findOne(id: number) {
    return { id, message: 'Mensagem encontrada' };
  }

  create(createMessageDto: CreateMessageDto) {
    return { message: 'Mensagem enviada', data: createMessageDto };
  }

  remove(id: number) {
    return { id, message: 'Mensagem removida' };
  }
}
