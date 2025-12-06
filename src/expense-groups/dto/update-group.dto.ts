import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";

export class UpdateGroupDto {
  @ApiPropertyOptional({description: 'Updated name of the group.', example: 'Transport'})
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  name?: string;

  @ApiPropertyOptional({description: 'Updated description of the group.', example: 'Public transport expenses and fuel' })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  description?: string;

  @ApiPropertyOptional({description: 'Updated monthly budget cap for the group.', example: 500
  })
  @IsOptional()
  @Type(() => Number)
  budget_cap?: number;

}
