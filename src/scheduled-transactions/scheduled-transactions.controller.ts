import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { ScheduledTransactionsService } from './scheduled-transactions.service';
import { UserId } from 'src/auth/user-id.decorator';
import { PremiumGuard } from 'src/auth/guards/premium.guard';
import { CreateScheduledTransactionDto } from './dto/create-scheduled-transaction.dto';
import { UpdateScheduledTransactionDto } from './dto/update-scheduled-transaction.dto';
import { ScheduledTransactionResponse } from './dto/scheduled-transactions-responses';
import { DeleteScheduledTransactionResponse } from './dto/delete-scheduled-transaction.dto';

@ApiTags('Scheduled Transactions')
@ApiBearerAuth()
@UseGuards(PremiumGuard)
@Controller('scheduled-transactions')
export class ScheduledTransactionsController {
  constructor(
    private readonly scheduledTransactionsService: ScheduledTransactionsService
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all scheduled transactions for the authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'List of scheduled transactions returned successfully',
    type: ScheduledTransactionResponse,
    isArray: true,
  })
  async getAll(
    @UserId() userId: number
  ): Promise<ScheduledTransactionResponse[]> {
    return this.scheduledTransactionsService.getAll(userId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new scheduled transaction' })
  @ApiBody({ type: CreateScheduledTransactionDto })
  @ApiResponse({
    status: 201,
    description: 'Scheduled transaction created successfully',
    type: ScheduledTransactionResponse,
  })
  async create(
    @UserId() userId: number,
    @Body() dto: CreateScheduledTransactionDto
  ): Promise<ScheduledTransactionResponse> {
    return await this.scheduledTransactionsService.create(userId, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an existing scheduled transaction' })
  @ApiBody({ type: UpdateScheduledTransactionDto })
  @ApiResponse({
    status: 200,
    description: 'Scheduled transaction updated successfully',
    type: ScheduledTransactionResponse,
  })
  @ApiResponse({
    status: 404,
    description: 'Transaction not found',
  })
  async update(
    @UserId() userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateScheduledTransactionDto
  ): Promise<ScheduledTransactionResponse> {
    return await this.scheduledTransactionsService.update(userId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a scheduled transaction' })
  @ApiResponse({
    status: 200,
    description: 'Scheduled transaction deleted successfully',
    type: DeleteScheduledTransactionResponse,
  })
  @ApiResponse({
    status: 404,
    description: 'The specified transaction was not found',
  })
  async delete(
    @UserId() userId: number,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<DeleteScheduledTransactionResponse> {
    return await this.scheduledTransactionsService.delete(userId, id);
  }
}
