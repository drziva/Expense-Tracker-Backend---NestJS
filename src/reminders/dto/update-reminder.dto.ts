import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsBoolean, IsInt, Min, Max, ValidateIf } from 'class-validator';
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

  @ApiPropertyOptional({
    description: 'Day of week (0 = Sunday, 6 = Saturday). Required if type = weekly.',
    example: 2,
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
  dayOfMonth?: number;
}
