import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findAll() {
    const users = await this.usersRepository.find();
    return {
      status: 'success',
      data: users,
    };
  }

  async findOne(id: number) {
    const user = await this.usersRepository.findOne({ where: { pk_id_func: id } });
    if (!user) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
    }
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

  async update(id: number, updateUserDto: Partial<CreateUserDto>) {
    await this.findOne(id);
    await this.usersRepository.update(id, updateUserDto);
    const updated = await this.findOne(id);
    return {
      status: 'success',
      message: 'Usuário atualizado com sucesso',
      data: updated.data,
    };
  }

  async remove(id: number) {
    const response = await this.findOne(id);
    await this.usersRepository.remove(response.data);
    return {
      status: 'success',
      message: 'Usuário removido com sucesso',
    };
  }
}
