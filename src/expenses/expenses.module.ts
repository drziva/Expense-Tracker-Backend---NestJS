import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Expense } from './expenses.entity';
import { ExpensesController } from './expenses.controller';
import { ExpensesService } from './expenses.service';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Expense]),UsersModule],
  controllers: [ExpensesController],
  providers: [ExpensesService],
  exports: [TypeOrmModule] 
})
export class ExpensesModule {}
