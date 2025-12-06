import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsEnum, IsString, IsDate } from "class-validator";
import { Type } from "class-transformer";
import type { ExpenseSort } from "../expense-sort.type";

export class GetExpensesQueryDto {
    @ApiPropertyOptional({ description: "Start date (YYYY-MM-DD)" })
    @IsOptional()
    @IsDate()
    @Type(() => Date)
    from?: Date;

    @ApiPropertyOptional({ description: "End date (YYYY-MM-DD)" })
    @IsOptional()
    @IsDate()
    @Type(() => Date)
    to?: Date;

    @ApiPropertyOptional({ description: "Minimum amount" })
    @IsOptional()
    @Type(() => Number)
    min?: number;

    @ApiPropertyOptional({ description: "Maximum amount" })
    @IsOptional()
    @Type(() => Number)
    max?: number;

    @ApiPropertyOptional({
    description: "Sorting rules",
    enum: ["date_asc", "date_desc", "amount_asc", "amount_desc"],
    })
    @IsOptional()
    @IsEnum(["date_asc", "date_desc", "amount_asc", "amount_desc"], { message: "Invalid sort option" })
    sort?: ExpenseSort;

    @ApiPropertyOptional({ example: 1 })
    @IsOptional()
    @Type(() => Number)
    page?: number;

    @ApiPropertyOptional({ example: 20 })
    @IsOptional()
    @Type(() => Number)
    limit?: number;

    @ApiPropertyOptional({ description: "Search by description" })
    @IsOptional()
    @IsString()
    search?: string;
}
