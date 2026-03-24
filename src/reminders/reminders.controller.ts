import {
  Body,
  Controller,
  Get,
  Put,
  Param,
  UseGuards,
  ParseEnumPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiOkResponse,
} from '@nestjs/swagger';
import { RemindersService } from './reminders.service';
import { UserId } from '../auth/user-id.decorator';
import { UpdateReminderDto } from './dto/update-reminder.dto';
import { PremiumGuard } from '../auth/guards/premium.guard';
import { ReminderResponse } from './dto/reminders-responses.dto';
import { ReminderEnum } from './reminders-types';

@ApiTags('Reminders')
@ApiBearerAuth()
@UseGuards(PremiumGuard)
@Controller('reminders')
export class RemindersController {
  constructor(
    private readonly remindersService: RemindersService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get reminder configuration for the authenticated user' })
  @ApiOkResponse({
    description: 'List of reminders (weekly / monthly)',
    type: [ReminderResponse],
  })
  async findAll(
    @UserId() userId: number,
  ): Promise<ReminderResponse[]> {
    return this.remindersService.findAll(userId);
  }

  @Put(':type')
  @ApiOperation({
    summary: 'Set or disable a reminder by type (weekly or monthly)',
  })
  @ApiOkResponse({
    description: 'Reminder updated',
    type: ReminderResponse,
  })
  async upsertByType(
    @UserId() userId: number,
    @Param('type', new ParseEnumPipe(ReminderEnum)) type: ReminderEnum,
    @Body() dto: UpdateReminderDto,
  ): Promise<ReminderResponse> {
    return this.remindersService.upsertByType(userId, type, dto);
  }
}
