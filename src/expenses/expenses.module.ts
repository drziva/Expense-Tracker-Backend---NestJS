import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Expense } from './expenses.entity';
import { ExpensesController } from './expenses.controller';
import { ExpensesService } from './expenses.service';
import { UsersModule } from 'src/users/users.module';
import { ExpenseGroup } from 'src/expense-groups/expense-groups.entity.ts';
import { ExpenseGroupsModule } from 'src/expense-groups/expense-groups.module';
import { EmailModule } from 'src/email/email.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Expense, ExpenseGroup]),
    UsersModule,
    ExpenseGroupsModule,
    UsersModule,
    EmailModule
  ],
  
  controllers: [ExpensesController],
  providers: [ExpensesService],
  exports: [ExpensesService]
})
export class ExpensesModule {}
