import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsDate, IsOptional } from "class-validator";

export class GetReportQueryDto {
    @ApiPropertyOptional({description:"Start date (YYYY-MM-DD) "})
    @IsOptional()
    @Type(()=> Date)
    @IsDate()
    from?: Date

    @ApiPropertyOptional({description:"End date (YYYY-MM-DD) "})
    @IsOptional()
    @Type(()=> Date)
    @IsDate()
    to?: Date
}