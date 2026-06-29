import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyController } from './company.controller';
import { CompanyService } from './company.service';
import { Company } from './entities/company.entity';
import { User } from '../users/entities/user.entity';
import { Role } from '../users/entities/role.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Company, User, Role])],
  controllers: [CompanyController],
  providers: [CompanyService],
  exports: [CompanyService, TypeOrmModule],
})
export class CompanyModule {}
