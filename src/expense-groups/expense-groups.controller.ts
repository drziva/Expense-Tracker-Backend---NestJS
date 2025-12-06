import { Body, Controller, Post } from '@nestjs/common';
import { UserId } from 'src/auth/user-id.decorator';
import { CreateGroupDto } from './dto/create-group.dto';
import { ExpenseGroupsService } from './expense-groups.service';

@Controller('expense-groups')
export class ExpenseGroupsController {
    constructor(
        private expenseGroupsService: ExpenseGroupsService
    ){}

    @Post('add')
    async addExpenseGroup(@UserId() userId: number,@Body() dto: CreateGroupDto){
        return this.expenseGroupsService.addGroup(userId,dto);
    }
}
