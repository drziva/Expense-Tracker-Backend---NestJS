import { ApiProperty } from '@nestjs/swagger';

export class LoginUserResponse {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'jocko' })
  username: string;

  @ApiProperty({ example: 'jocko@example.com' })
  email: string;

  @ApiProperty({ example: false })
  premium: boolean;
}

export class LoginResponse {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT access token'
  })
  accessToken: string;

  @ApiProperty({ type: () => LoginUserResponse })
  user: LoginUserResponse;
}
