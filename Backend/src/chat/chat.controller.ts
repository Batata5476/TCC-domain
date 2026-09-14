import { Controller, Get, Post, Body, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { Permissions } from '../auth/authorization.decorators';

// todas as rotas exigem um token JWT válido para acesso
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  
  @Get()
  @Permissions('chat.read')
  findAll(@Req() req) {
    return this.chatService.findAll(req.user);
  }

  @Get(':id')
  @Permissions('chat.read')
  findOne(@Param('id') id: string, @Req() req) {
    return this.chatService.findOne(+id, req.user);
  }

  @Post()
  @Permissions('chat.create')
  create(@Body() createMessageDto: CreateMessageDto, @Req() req) {
    return this.chatService.create(createMessageDto, req.user);
  }

  @Delete(':id')
  @Permissions('chat.delete')
  remove(@Param('id') id: string, @Req() req) {
    return this.chatService.remove(+id, req.user);
  }
}
