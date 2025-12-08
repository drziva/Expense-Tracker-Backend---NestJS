import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";

export class UpdateGroupDto {
  @ApiProperty({
    description: 'Updated name of the group.', 
    example: 'Transport'
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Updated description of the group.', 
    example: 'Public transport expenses and fuel' 
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiPropertyOptional({
    description: 'Updated monthly budget cap for the group.',
    example: 500
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  budgetCap?: number;

}
