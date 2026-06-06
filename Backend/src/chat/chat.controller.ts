import { Controller, Get, Post, Body, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

// todas as rotas exigem um token JWT válido para acesso
@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  
  @Get()
  findAll(@Req() req) {
    return this.chatService.findAll(req.user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req) {
    return this.chatService.findOne(+id, req.user);
  }

  @Post()
  create(@Body() createMessageDto: CreateMessageDto, @Req() req) {
    return this.chatService.create(createMessageDto, req.user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    return this.chatService.remove(+id, req.user);
  }
}
