import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsBoolean } from 'class-validator';

export class UpdateReminderDto {
  @ApiProperty({
    description: 'Reminder frequency',
    enum: ['weekly', 'monthly'],
    example: 'monthly',
  })
  @IsEnum(['weekly', 'monthly'])
  type: 'weekly' | 'monthly';

  @ApiProperty({
    description: 'Whether reminder is active',
    example: true,
  })
  @IsBoolean()
  active: boolean;
}
