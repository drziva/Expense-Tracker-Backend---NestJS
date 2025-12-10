import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsBoolean } from 'class-validator';
import { ReminderEnum } from '../reminders-types';

export class UpdateReminderDto {
  @ApiProperty({
    description: 'Reminder frequency',
    enum: ReminderEnum,
    example: ReminderEnum.MONTHLY,
  })
  @IsEnum(ReminderEnum)
  type: ReminderEnum;

  @ApiProperty({
    description: 'Whether reminder is active',
    example: true,
  })
  @IsBoolean()
  active: boolean;
}
