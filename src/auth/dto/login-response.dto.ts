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

  @ApiProperty({ example: false })
  notifications: boolean;

  @ApiProperty({ example: true})
  welcomed: boolean;
}

export class LoginServiceResponse {
  accessToken: string;
  refreshToken: string;
  user: LoginUserResponse;
}

export class LoginResponse {
  @ApiProperty({ type: () => LoginUserResponse })
  user: LoginUserResponse;
}
