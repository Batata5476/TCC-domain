import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyController } from './company.controller';
import { CompanyService } from './company.service';
import { Company } from './entities/company.entity';
import { User } from '../users/entities/user.entity';
import { Role } from '../users/entities/role.entity';
import { RolesGuard } from '../auth/roles.guard';
import { PermissionsGuard } from '../auth/permissions.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Company, User, Role])],
  controllers: [CompanyController],
  providers: [CompanyService, RolesGuard, PermissionsGuard],
  exports: [CompanyService, TypeOrmModule],
})
export class CompanyModule {}
