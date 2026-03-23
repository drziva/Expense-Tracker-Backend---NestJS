import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ExpenseGroup } from 'src/expense-groups/expense-groups.entity.ts';
import { Expense } from 'src/expenses/expenses.entity';
import { Income } from 'src/incomes/incomes.entity';
import { IncomeGroup } from 'src/income-groups/income-groups.entity';
import { Reminder } from 'src/reminders/reminders.entity';
import { ScheduledTransaction } from 'src/scheduled-transactions/scheduled-transactions.entity';
import { FirebaseToken } from 'src/firebase/firebase.entity';
import { RefreshToken } from 'src/auth/entities/refresh-token.entity';
import type { AuthProviders } from './users.types';

@Entity("user")
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  password: string;

  @Column()
  email: string;

  @Column({ type: 'boolean', default: false })
  budget_cap_notifications: boolean

  @Column({ type: 'boolean', default: false })
  premium: boolean;

  @Column({ nullable: true })
  provider: AuthProviders

  @Column({ nullable: true })
  providerId: string

  @Column({ default: false })
  is_welcomed: boolean;

  @OneToMany(() => ExpenseGroup, group => group.user)
  expenseGroups: ExpenseGroup[];

  @OneToMany(() => Expense, expense => expense.user)
  expenses: Expense[];

  @OneToMany(() => IncomeGroup, group => group.user)
  incomeGroups: IncomeGroup[];

  @OneToMany(() => Income, income => income.user)
  incomes: Income[];

  @OneToMany(() => Reminder, reminder => reminder.user)
  reminders: Reminder[];

  @OneToMany( ()=> ScheduledTransaction, schedTransaction => schedTransaction.user)
  scheduledTransactions: ScheduledTransaction

  @OneToMany(() => FirebaseToken, firebaseToken => firebaseToken.user)
  firebaseTokens: FirebaseToken[]

  @OneToMany(() => RefreshToken, refreshToken => refreshToken.user)
  refreshTokens: RefreshToken[]
}
