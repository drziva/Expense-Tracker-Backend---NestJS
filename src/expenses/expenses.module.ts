import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Expense } from './expenses.entity';
import { ExpensesController } from './expenses.controller';
import { ExpensesService } from './expenses.service';
import { UsersModule } from '../users/users.module';
import { ExpenseGroup } from '../expense-groups/expense-groups.entity';
import { ExpenseGroupsModule } from '../expense-groups/expense-groups.module';
import { EmailModule } from '../email/email.module';
import { FirebaseModule } from '../firebase/firebase.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Expense, ExpenseGroup]),
    UsersModule,
    ExpenseGroupsModule,
    EmailModule,
    FirebaseModule
  ],
  controllers: [ExpensesController],
  providers: [ExpensesService],
  exports: [ExpensesService]
})
export class ExpensesModule {}
