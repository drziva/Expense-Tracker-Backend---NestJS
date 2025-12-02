import { Controller, Get, Post, Body } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  getUsers() {
    return this.usersService.findAll();
  }

  @Post()
  addUser(@Body() body: { username: string; password: string; email: string }) {
    return this.usersService.createUser(body.username, body.password, body.email);
  }
}
