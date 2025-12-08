import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { UserId } from 'src/auth/user-id.decorator';
import { CreateIncomeGroupDto } from './dto/create-income-group.dto';
import { IncomeGroupsService } from './income-groups.service';
import { GetIncomeGroupQueryDto } from './dto/get-income-groups.dto';
import { ApiTags, ApiOperation, ApiParam, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { UpdateIncomeGroupDto } from './dto/update-income-group.dto';
import {
  DeleteIncomeGroupResponse,
  GetIncomeGroupResponse,
  IncomeGroupResponse
} from './income-groups.types';
import { IncomeResponse } from 'src/incomes/incomes.types';

@ApiTags('Income Groups')
@ApiBearerAuth()
@Controller('income-groups')
export class IncomeGroupsController {
  constructor(private incomeGroupsService: IncomeGroupsService) {}

  @ApiOperation({ summary: 'Get all income groups for the user with filtering, sorting, and pagination.' })
  @ApiResponse({ status: 200, description: 'List of income groups returned successfully.' })
  @Get()
  async getAllGroups(
    @UserId() userId: number,
    @Query() query: GetIncomeGroupQueryDto
    ): Promise<GetIncomeGroupResponse> {

    const pageNum = query.page && query.page > 0 ? query.page : 1;
    const limitNum = query.limit && query.limit > 0 ? query.limit : 20;

    return this.incomeGroupsService.getFilteredGroups(userId, {
        ...query,
        page: pageNum,
        limit: limitNum,
    });
    }

    @Get(':id/incomes')
    @ApiOperation({ summary: 'Get all incomes belonging to a specific group.' })
    @ApiParam({ name: 'id', type: Number, description: 'Income group ID' })
    @ApiResponse({ status: 200, description: 'List of incomes for this group.' })
    @ApiResponse({ status: 404, description: 'Group not found.' })
    async getIncomesForGroup(
        @UserId() userId: number,
        @Param('id', ParseIntPipe) id: number
    ): Promise<IncomeResponse[]> {
        return this.incomeGroupsService.getIncomesForGroup(userId, id);
    }

    @ApiOperation({ summary: 'Get a specific income group by ID.' })
    @ApiParam({ name: 'id', type: Number })
    @ApiResponse({ status: 200, description: 'Income group returned successfully.' })
    @ApiResponse({ status: 404, description: 'Income group not found.' })
    @Get(':id')
    async getGroup(
        @UserId() userId: number,
        @Param('id', ParseIntPipe) id: number
    ): Promise<IncomeGroupResponse> {
        return this.incomeGroupsService.getGroupById(userId, id);
    }

    @ApiOperation({ summary: 'Create a new income group.' })
    @ApiBody({ type: CreateIncomeGroupDto })
    @ApiResponse({ status: 201, description: 'Income group created successfully.' })
    @ApiResponse({ status: 409, description: 'Group with this name already exists.' })
    @Post()
    async createGroup(
        @UserId() userId: number,
        @Body() dto: CreateIncomeGroupDto
    ): Promise<IncomeGroupResponse> {
        return this.incomeGroupsService.createGroup(userId, dto);
    }

    @ApiOperation({ summary: 'Update an existing income group.' })
    @ApiParam({ name: 'id', type: Number })
    @ApiResponse({ status: 200, description: 'Income group updated successfully.' })
    @ApiResponse({ status: 404, description: 'Income group not found.' })
    @Put(':id')
    async updateGroup(
        @Param('id', ParseIntPipe) groupId: number,
        @UserId() userId: number,
        @Body() dto: UpdateIncomeGroupDto
    ): Promise<IncomeGroupResponse> {
        return this.incomeGroupsService.updateGroup(userId, groupId, dto);
    }

    @ApiOperation({ summary: 'Delete an income group (cascade deletes related incomes).' })
    @ApiParam({ name: 'id', type: Number })
    @ApiResponse({ status: 200, description: 'Income group deleted successfully.' })
    @ApiResponse({ status: 404, description: 'Income group not found.' })
    @Delete(':id')
    async deleteGroup(
        @UserId() userId: number,
        @Param('id', ParseIntPipe) groupId: number
    ): Promise<DeleteIncomeGroupResponse> {
        return this.incomeGroupsService.deleteGroup(userId, groupId);
    }
}
