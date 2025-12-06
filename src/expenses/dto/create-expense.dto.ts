import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateExpenseDto {
    @ApiProperty({ example: 'BOSE Headphones', description: 'The description of the expense' })
    @IsNotEmpty()
    @IsString()
    description: string;

    @ApiProperty({ example: 150.75, description: 'The amount of the expense' })
    @Type(() => Number)
    @IsNumber()
    amount: number;

    @ApiProperty({ example: 3, description: 'The ID of associated group' })
    @Type(() => Number)
    @IsNumber()
    group_id: number;
}
