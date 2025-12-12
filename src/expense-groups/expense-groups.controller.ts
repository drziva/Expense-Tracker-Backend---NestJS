import { 
  Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query 
} from '@nestjs/common';
import { UserId } from 'src/auth/user-id.decorator';
import { CreateGroupDto } from './dto/create-group.dto';
import { ExpenseGroupsService } from './expense-groups.service';
import { GetGroupQueryDto } from './dto/get-expense-groups.dto';
import { ApiTags, ApiOperation, ApiParam, ApiResponse, ApiBody, ApiBearerAuth, ApiOkResponse, ApiCreatedResponse } from '@nestjs/swagger';
import { UpdateGroupDto } from './dto/update-group.dto';
import { BudgetStatus, DeleteGroupResponse, GetGroupResponse, GroupResponse } from './dto/expense-groups-responses.dto';
import { ExpenseResponse } from 'src/expenses/dto/expenses-responses.dto';
import { BudgetStatusDto } from './dto/budget-status.dto';


@ApiTags('Expense Groups')
@ApiBearerAuth()
@Controller('expense-groups')
export class ExpenseGroupsController {
    constructor(private readonly expenseGroupsService: ExpenseGroupsService) {}

    @ApiOperation({ summary: 'Get all groups for user with filtering, sorting, and pagination.' })
    @ApiOkResponse({ 
        description: 'List of groups returned successfully.',
        type: GetGroupResponse
    })
    @Get()
    async getAllGroups(
        @UserId() userId: number,
        @Query() query: GetGroupQueryDto
    ): Promise<GetGroupResponse> {
        const pageNum = query.page && query.page > 0 ? query.page : 1;
        const limitNum = query.limit && query.limit > 0 ? query.limit : 20;

        return this.expenseGroupsService.getFilteredGroups(userId, { 
            ...query,
            page: pageNum,
            limit: limitNum
        });
    }

    @ApiOperation({ summary: 'Get budget usage for this group (current month).' })
    @ApiParam({ name: 'id', type: Number })
    @ApiOkResponse({ 
        description: 'Budget status returned.',
        type: BudgetStatus 
    })
    @ApiResponse({ status: 404, description: 'Group not found.' })
    @Get(':id/budget')
    async getBudgetStatus(
        @UserId() userId: number,
        @Param('id', ParseIntPipe) id: number
    ): Promise<BudgetStatus> {
        return this.expenseGroupsService.getBudgetStatus(userId, id);
    }
    
    @ApiOperation({ summary: 'Get all expenses belonging to a specific group.' })
    @ApiParam({ name: 'id', type: Number, description: 'Group ID' })
    @ApiOkResponse({ 
        description: 'List of expenses for this group.',
        type: ExpenseResponse,
        isArray: true
    })
    @ApiResponse({ status: 404, description: 'Group not found.' })
    @Get(':id/expenses')
    async getExpensesForGroup(
        @UserId() userId: number,
        @Param('id', ParseIntPipe) id: number
    ): Promise<ExpenseResponse[]> {
        return this.expenseGroupsService.getExpensesForGroup(userId, id);
    }

    @ApiOperation({ summary: 'Get a specific group by ID.' })
    @ApiParam({ name: 'id', type: Number })
    @ApiOkResponse({ 
        description: 'Group returned successfully.',
        type: GroupResponse 
    })
    @ApiResponse({ status: 404, description: 'Group not found.' })
    @Get(':id')
    async getGroup(
        @UserId() userId: number,
        @Param('id', ParseIntPipe) id: number
    ): Promise<GroupResponse> {
        return this.expenseGroupsService.getGroupById(userId, id);
    }

    @ApiOperation({ summary: 'Create a new expense group.' })
    @ApiBody({ type: CreateGroupDto })
    @ApiCreatedResponse({ 
        description: 'Group created successfully.',
        type: GroupResponse 
    })
    @ApiResponse({ status: 409, description: 'Group with this name already exists.' })
    @Post()
    async createGroup(
        @UserId() userId: number,
        @Body() dto: CreateGroupDto
    ): Promise<GroupResponse> {
        return this.expenseGroupsService.createGroup(userId, dto);
    }

    @ApiOperation({ summary: 'Update an existing expense group.' })
    @ApiParam({ name: 'id', type: Number })
    @ApiOkResponse({ 
        description: 'Group updated successfully.',
        type: GroupResponse 
    })
    @ApiResponse({ status: 404, description: 'Group not found.' })
    @Put(':id')
    async updateGroup(
        @Param('id', ParseIntPipe) groupId: number,
        @UserId() userId: number,
        @Body() dto: UpdateGroupDto
    ): Promise<GroupResponse> {
        return this.expenseGroupsService.updateGroup(userId, groupId, dto)
    }

    @ApiOperation({ summary: 'Delete a specific group (cascade deletes expenses).' })
    @ApiParam({ name: 'id', type: Number })
    @ApiOkResponse({ 
        description: 'Group deleted successfully.',
        type: DeleteGroupResponse 
    })
    @ApiResponse({ status: 404, description: 'Group not found.' })
    @Delete(':id')
    async deleteGroup(
        @UserId() userId: number,
        @Param('id', ParseIntPipe) groupId: number
    ): Promise<DeleteGroupResponse> {
        return this.expenseGroupsService.deleteGroup(userId, groupId);
    }
}
