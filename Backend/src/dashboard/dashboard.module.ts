import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { User } from '../users/entities/user.entity';
import { Task } from '../tasks/entities/task.entity';
import { Humor } from '../wellbeing/entities/humor.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Task, Humor])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
