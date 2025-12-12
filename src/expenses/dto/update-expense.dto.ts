import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateExpenseDto {
  @ApiProperty({
    example: 'Updated description',
    description: 'New description for the expense'
  })

  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    example: 175.00,
    description: 'Updated amount of the expense'
  })
  @Type(() => Number)
  @IsNumber({}, { message: 'amount must be a valid number' })
  @Min(0)
  amount: number;

  @ApiProperty({
    example: 4,
    description: 'Updated group ID'
  })

  @Type(() => Number)
  @IsNumber({}, { message: 'groupId must be a valid number' })
  groupId: number;
}
