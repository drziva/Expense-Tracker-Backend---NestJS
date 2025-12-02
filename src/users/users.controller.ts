import { Controller, Get, Post, Body } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  getUsers() {
    return this.usersService.findAll();
  }
  /*
  Moving this API to AuthModule for better structure
  
  @Post('create')
  addUser(@Body() body: { username: string; password: string; email: string }) {
    return this.usersService.createUser(body.username, body.password, body.email);
  }
  */
}
