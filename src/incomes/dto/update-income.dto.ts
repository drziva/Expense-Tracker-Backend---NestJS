import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateIncomeDto {
  @ApiProperty({
    example: 'Updated description',
    description: 'New description for the income'
  })

  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    example: 175.00,
    description: 'Updated amount of the income'
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
  @IsNumber({}, { message: 'group_id must be a valid number' })
  group_id: number;
}
