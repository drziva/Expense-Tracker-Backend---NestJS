import { IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateIncomeGroupDto {
    @ApiProperty({
        description: 'Name of the income group.',
        example: 'Salary',
    })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({
        description: 'Description of the income group.',
        example: 'Monthly salary and related income sources.',
    })
    @IsNotEmpty()
    @IsString()
    description: string;
}
