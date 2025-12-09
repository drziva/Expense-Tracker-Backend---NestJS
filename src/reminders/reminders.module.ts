import { Module } from '@nestjs/common';
import { RemindersController } from './reminders.controller';
import { RemindersService } from './reminders.service';

@Module({
  providers: [RemindersService],
  controllers: [RemindersController]
})
export class RemindersModule {}
