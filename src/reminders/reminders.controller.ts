import { Body, Controller, Post, Get, Put, Delete, Param, ParseIntPipe, UseGuards, } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiOkResponse, ApiCreatedResponse } from '@nestjs/swagger';
import { RemindersService } from './reminders.service';
import { UserId } from 'src/auth/user-id.decorator';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { UpdateReminderDto } from './dto/update-reminder.dto';
import { PremiumGuard } from 'src/auth/guards/premium.guard';
import { DeleteReminderResponse, ReminderResponse } from './dto/reminders-responses.dto';
import { ReportsService } from 'src/reports/reports.service';



@ApiTags('Reminders')
@ApiBearerAuth()
@UseGuards(PremiumGuard)
@Controller('reminders')
export class RemindersController {
  constructor(private remindersService: RemindersService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new reminder (Premium only)' })
  @ApiCreatedResponse({ description: 'Reminder created', type: ReminderResponse })
  async create(
    @UserId() userId: number,
    @Body() dto: CreateReminderDto,
  ): Promise<ReminderResponse> {
    return await this.remindersService.create(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all reminders for the authenticated user' })
  @ApiOkResponse({ description: 'List of reminders', type: [ReminderResponse] })
  async findAll(
    @UserId() userId: number,
  ): Promise<ReminderResponse[]> {
    return await this.remindersService.findAll(userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an existing reminder (type & active required)' })
  @ApiOkResponse({ description: 'Updated reminder', type: ReminderResponse })
  async update(
    @UserId() userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateReminderDto,
  ): Promise<ReminderResponse> {
    return await this.remindersService.update(userId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a reminder' })
  @ApiOkResponse({ description: 'Reminder deleted', type: DeleteReminderResponse })
  async delete(
    @UserId() userId: number,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<DeleteReminderResponse> {
    return await this.remindersService.delete(userId, id);
  }
}
