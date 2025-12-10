import { ApiProperty } from '@nestjs/swagger';

export class ReminderResponse {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ enum: ['weekly', 'monthly'], example: 'weekly' })
  type: 'weekly' | 'monthly';

  @ApiProperty({ example: true })
  active: boolean;

  @ApiProperty({ example: 5 })
  user_id: number;

  @ApiProperty({ example: '2025-01-01T12:00:00.000Z' })
  created_at: Date;
}

export class DeleteReminderResponse {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 12 })
  id: number;
}