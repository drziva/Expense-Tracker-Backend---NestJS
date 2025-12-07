import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { ExpenseGroup } from './expense-groups.entity.ts';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from 'src/users/users.service';
import { Between, Like, Repository } from 'typeorm';
import { CreateGroupDto } from './dto/create-group.dto';
import { BudgetStatus, DeleteGroupResponse, GetGroupResponse, GroupQueryOptions, GroupResponse } from './expense-groups.types';
import { UpdateGroupDto } from './dto/update-group.dto';
import { Expense } from 'src/expenses/expenses.entity';
import { ExpenseResponse } from 'src/expenses/expenses.types';
import { BudgetStatusDto } from './dto/budget-status.dto.js';

@Injectable()
export class ExpenseGroupsService {
    constructor(
        @InjectRepository(ExpenseGroup)
        private expenseGroupRepo: Repository<ExpenseGroup>,
        @InjectRepository(Expense)
        private expenseRepo: Repository<Expense>,

        private usersService: UsersService,
    ){}

    async getGroupById(userId: number, groupId: number): Promise<GroupResponse>{
        const group = await this.validateGroup(userId, groupId);

        return this.toGroupResponse(group);
    }

    async getExpensesForGroup(userId: number, groupId: number): Promise<ExpenseResponse[]> {
        await this.validateGroup(userId,groupId);

        const expenses = await this.expenseRepo.find({
            where:{user_id: userId, group_id: groupId}
        });
        return expenses.map((exp)=> this.toExpenseResponse(exp));
    }

    async getFilteredGroups( userId: number, options: GroupQueryOptions): Promise<GetGroupResponse> {
        await this.validateUser(userId);
        const where: any = { user_id: userId };
        const { search, sort, page = 1, limit = 20 } = options;

        // Filtering — name search
        if (search) {
        where.name = Like(`%${search}%`);
        }

        // Sorting
        let order: any = { created_at: 'DESC' }; // Default

        switch (sort) {
        case 'name_asc':
            order = { name: 'ASC' };
            break;
        case 'name_desc':
            order = { name: 'DESC' };
            break;
        case 'date_asc':
            order = { created_at: 'ASC' };
            break;
        case 'date_desc':
            order = { created_at: 'DESC' };
            break;
        }

        // Pagination
        const skip = (page - 1) * limit;
        const [groups, total] = await this.expenseGroupRepo.findAndCount({
            where,
            order,
            skip,
            take: limit
        });

        return {
            data: groups.map(g => this.toGroupResponse(g)),
            page,
            limit,
            totalItems: total,
            totalPages: Math.ceil(total / limit),
        };
    }


    async createGroup(userId: number, dto: CreateGroupDto): Promise<GroupResponse>{
        await this.validateUser(userId);
        const groupExists = await this.expenseGroupRepo.findOne({where:{name:dto.name,user_id:userId}});
        if(groupExists) throw new ConflictException("Group with this name already exists");

       try { 
        const group = this.expenseGroupRepo.create({
            user_id: userId,
            name:dto.name,
            description:dto.description,
            monthly_budget_cap: dto.budgetCap ?? null
        })
        await this.expenseGroupRepo.save(group);

        return this.toGroupResponse(group);
        } catch(error) {
            throw new InternalServerErrorException("Database error while creating expense group");
        }
    }       

    async updateGroup(userId:number, groupId:number, dto: UpdateGroupDto): Promise<GroupResponse> {
        const group = await this.validateGroup(userId, groupId);

        if (dto.name !== undefined && dto.name !== group.name) {
            const conflict = await this.expenseGroupRepo.findOne({
                where: { name: dto.name, user_id: userId }
            });

            if (conflict) {
                throw new ConflictException("Group with this name already exists");
            }
            group.name = dto.name;
        }

        if (dto.description !== undefined) {
            group.description = dto.description;
        }

        if (dto.budgetCap !== undefined) {
            group.monthly_budget_cap = dto.budgetCap;
        }



        try {
        const updatedGroup = await this.expenseGroupRepo.save(group);
            return this.toGroupResponse(updatedGroup);
        } catch (error) {
        console.error(error);
            throw new InternalServerErrorException("Updating group failed");
        }
    }

    async deleteGroup(userId: number, groupId: number): Promise<DeleteGroupResponse> {
        await this.validateGroup(userId,groupId);

        try {
            const result = await this.expenseGroupRepo.delete({
                id: groupId,
                user_id: userId
            });

            if (result.affected === 0) {
                throw new NotFoundException("Group was not found for this user");
            }

            return { success: true, id: groupId };

        } catch (error) {
            if(error instanceof NotFoundException){  //Make sure 404 error doesn't get swallowed
                throw error;
            }
            console.error(error);
            throw new InternalServerErrorException("Database error while deleting group");
        }
    } 

    async getBudgetStatus(userId: number, groupId: number): Promise<BudgetStatusDto> {
        const group = await this.validateGroup(userId, groupId);

        if (group.monthly_budget_cap === null) {
            return {
                groupId,
                hasBudget: false,
                budgetCap: null,
                spentThisMonth: 0,
                remaining: null,
                percentageUsed: null,
                isOverBudget: false,
            };
        }

        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const endOfMonth = new Date(startOfMonth);
        endOfMonth.setMonth(endOfMonth.getMonth() + 1);
        endOfMonth.setMilliseconds(endOfMonth.getMilliseconds() - 1);

        const expenses = await this.expenseRepo.find({
            where: {
                user_id: userId,
                group_id: groupId,
                created_at: Between(startOfMonth,endOfMonth),
            },
        });

        const spentThisMonth = expenses.reduce(
            (sum, exp) => sum + Number(exp.amount),
            0
        );

        const budgetCap = Number(group.monthly_budget_cap);
        const remaining = budgetCap - spentThisMonth;
        const percentageUsed = (spentThisMonth / budgetCap) * 100;
        const isOverBudget = spentThisMonth > budgetCap;

        return {
            groupId,
            hasBudget: true,
            budgetCap,
            spentThisMonth,
            remaining,
            percentageUsed,
            isOverBudget,
        };
    }

    private toGroupResponse(expenseGroup: ExpenseGroup): GroupResponse {
        return {
            id: expenseGroup.id,
            name: expenseGroup.name,
            userId: expenseGroup.user_id,
            description: expenseGroup.description,
            createdAt: expenseGroup.created_at,
        };
    }

    private async validateGroup(userId:number, groupId: number): Promise<ExpenseGroup> {
        const group = await this.expenseGroupRepo.findOne({
            where: { id: groupId, user_id: userId }
        });
        if (!group) {
            throw new NotFoundException("Group was not found for this user.");
        }

        return group;
    }

    private async validateUser(userId: number): Promise<void> {
        const user = await this.usersService.findById(userId);
        if(!user) throw new NotFoundException(`User not found`);
    }

    private toExpenseResponse(expense: Expense): ExpenseResponse {
    return {
        id: expense.id,
        amount: expense.amount,
        description: expense.description,
        groupId: expense.group_id,
        createdAt: expense.created_at
    };
}
}
