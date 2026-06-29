import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler'; // Import ThrottlerModule and ThrottlerGuard for rate limiting
import { APP_GUARD } from '@nestjs/core'; // Import APP_GUARD to apply the ThrottlerGuard globally

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
import { DashboardModule } from './dashboard/dashboard.module';
import { AuditModule } from './audit/audit.module';

@Module({
  imports: [
    // Load environment variables from .env and make ConfigService available globally
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Global rate limit: 30 requests per minute per IP address
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000, // 1 minute
          limit: 30, // Maximum of 30 requests in this period
        },
      ],
    }),

    // Database configuration using environment variables
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        autoLoadEntities: true,
        synchronize: false,
      }),
    }),

    // Application modules
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
    DashboardModule,
    AuditModule,
  ],

  // Apply the ThrottlerGuard globally to all routes
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
