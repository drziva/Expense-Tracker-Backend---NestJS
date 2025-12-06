import { Type } from "class-transformer";
import { IsOptional, IsString } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class GetGroupQueryDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Search groups by name (partial match).',
    example: 'food'
  })
  search?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Sort order for results.',
    enum: ['name_asc', 'name_desc', 'date_asc', 'date_desc'],
    example: 'name_asc'
  })
  sort?: 'name_asc' | 'name_desc' | 'date_asc' | 'date_desc';

  @IsOptional()
  @Type(() => Number)
  @ApiPropertyOptional({
    description: 'Number of groups per page.',
    example: 20,
    minimum: 1
  })
  limit?: number;

  @IsOptional()
  @Type(() => Number)
  @ApiPropertyOptional({
    description: 'Page number (starts at 1).',
    example: 1,
    minimum: 1
  })
  page?: number;
}
