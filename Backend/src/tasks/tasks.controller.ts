import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards, Req } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get('my-tasks')
  async findMyTasks(@Req() req) {
    // Para funcionários (type: 'user')
    return this.tasksService.findAllByEmployee(req.user.userId);
  }

  @Post()
  async create(@Req() req, @Body() body: {
    tipo_tarefa: string;
    validade_tarefa: string;
    prioridade_tarefa: number;
    fk_id_func?: number; // Opcional se for funcionário criando para si
  }) {
    let fk_id_func = body.fk_id_func;
    let fk_cod_empresa: number;

    if (req.user.type === 'user') {
      // Funcionário criando tarefa para si mesmo
      fk_id_func = req.user.userId;
      // Precisamos buscar a empresa do funcionário
      const userDetails = await this.tasksService.findOneUser(req.user.userId);
      fk_cod_empresa = userDetails.fk_cod_empresa;
    } else {
      // Empresa criando e atribuindo tarefa para um funcionário
      fk_cod_empresa = req.user.userId;
      if (!fk_id_func) {
        throw new Error('É necessário informar o funcionário (fk_id_func) para atribuir a tarefa.');
      }
    }

    return this.tasksService.create({
      tipo_tarefa: body.tipo_tarefa,
      validade_tarefa: new Date(body.validade_tarefa),
      prioridade_tarefa: body.prioridade_tarefa,
      fk_id_func,
      fk_cod_empresa,
    });
  }

  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body() body: { status: number }) {
    return this.tasksService.updateStatus(+id, body.status);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.tasksService.findOne(+id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.tasksService.remove(+id);
  }
}
