import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { ExpenseGroup } from './expense-groups.entity.ts';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';
import { CreateGroupDto } from './dto/create-group.dto';
import { GroupResponse } from './expense-groups.types';

@Injectable()
export class ExpenseGroupsService {
    constructor(
        @InjectRepository(ExpenseGroup)
        private expenseGroupRepo: Repository<ExpenseGroup>,
        private usersService: UsersService
    ){}

    async addGroup(userId: number, dto: CreateGroupDto){
        const user = await this.usersService.findById(userId);
        if(!user) throw new NotFoundException(`User not found`);

        const groupExists = await this.expenseGroupRepo.findOne({where:{name:dto.name,user_id:userId}});
        if(groupExists) throw new ConflictException("Group with this name already exists");

       try { 
        const group = this.expenseGroupRepo.create({
            user_id: userId,
            name:dto.name,
            description:dto.description
        })
        await this.expenseGroupRepo.save(group);

        return this.toGroupResponse(group);
        } catch(error) {
            throw new InternalServerErrorException("Failed to create expense group");
        }
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
}
