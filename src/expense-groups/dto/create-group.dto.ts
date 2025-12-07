import { IsNotEmpty, IsString, IsOptional, IsNumber, Min } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";

export class CreateGroupDto {
    @ApiProperty({
        description: 'Name of the expense group.',
        example: 'Groceries',
    })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({
        description: 'Description of the group.',
        example: 'Expenses related to food and supermarket purchases.'
    })
    @IsNotEmpty()
    @IsString()
    description: string;

    @ApiPropertyOptional({
        description: 'Monthly budget cap for this group (optional).',
        example: 300
    })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    budgetCap?: number;
}
