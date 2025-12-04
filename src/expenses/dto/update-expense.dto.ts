import { IsNotEmpty, IsNumber, IsOptional, IsString, ValidateIf } from 'class-validator';

export class UpdateExpenseDto {
  @ValidateIf(o => !o.amount)
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;

  @ValidateIf(o=>!o.description)
  @IsOptional()
  @IsNumber()
  @IsNotEmpty()
  amount?: number;

}
