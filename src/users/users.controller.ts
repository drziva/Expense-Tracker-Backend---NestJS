import { Controller, Get, Post, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './user.entity';


@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('all')
  getUsers(): Promise<User[]> {
    return this.usersService.findAll();
  }
}
