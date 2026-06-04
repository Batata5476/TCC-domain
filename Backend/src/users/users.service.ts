import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  private async validateUserAccess(targetUserId: number, caller: any): Promise<User> {
    const callerId = caller.userId || caller.sub;
    const targetUser = await this.usersRepository.findOne({
      where: { pk_id_func: targetUserId },
    });

    if (!targetUser) {
      throw new NotFoundException(`Usuário com ID ${targetUserId} não encontrado`);
    }

    // Regra para Funcionário
    if (caller.type === 'user') {
      if (callerId !== targetUserId) {
        throw new ForbiddenException('Você não possui acesso a este usuário');
      }
    }

    // Regra para Empresa
    if (caller.type === 'company') {
      if (targetUser.fk_cod_empresa !== callerId) {
        throw new ForbiddenException('Funcionário não pertence à sua empresa');
      }
    }

    return targetUser;
  }

  async findAll(caller: any) {
    if (caller.type !== 'company') {
      throw new ForbiddenException('Você não possui permissão para listar todos os usuários');
    }

    const callerId = caller.userId || caller.sub;
    const users = await this.usersRepository.find({
      where: { fk_cod_empresa: callerId },
    });

    return {
      status: 'success',
      data: users,
    };
  }

  async findOne(id: number, caller: any) {
    const user = await this.validateUserAccess(id, caller);
    return {
      status: 'success',
      data: user,
    };
  }

  async create(createUserDto: CreateUserDto) {
    const cleanCpf = createUserDto.cpf_func.replace(/\D/g, '');
    const hashedPassword = await bcrypt.hash(createUserDto.senha_func, 10);

    const { senha_func, cpf_func, ...rest } = createUserDto;
    const user = this.usersRepository.create({
      ...rest,
      cpf_func: cleanCpf,
      senha_func: hashedPassword,
    });
    const saved = await this.usersRepository.save(user);
    return {
      status: 'success',
      message: 'Usuário criado com sucesso',
      data: saved,
    };
  }

  async update(id: number, updateUserDto: UpdateUserDto, caller: any) {
    await this.validateUserAccess(id, caller);
    
    const { nome_func, email_func, foto_func, senha_func } = updateUserDto;
    const dataToUpdate: any = {};
    if (nome_func !== undefined) dataToUpdate.nome_func = nome_func;
    if (email_func !== undefined) dataToUpdate.email_func = email_func;
    if (foto_func !== undefined) dataToUpdate.foto_func = foto_func;
    if (senha_func !== undefined) {
      dataToUpdate.senha_func = await bcrypt.hash(senha_func, 10);
    }

    await this.usersRepository.update(id, dataToUpdate);
    return this.findOne(id, caller);
  }

  async remove(id: number, caller: any) {
    if (caller.type !== 'company') {
      throw new ForbiddenException('Funcionários não têm permissão para excluir contas');
    }

    const user = await this.validateUserAccess(id, caller);
    await this.usersRepository.remove(user);
    return {
      status: 'success',
      message: 'Usuário removido com sucesso',
    };
  }
}
