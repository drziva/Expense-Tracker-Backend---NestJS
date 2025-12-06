import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExpenseGroup } from './expense-groups.entity.ts';
import { ExpenseGroupsController } from './expense-groups.controller';
import { ExpenseGroupsService } from './expense-groups.service';
import { UsersModule } from 'src/users/users.module';

@Module({
    imports:[
        TypeOrmModule.forFeature([ExpenseGroup]),
        UsersModule
    ],
    controllers:[ExpenseGroupsController],
    providers:[ExpenseGroupsService],
    exports:[ExpenseGroupsService]
})

export class ExpenseGroupsModule {}