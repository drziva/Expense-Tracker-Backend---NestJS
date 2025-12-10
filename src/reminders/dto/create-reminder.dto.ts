import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, Min, Max, ValidateIf } from 'class-validator';
import { ReminderEnum } from '../reminders-types';

export class CreateReminderDto {
  @ApiProperty({
    description: 'Reminder frequency',
    enum: ReminderEnum,
    example: ReminderEnum.WEEKLY,
  })
  @IsEnum(ReminderEnum)
  type: ReminderEnum;

  @ApiPropertyOptional({
    description: 'Day of week (0 = Sunday, 6 = Saturday). Required if type = weekly.',
    example: 1,
  })
  @ValidateIf(o => o.type === ReminderEnum.WEEKLY)
  @IsInt()
  @Min(0)
  @Max(6)
  weekday?: number;

  @ApiPropertyOptional({
    description: 'Day of month (1 to 31). Required if type = monthly.',
    example: 15,
  })
  @ValidateIf(o => o.type === ReminderEnum.MONTHLY)
  @IsInt()
  @Min(1)
  @Max(31)
  day_of_month?: number;
}
