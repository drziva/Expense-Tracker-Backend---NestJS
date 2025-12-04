import { Controller, Get, Post, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { Public } from 'src/auth/public-decorator';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Public()
  @Get('hello')
  helloUser(): string {
    return 'Public vibes bro';
  }

  @Get('all')
  getUsers(): Promise<User[]> {
    return this.usersService.findAll() ;
  }
}
