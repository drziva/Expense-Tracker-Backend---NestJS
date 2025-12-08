import { IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateIncomeGroupDto {
  @ApiProperty({
    description: 'Updated name of the income group.',
    example: 'Freelance Work',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Updated description of the income group.',
    example: 'Income from freelance programming projects.',
  })
  @IsNotEmpty()
  @IsString()
  description: string;
}
