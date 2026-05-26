import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { User } from '../users/entities/user.entity';
import { Task } from '../tasks/entities/task.entity';
import { Humor } from '../wellbeing/entities/humor.entity';
import { FuncTarefa } from '../tasks/entities/func-tarefa.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Task, Humor, FuncTarefa])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
