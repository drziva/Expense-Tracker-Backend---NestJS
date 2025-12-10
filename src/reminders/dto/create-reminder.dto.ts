import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { ReminderEnum } from '../reminders-types';

export class CreateReminderDto {
  @ApiProperty({
    description: 'Reminder frequency',
    enum: ReminderEnum,
    example: ReminderEnum.WEEKLY,
  })
  @IsEnum(ReminderEnum)
  type: ReminderEnum;
}
