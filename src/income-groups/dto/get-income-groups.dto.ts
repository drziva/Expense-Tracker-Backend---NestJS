import { Type } from "class-transformer";
import { IsOptional, IsString, IsEnum } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { IncomeGroupSortOrder } from "../income-groups.types";

export class GetIncomeGroupQueryDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Search income groups by name (partial match).',
    example: 'salary'
  })
  search?: string;

  @IsOptional()
  @IsEnum(IncomeGroupSortOrder)
  @ApiPropertyOptional({
    description: 'Sort order for results.',
    enum: IncomeGroupSortOrder,
    example: 'name_asc'
  })
  sort?: IncomeGroupSortOrder;

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
