import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateExpenseDto {
    @ApiProperty({ example: 'BOSE Headphones', description: 'The description of the expense' })
    @IsNotEmpty()
    @IsString()
    description: string;

    @ApiProperty({ example: 150.75, description: 'The amount of the expense' })
    @IsNumber()
    @IsNotEmpty()
    amount: number;

}
