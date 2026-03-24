import { Logger, Module } from '@nestjs/common';
import { RemindersController } from './reminders.controller';
import { RemindersService } from './reminders.service';
import { UsersModule } from '../users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reminder } from './reminders.entity';
import { ReportsModule } from '../reports/reports.module';
import { EmailModule } from '../email/email.module';
import { RemindersScheduler } from './reminders.scheduler';
import { FirebaseModule } from '../firebase/firebase.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reminder]),
    UsersModule,
    ReportsModule,
    EmailModule,
    FirebaseModule
  ],
  providers: [
    RemindersService,
    RemindersScheduler,
    Logger,
  ],
  controllers: [RemindersController]
})
export class RemindersModule {}
