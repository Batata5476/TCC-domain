import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  
  @UseGuards(JwtAuthGuard) // apenas requisicoes com token JWT valido podem listar usuarios
  @Get()
  findAll(@Request() req) {
    return this.usersService.findAll(req.user);
  }

  @UseGuards(JwtAuthGuard) // apenas requisicoes com token JWT valido podem buscar um usuario especifico
  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.usersService.findOne(+id, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createUserDto: CreateUserDto, @Request() req) {
    return this.usersService.create(createUserDto, req.user);
  }

  @UseGuards(JwtAuthGuard) // apenas requisicoes com token JWT valido podem atualizar um usuario
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @Request() req) {
    return this.usersService.update(+id, updateUserDto, req.user);
  }

  @UseGuards(JwtAuthGuard) // apenas requisicoes com token JWT valido podem deletar um usuario
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.usersService.remove(+id, req.user);
  }
}
