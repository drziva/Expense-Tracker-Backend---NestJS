import { ApiProperty } from '@nestjs/swagger';
import { ReminderEnum } from '../reminders-types';

export class ReminderResponse {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ enum: ReminderEnum, example: ReminderEnum.MONTHLY })
  type: ReminderEnum;

  @ApiProperty({ example: true })
  active: boolean;
  
  @ApiProperty({ example: 5 })
  userId: number;

  @ApiProperty({ example: '2025-01-01T12:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({
    example: 3, 
    nullable:true
  })
  weekday: number | null;

  @ApiProperty({
    example: 23, 
    nullable:true
  })
  dayOfMonth: number | null;  
}

export class DeleteReminderResponse {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 12 })
  id: number;
}