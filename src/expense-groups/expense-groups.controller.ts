import { 
  Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query 
} from '@nestjs/common';
import { UserId } from 'src/auth/user-id.decorator';
import { CreateGroupDto } from './dto/create-group.dto';
import { ExpenseGroupsService } from './expense-groups.service';
import { GetGroupQueryDto } from './dto/get-expense-groups.dto';
import { ApiTags, ApiOperation, ApiParam, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { UpdateGroupDto } from './dto/update-group.dto';
import { BudgetStatus, DeleteGroupResponse, GetGroupResponse, GroupResponse } from './expense-groups.types';
import { ExpenseResponse } from 'src/expenses/expenses.types';


@ApiTags('Expense Groups')
@ApiBearerAuth()
@Controller('expense-groups')
export class ExpenseGroupsController {
    constructor(private expenseGroupsService: ExpenseGroupsService) {}

    @Get('all')
    @ApiOperation({ summary: 'Get all groups for user with filtering, sorting, and pagination.' })
    @ApiResponse({ status: 200, description: 'List of groups returned successfully.' })
    async getAllGroups(
        @UserId() userId: number,
        @Query() query: GetGroupQueryDto
    ): Promise<GetGroupResponse> {
        const pageNum = (query.page ?? 0) > 0 ? query.page : 1;
        const limitNum = (query.limit ?? 0) > 0 ? query.limit : 20;

        const { page, limit, ...rest } = query;

        return this.expenseGroupsService.getFilteredGroups(userId, { 
            ...rest,
            page: pageNum,
            limit: limitNum
        });
    }

    @Get(':id/budget')
    @ApiOperation({ summary: 'Get budget usage for this group (current month).' })
    async getBudgetStatus(
        @UserId() userId: number,
        @Param('id', ParseIntPipe) id: number
    ): Promise<BudgetStatus> {
        return this.expenseGroupsService.getBudgetStatus(userId, id);
    }


    @Get(':id/expenses')
    @ApiOperation({ summary: 'Get all expenses belonging to a specific group.' })
    @ApiParam({ name: 'id', type: Number, description: 'Group ID' })
    @ApiResponse({ status: 200, description: 'List of expenses for this group.' })
    @ApiResponse({ status: 404, description: 'Group not found.' })
    async getExpensesForGroup(
        @UserId() userId: number,
        @Param('id', ParseIntPipe) id: number
    ): Promise<ExpenseResponse[]> {
        return this.expenseGroupsService.getExpensesForGroup(userId, id);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a specific group by ID.' })
    @ApiParam({ name: 'id', type: Number })
    @ApiResponse({ status: 200, description: 'Group returned successfully.' })
    @ApiResponse({ status: 404, description: 'Group not found.' })
    async getGroup(
        @UserId() userId: number,
        @Param('id', ParseIntPipe) id: number
    ): Promise<GroupResponse> {
        return this.expenseGroupsService.getGroupById(userId, id);
    }

    @Post('add')
    @ApiOperation({ summary: 'Create a new expense group.' })
    @ApiBody({ type: CreateGroupDto })
    @ApiResponse({ status: 201, description: 'Group created successfully.' })
    @ApiResponse({ status: 409, description: 'Group with this name already exists.' })
    async addExpenseGroup(
        @UserId() userId: number,
        @Body() dto: CreateGroupDto
    ): Promise<GroupResponse> {
        return this.expenseGroupsService.addGroup(userId, dto);
    }

    @Put(':id')
    async updateExpenseGroup(
        @Param('id', ParseIntPipe) groupId: number,
        @UserId() userId: number,
        @Body() dto: UpdateGroupDto
    ): Promise<GroupResponse> {
        return this.expenseGroupsService.updateGroup(userId, groupId, dto)
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a specific group (cascade deletes expenses).' })
    @ApiParam({ name: 'id', type: Number })
    @ApiResponse({ status: 200, description: 'Group deleted successfully.' })
    @ApiResponse({ status: 404, description: 'Group not found.' })
    async deleteGroup(
        @UserId() userId: number,
        @Param('id', ParseIntPipe) groupId: number
    ): Promise<DeleteGroupResponse> {
        return this.expenseGroupsService.deleteGroup(userId, groupId);
    }
}
