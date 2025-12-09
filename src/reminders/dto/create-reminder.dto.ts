import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export class CreateReminderDto {
  @ApiProperty({
    description: 'Reminder frequency',
    enum: ['weekly', 'monthly'],
    example: 'weekly',
  })
  @IsEnum(['weekly', 'monthly'])
  type: 'weekly' | 'monthly';
}
