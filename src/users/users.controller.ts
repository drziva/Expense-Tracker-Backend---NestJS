import { Controller, Get, Param, ParseBoolPipe, ParseIntPipe, Put, Query, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UserId } from 'src/auth/user-id.decorator';
import { PremiumGuard } from 'src/auth/guards/premium.guard';


@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}
  
  @ApiOperation({ summary: "Get all users" })
  @Get('all')
  getUsers(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Put('/welcomed/toggle')
  async toggleWelcomed(
    @UserId() userId
  ) {
    return await this.usersService.toggleWelcomed(userId);
  }  

  @UseGuards(PremiumGuard)
  @Put('/notifications/toggle')
  async toggleNotifications( @UserId() userId: number ): Promise<boolean> {
    return await this.usersService.toggleNotifications(userId);
  }
}
