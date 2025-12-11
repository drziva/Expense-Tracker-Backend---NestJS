import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reminder } from './reminders.entity';
import { ReminderEnum } from './reminders-types';
import { RemindersService } from './reminders.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class RemindersScheduler {
  constructor(
    @InjectRepository(Reminder)
    private readonly reminderRepo: Repository<Reminder>,
    private readonly remindersService: RemindersService, 
    private readonly usersService: UsersService,
    private readonly logger: Logger
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async handleReminders() {
    const reminders = await this.reminderRepo.find({ where: { active: true } });

    if (reminders.length === 0) {
      this.logger.log("No active reminders.");
      return;
    }

    const today = new Date();
    const weekdayToday = today.getDay();
    const dayOfMonthToday = today.getDate();

    for (const reminder of reminders) {
      const user = await this.usersService.findById(reminder.user_id);
      if(!user?.premium){
        this.logger.log(
          `User ${reminder.user_id} is not premium. Skipping reminder ${reminder.id}.`,
        );
        continue;
      }
      if (reminder.type === ReminderEnum.WEEKLY) {
        if (reminder.weekday === weekdayToday) {
          await this.triggerReminder(reminder);
        }
      }
      else if (reminder.type === ReminderEnum.MONTHLY) {
        const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
        const targetDay = Math.min(reminder.day_of_month!, lastDayOfMonth);
        if (dayOfMonthToday === targetDay) {
          await this.triggerReminder(reminder);
        }
      }
    }
  }

  private async triggerReminder(reminder: Reminder) {
    this.logger.log(
      `Triggering reminder ID=${reminder.id} for user ${reminder.user_id}`,
    );

    const today = new Date();
    let from: Date;

    if (reminder.type === ReminderEnum.WEEKLY) {
      from = new Date(today);
      from.setDate(today.getDate() - 7);
    } else {
      from = new Date(today);
      from.setDate(today.getDate() - 30)
    }

    await this.remindersService.sendReminderReportEmail(
      reminder.user_id,
      from,
      today
    );
  }
}
