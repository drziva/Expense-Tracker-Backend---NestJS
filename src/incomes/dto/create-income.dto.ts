import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateIncomeDto {
    @ApiProperty({
        example: 'Paycheck', 
        description: 'The description of the income' 
    })
    @IsNotEmpty()
    @IsString()
    description: string;

    @ApiProperty({ 
        example: 150.75,
        description: 'The amount of the income' 
    })
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    amount: number;

    @ApiProperty({ 
        description: 'The ID of associated group',
        example: 3
    })
    @Type(() => Number)
    @IsNumber()
    groupId: number;
}
