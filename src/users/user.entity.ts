import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ExpenseGroup } from 'src/expense-groups/expense-groups.entity.ts';
import { Expense } from 'src/expenses/expenses.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  password: string;

  @Column()
  email: string;

  @OneToMany(() => ExpenseGroup, group => group.user)
  expenseGroups: ExpenseGroup[];

  @OneToMany(() => Expense, expense => expense.user)
  expenses: Expense[];
}
