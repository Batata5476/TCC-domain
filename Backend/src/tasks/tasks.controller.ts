import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards, Req } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { CreateTaskPayloadDto } from './dto/create-task-payload.dto';

@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get('my-tasks')
  async findMyTasks(@Req() req) {
    // Para funcionários (type: 'user')
    return this.tasksService.findAllByEmployee(req.user.sub);
  }

  @Post()
  async create(@Req() req, @Body() body: CreateTaskPayloadDto) {
    return this.tasksService.create({
      tipo_tarefa: body.tipo_tarefa,
      validade_tarefa: new Date(body.validade_tarefa),
      prioridade_tarefa: body.prioridade_tarefa,
      fk_id_func: body.fk_id_func,
    }, req.user);
  }

  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body() body: UpdateTaskStatusDto, @Req() req) {
    return this.tasksService.updateStatus(+id, body.status, req.user);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req) {
    return this.tasksService.findOne(+id, req.user);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req) {
    return this.tasksService.remove(+id, req.user);
  }
}
