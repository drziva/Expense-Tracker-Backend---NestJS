import { IsNotEmpty, IsNumber, IsOptional, IsString, ValidateIf } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateExpenseDto {
  @ApiPropertyOptional({ example: 'BOSE Headphones', description: 'The description of the expense' })
  @ValidateIf(o => !o.amount)
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;

  @ApiPropertyOptional({ example: 150.75, description: 'The amount of the expense' })
  @ValidateIf(o => !o.description)
  @IsOptional()
  @IsNumber()
  @IsNotEmpty()
  amount?: number;

  @IsOptional()
  @IsNumber()
  @IsNotEmpty()
  group_id?:number
}
