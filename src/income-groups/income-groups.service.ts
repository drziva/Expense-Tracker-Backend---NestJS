import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { IncomeGroup } from './income-groups.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from 'src/users/users.service';
import { Like, Repository } from 'typeorm';
import { CreateIncomeGroupDto } from './dto/create-income-group.dto';
import { DeleteIncomeGroupResponse, GetIncomeGroupResponse, IncomeGroupResponse } from './dto/income-groups-responses.dto';
import { UpdateIncomeGroupDto } from './dto/update-income-group.dto';
import { Income } from 'src/incomes/incomes.entity';
import { IncomeResponse } from 'src/incomes/dto/incomes-responses.dto';
import { IncomeGroupQueryOptions } from './income-groups.types';

@Injectable()
export class IncomeGroupsService {
    constructor(
        @InjectRepository(IncomeGroup)
        private incomeGroupRepo: Repository<IncomeGroup>,
        @InjectRepository(Income)
        private incomeRepo: Repository<Income>,
    ) {}

    async getGroupById(userId: number, groupId: number): Promise<IncomeGroupResponse> {
        const group = await this.validateGroup(userId, groupId);
        return this.toGroupResponse(group);
    }

    async getIncomesForGroup(userId: number, groupId: number): Promise<IncomeResponse[]> {
        await this.validateGroup(userId,groupId);

        const expenses = await this.incomeRepo.find({
            where:{user_id: userId, group_id: groupId}
        });
        return expenses.map((exp)=> this.toIncomeResponse(exp));
    }

    async getFilteredGroups(
        userId: number,
        options: IncomeGroupQueryOptions
    ): Promise<GetIncomeGroupResponse> {
        const { search, sort, page = 1, limit = 20 } = options;

        const where: any = { user_id: userId };

        // Search
        if (search) {
        where.name = Like(`%${search}%`);
        }
        
        // Sorting
        let order: any = { created_at: 'DESC' };

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
        const [groups, total] = await this.incomeGroupRepo.findAndCount({
        where,
        order,
        skip,
        take: limit,
        });

        return {
        data: groups.map(g => this.toGroupResponse(g)),
        page,
        limit,
        totalItems: total,
        totalPages: Math.ceil(total / limit),
        };
    }

    async createGroup(userId: number, dto: CreateIncomeGroupDto): Promise<IncomeGroupResponse> {
        try {
        const exists = await this.incomeGroupRepo.findOne({
            where: { name: dto.name, user_id: userId },
        });

        if (exists) {
        throw new ConflictException('Group with this name already exists');
        }

        const group = this.incomeGroupRepo.create({
            user_id: userId,
            name: dto.name,
            description: dto.description,
        });

        await this.incomeGroupRepo.save(group);

        return this.toGroupResponse(group);
        } catch(error) {
            console.error("Error creating income group: ", error);
            throw error;
        }
    }

    async updateGroup(
        userId: number,
        groupId: number,
        dto: UpdateIncomeGroupDto
    ): Promise<IncomeGroupResponse> {
        const group = await this.validateGroup(userId, groupId);

        if (dto.name !== group.name) {
        const conflict = await this.incomeGroupRepo.findOne({
            where: { name: dto.name, user_id: userId },
        });

        if (conflict) {
            throw new ConflictException('Group with this name already exists');
        }

        group.name = dto.name;
        }

        group.description = dto.description;

        try {
        const updated = await this.incomeGroupRepo.save(group);
        return this.toGroupResponse(updated);
        } catch (error) {
        console.error("Error updating income group: ",error);
        throw error;
        }
    }

    async deleteGroup(userId: number, groupId: number): Promise<DeleteIncomeGroupResponse> {
        try {        
        await this.validateGroup(userId, groupId);

        await this.incomeGroupRepo.delete({
        id: groupId,
        user_id: userId,
        });

        return { success: true, id: groupId };
        } catch(error) {
            console.error("Error deleting income group: ",error);
            throw error;
        }
    }

    private toGroupResponse(group: IncomeGroup): IncomeGroupResponse {
        return {
        id: group.id,
        userId: group.user_id,
        name: group.name,
        description: group.description,
        createdAt: group.created_at,
        };
    }

    async getGroupsForUser(userId: number): Promise<Record<number,string>> {
        const groups = await this.incomeGroupRepo.find({where:{user_id:userId}})
        const groupNames: Record<number,string> = {};
        for(const group of groups){
            groupNames[group.id] = group.name ;
        }

        return groupNames;
    }

    private async validateGroup(userId: number, groupId: number): Promise<IncomeGroup> {
        const group = await this.incomeGroupRepo.findOne({
        where: { id: groupId, user_id: userId },
        });

        if (!group) {
        throw new NotFoundException('Income group was not found for this user.');
        }

        return group;
    }

    private toIncomeResponse(income: Income): IncomeResponse {
        return {
            id: income.id,
            amount: Number(income.amount),
            description: income.description,
            createdAt: income.created_at,
            groupId: income.group_id
        };
    }

}
