import { Logger, Module } from '@nestjs/common';
import { RemindersController } from './reminders.controller';
import { RemindersService } from './reminders.service';
import { UsersModule } from 'src/users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reminder } from './reminders.entity';
import { ReportsModule } from 'src/reports/reports.module';
import { EmailModule } from 'src/email/email.module';
import { RemindersScheduler } from './reminders.scheduler';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reminder]),
    UsersModule,
    ReportsModule,
    UsersModule,
    EmailModule
  ],
  providers: [
    RemindersService,
    RemindersScheduler,
    {
      provide: Logger,
      useValue: new Logger('AppLogger'),
    },
  ],
  controllers: [RemindersController]
})
export class RemindersModule {}
