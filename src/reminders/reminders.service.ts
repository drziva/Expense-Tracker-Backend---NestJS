import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reminder } from './reminders.entity';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { UpdateReminderDto } from './dto/update-reminder.dto';
import { DeleteReminderResponse, ReminderResponse } from './dto/reminders-responses.dto';
import { ReminderEnum } from './reminders-types';
import { ReportsService } from 'src/reports/reports.service';
import { UsersService } from 'src/users/users.service';
import { EmailService } from 'src/email/email.service';

@Injectable()
export class RemindersService {
  constructor(
    @InjectRepository(Reminder)
    private readonly reminderRepo: Repository<Reminder>,
    private readonly reportsService: ReportsService,
    private readonly usersService: UsersService,
    private readonly emailService: EmailService
  ) {}


  async upsertByType(
    userId: number,
    type: ReminderEnum,
    dto: UpdateReminderDto
  ): Promise<ReminderResponse> {
    let reminder = await this.reminderRepo.findOne({where:{user_id: userId, type}});

    if(!reminder){
      reminder = this.reminderRepo.create({
        user_id: userId,
        type
      })
    }
    reminder.active = dto.active;

    if(type === ReminderEnum.WEEKLY) {
      reminder.weekday = dto.weekday!;
      reminder.day_of_month = null
    }

    if(type === ReminderEnum.MONTHLY) {
      reminder.day_of_month = dto.dayOfMonth!;
      reminder.weekday = null
    }

    await this.reminderRepo.save(reminder);

    return this.toReminderResponse(reminder);
  }

  async findAll(userId: number): Promise<ReminderResponse[]> {
    const reminders = await this.reminderRepo.find({
      where: { user_id: userId },
    });
    if(reminders.length === 0){
      throw new NotFoundException("No reminders were found")
    }
    return reminders.map(rem => this.toReminderResponse(rem))
  }

  async sendReminderReportEmail(userId: number, from: Date, to: Date): Promise<void> {
      const user = (await this.usersService.findById(userId))!;
      const pdf = await this.reportsService.generateReminderPdf(userId, from, to);

      return this.emailService.sendReminderReportEmail(user, pdf);
  }

  private toReminderResponse(reminder: Reminder): ReminderResponse {
    return {
      id: reminder.id,
      type: reminder.type,
      active: reminder.active,
      userId: reminder.user_id,
      createdAt: reminder.created_at,
      dayOfMonth: reminder.day_of_month,
      weekday: reminder.weekday
    };
  }

}
