import { Module } from '@nestjs/common';
import { RemindersController } from './reminders.controller';
import { RemindersService } from './reminders.service';
import { UsersModule } from 'src/users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reminder } from './reminders.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Reminder]),UsersModule],
  providers: [RemindersService],
  controllers: [RemindersController]
})
export class RemindersModule {}
