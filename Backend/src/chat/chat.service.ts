import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateMessageDto } from './dto/create-message.dto';
import { Message } from './entities/message.entity';
import { Chat } from './entities/chat.entity';
import { ChatParticipant } from './entities/chat-participant.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(Chat)
    private readonly chatRepository: Repository<Chat>,
    @InjectRepository(ChatParticipant)
    private readonly chatParticipantRepository: Repository<ChatParticipant>,
  ) {}

  private async validateChatAccess(chatId: number, caller: any): Promise<Chat> {
    if (caller.type !== 'user') {
      throw new ForbiddenException('Apenas funcionarios participantes podem acessar o chat');
    }

    const callerId = caller.userId || caller.sub;

    const chat = await this.chatRepository.findOne({
      where: { pk_id_chat: chatId },
    });

    if (!chat) {
      throw new NotFoundException(`Chat com ID ${chatId} nao encontrado`);
    }

    const participant = await this.chatParticipantRepository.findOne({
      where: {
        fk_id_chat: chatId,
        fk_id_func: callerId,
      },
    });

    if (!participant) {
      throw new ForbiddenException('Voce nao participa deste chat');
    }

    return chat;
  }

  private async validateMessageAccess(messageId: number, caller: any): Promise<Message> {
    const message = await this.messageRepository.findOne({
      where: { pk_id_mensagens: messageId },
    });

    if (!message) {
      throw new NotFoundException(`Mensagem com ID ${messageId} nao encontrada`);
    }

    await this.validateChatAccess(message.fk_id_chat, caller);

    return message;
  }

  async findAll(caller: any) {
    if (caller.type !== 'user') {
      throw new ForbiddenException('Apenas funcionarios participantes podem listar mensagens');
    }

    const callerId = caller.userId || caller.sub;

    const messages = await this.messageRepository.createQueryBuilder('message')
      .innerJoin(
        ChatParticipant,
        'participant',
        'participant.fk_id_chat = message.fk_id_chat',
      )
      .where('participant.fk_id_func = :callerId', { callerId })
      .orderBy('message.data_envio', 'DESC')
      .getMany();

    return {
      status: 'success',
      data: messages,
    };
  }

  async findOne(id: number, caller: any) {
    const message = await this.validateMessageAccess(id, caller);

    return {
      status: 'success',
      data: message,
    };
  }

  async create(createMessageDto: CreateMessageDto, caller: any) {
    if (caller.type !== 'user') {
      throw new ForbiddenException('Apenas funcionarios participantes podem enviar mensagens');
    }

    const callerId = caller.userId || caller.sub;

    await this.validateChatAccess(createMessageDto.fk_id_chat, caller);

    const message = this.messageRepository.create({
      conteudo_mensagens: createMessageDto.conteudo_mensagens,
      data_envio: new Date(),
      fk_id_chat: createMessageDto.fk_id_chat,
      fk_id_func: callerId,
      fk_id_midia: createMessageDto.fk_id_midia,
    });

    const saved = await this.messageRepository.save(message);

    return {
      status: 'success',
      message: 'Mensagem enviada com sucesso',
      data: saved,
    };
  }

  async remove(id: number, caller: any) {
    const message = await this.validateMessageAccess(id, caller);
    const callerId = caller.userId || caller.sub;

    if (message.fk_id_func !== callerId) {
      throw new ForbiddenException('Voce so pode remover mensagens enviadas por voce');
    }

    await this.messageRepository.remove(message);

    return {
      status: 'success',
      message: 'Mensagem removida com sucesso',
    };
  }
}
