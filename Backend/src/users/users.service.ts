import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  findAll() {
    return [];
  }

  findOne(id: number) {
    return { id, message: 'Usuário encontrado' };
  }

  create(createUserDto: CreateUserDto) {
    return { message: 'Usuário criado', data: createUserDto };
  }

  update(id: number, updateUserDto: Partial<CreateUserDto>) {
    return { id, message: 'Usuário atualizado', data: updateUserDto };
  }

  remove(id: number) {
    return { id, message: 'Usuário removido' };
  }
}
