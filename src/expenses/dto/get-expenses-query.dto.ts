import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsEnum, IsString, IsDate, IsNumber } from "class-validator";
import { Type } from "class-transformer";
import { ExpenseSort } from "../expenses.types";

export class GetExpensesQueryDto {
    @ApiPropertyOptional({ description: "Start date (YYYY-MM-DD)" })
    @IsOptional()
    @Type(() => Date)
    @IsDate()
    from?: Date;

    @ApiPropertyOptional({ description: "End date (YYYY-MM-DD)" })
    @IsOptional()
    @Type(() => Date)
    @IsDate()
    to?: Date;

    @ApiPropertyOptional({ description: "Minimum amount" })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    min?: number;

    @ApiPropertyOptional({ description: "Maximum amount" })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    max?: number;

    @ApiPropertyOptional({
        description: "Sorting rules",
        enum: ExpenseSort,
    })
    @IsOptional()
    @IsEnum(ExpenseSort, { message: "Invalid sort option" })
    sort?: ExpenseSort;

    @ApiPropertyOptional({ example: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    page?: number;

    @ApiPropertyOptional({ example: 20 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    limit?: number;

    @ApiPropertyOptional({ description: "Search by description" })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({description: "Search by group id"})
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    groupId?: number;
}
