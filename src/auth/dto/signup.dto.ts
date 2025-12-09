import {IsEmail, IsNotEmpty, IsString, MinLength} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignUpDto {
  @ApiProperty({ 
    example: 'john_doe', 
    description: 'The username of the user' 
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ 
    example: 'user@example.com', 
    description: 'The email of the user' 
  })
  @IsEmail()
  email: string;

  @ApiProperty({ 
    example: 'strongPassword123', 
    description: 'The password of the user' 
  })
  @IsString()
  @MinLength(6)
  password: string;
}
