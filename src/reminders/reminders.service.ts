import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reminder } from './reminders.entity';
import { UsersService } from 'src/users/users.service';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { UpdateReminderDto } from './dto/update-reminder.dto';
import { DeleteReminderResponse, ReminderResponse } from './dto/reminders-returns.dto';

@Injectable()
export class RemindersService {
  constructor(
    @InjectRepository(Reminder)
    private reminderRepo: Repository<Reminder>,
    private usersService: UsersService,
  ) {}

  async create(userId: number, dto: CreateReminderDto): Promise<ReminderResponse> {
    try {
      const user = await this.usersService.findById(userId);
      if (!user) {
        throw new NotFoundException('User not found.');
      }
      const reminder = this.reminderRepo.create({
        type: dto.type,
        user_id: userId,
      });

      await this.reminderRepo.save(reminder);

      return this.toReminderResponse(reminder);
    } catch(error){
      throw error;
    }
  }

  async findAll(userId: number) {
    return this.reminderRepo.find({
      where: { user_id: userId },
    });
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
      await this.reminderRepo.save(reminder);

      return this.toReminderResponse(reminder);
  } catch(error){
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
      throw error;
    }
  }

  private toReminderResponse(reminder: Reminder): ReminderResponse {
    return {
      id: reminder.id,
      type: reminder.type,
      active: reminder.active,
      user_id: reminder.user_id,
      created_at: reminder.created_at,
    };
  }

}
