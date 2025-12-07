import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateExpenseDto {
  @ApiPropertyOptional({
    example: 'Updated description',
    description: 'New description for the expense'
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;

  @ApiPropertyOptional({
    example: 175.00,
    description: 'Updated amount of the expense'
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'amount must be a valid number' })
  @Min(0)
  amount?: number;

  @ApiPropertyOptional({
    example: 4,
    description: 'Updated group ID'
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'group_id must be a valid number' })
  @Min(1)
  group_id?: number;
}
