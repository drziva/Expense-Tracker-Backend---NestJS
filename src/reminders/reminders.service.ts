import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reminder } from './reminders.entity';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { UpdateReminderDto } from './dto/update-reminder.dto';
import { DeleteReminderResponse, ReminderResponse } from './dto/reminders-responses.dto';
import { ReminderEnum } from './reminders-types';

@Injectable()
export class RemindersService {
  constructor(
    @InjectRepository(Reminder)
    private reminderRepo: Repository<Reminder>,
  ) {}

  async create(userId: number, dto: CreateReminderDto): Promise<ReminderResponse> {
    try {
      const reminder = this.reminderRepo.create({
        type: dto.type,
        weekday: dto.type === ReminderEnum.WEEKLY ? dto.weekday : null,
        day_of_month: dto.type === ReminderEnum.MONTHLY ? dto.dayOfMonth : null,
        user_id: userId,
      });

      await this.reminderRepo.save(reminder);

      return this.toReminderResponse(reminder);
    } catch(error){
      console.error("Error creating reminder: ", error);
      throw error;
    }
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

  async update(userId: number, id: number, dto: UpdateReminderDto) {
    try {
      const reminder = await this.reminderRepo.findOne({
        where: { id, user_id: userId },
      });
      
      if (!reminder) {
        throw new NotFoundException('Reminder not found.');
      }
      reminder.active = dto.active;
      reminder.type = dto.type; 
      
    if (dto.type === ReminderEnum.WEEKLY) {
      reminder.weekday = dto.weekday ?? null;
      reminder.day_of_month = null;
    } else {
      reminder.day_of_month = dto.dayOfMonth ?? null;
      reminder.weekday = null;
    }

      await this.reminderRepo.save(reminder);

      return this.toReminderResponse(reminder);
  } catch(error){
      console.error("Error updating reminder: ", error);
      throw error
  }

  }

  async delete(userId: number, id: number): Promise<DeleteReminderResponse> {
    try{
      const reminder = await this.reminderRepo.findOne({
        where: { id, user_id: userId },
      });

      if (!reminder) {
        throw new NotFoundException('Reminder not found.');
      }
      await this.reminderRepo.remove(reminder);
      
      return { success:true, id: id};}
    catch(error){
      console.error("Error deleting reminder: ", error);
      throw error;
    }
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
