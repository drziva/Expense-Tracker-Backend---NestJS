import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { ExpenseGroup } from './expense-groups.entity.ts';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from 'src/users/users.service';
import { Between, LessThanOrEqual, Like, MoreThanOrEqual, Repository } from 'typeorm';
import { CreateGroupDto } from './dto/create-group.dto';
import { GroupQueryOptions } from './expense-groups.types';
import { UpdateGroupDto } from './dto/update-group.dto';
import { Expense } from 'src/expenses/expenses.entity';
import { ExpenseResponse } from 'src/expenses/dto/expenses-responses.dto.js';
import { BudgetStatus, DeleteGroupResponse, ExpenseGroupResponse, GetGroupResponse } from './dto/expense-groups-responses.dto.js';

@Injectable()
export class ExpenseGroupsService {
    constructor(
        @InjectRepository(ExpenseGroup)
        private readonly expenseGroupRepo: Repository<ExpenseGroup>,
        @InjectRepository(Expense)
        private readonly expenseRepo: Repository<Expense>
    ){}

    async getGroupById(userId: number, groupId: number): Promise<ExpenseGroupResponse>{
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
        const where: any = { user_id: userId };
        const { search, sort, page = 1, limit = 20, from, to } = options;
        // Filtering — name search
        if (search) {
        where.name = Like(`%${search}%`);
        }
        if(from && to){
            where.created_at = Between(from, to);
        }else if(from){
            where.created_at = MoreThanOrEqual(from);
        }else if(to){
            where.created_at = LessThanOrEqual(to);
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


    async createGroup(userId: number, dto: CreateGroupDto): Promise<ExpenseGroupResponse>{
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
            console.error("Error creating expense group: ", error)
            throw error;
        }
    }       

    async updateGroup(userId:number, groupId:number, dto: UpdateGroupDto): Promise<ExpenseGroupResponse> {
        const group = await this.validateGroup(userId, groupId);
        if (dto.name !== group.name) {
            const conflict = await this.expenseGroupRepo.findOne({
                where: { name: dto.name, user_id: userId }
            });
            if (conflict) {
                throw new ConflictException("Group with this name already exists");
            }
            group.name = dto.name;
        }

        group.description = dto.description;
        if (dto.budgetCap !== undefined) {
            group.monthly_budget_cap = dto.budgetCap;
        }
        try {
            const updatedGroup = await this.expenseGroupRepo.save(group);
            return this.toGroupResponse(updatedGroup);
        } catch (error) {
            console.error("Error updating expense group: ", error);
            throw error;
        }
    }

    async deleteGroup(userId: number, groupId: number): Promise<DeleteGroupResponse> {
        await this.validateGroup(userId,groupId);
        try {
            await this.expenseGroupRepo.delete({
                id: groupId,
                user_id: userId
            });
            return { success: true, id: groupId };

        } catch (error) {
            console.error("Error deleting expense group: ", error);
            throw error;
        }
    } 

    async getBudgetStatus(userId: number, groupId: number): Promise<BudgetStatus> {
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

    async getGroupsForUser(userId: number): Promise<Record<number,string>> {
        const groups = await this.expenseGroupRepo.find({where:{user_id:userId}})
        const groupNames: Record<number,string> = {};
        for(const group of groups){
            groupNames[group.id] = group.name ;
        }

        return groupNames;
    }

    async findAll(userId: number): Promise<ExpenseGroup[]> {
        return await this.expenseGroupRepo.find({where:{user_id: userId}});
    }

    async findById(userId:number, id: number): Promise<ExpenseGroup> {
        const group = await this.expenseGroupRepo.findOne({ where: { id, user_id: userId } });
        if (!group) throw new NotFoundException('Expense group not found');
        return group;
    }

    private toGroupResponse(expenseGroup: ExpenseGroup): ExpenseGroupResponse {
        return {
            id: expenseGroup.id,
            name: expenseGroup.name,
            userId: expenseGroup.user_id,
            description: expenseGroup.description,
            createdAt: expenseGroup.created_at,
            budgetCap: expenseGroup.monthly_budget_cap ?? undefined,
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
