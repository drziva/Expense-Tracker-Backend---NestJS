import { ApiProperty } from '@nestjs/swagger';

export class LoginUserResponse {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'nikola' })
  username: string;

  @ApiProperty({ example: 'nikola@example.com' })
  email: string;

  @ApiProperty({ example: false })
  premium: boolean;
}

export class LoginResponse {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT access token'
  })
  access_token: string;

  @ApiProperty({ type: () => LoginUserResponse })
  user: LoginUserResponse;
}
