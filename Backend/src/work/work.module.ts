import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkController } from './work.controller';
import { WorkService } from './work.service';
import { Work } from './entities/work.entity';
import { User } from '../users/entities/user.entity';
import { RolesGuard } from '../auth/roles.guard';
import { PermissionsGuard } from '../auth/permissions.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Work, User])],
  controllers: [WorkController],
  providers: [WorkService, RolesGuard, PermissionsGuard],
  exports: [WorkService],
})
export class WorkModule {}
