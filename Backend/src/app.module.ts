import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CompanyModule } from './company/company.module';
import { WellbeingModule } from './wellbeing/wellbeing.module';
import { TasksModule } from './tasks/tasks.module';
import { ChatModule } from './chat/chat.module';
import { MeetingsModule } from './meetings/meetings.module';
import { OccurrencesModule } from './occurrences/occurrences.module';
import { WorkModule } from './work/work.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '@batata5476',
      database: 'coopera',
      autoLoadEntities: true,
      synchronize: true, // ⚠️ só em desenvolvimento
    }),
    AuthModule,
    UsersModule,
    CompanyModule,
    WellbeingModule,
    TasksModule,
    ChatModule,
    MeetingsModule,
    OccurrencesModule,
    WorkModule,
    HealthModule,
  ],
})
export class AppModule { }
