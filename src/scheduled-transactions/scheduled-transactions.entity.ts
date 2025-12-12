import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { TransactionEnum } from './dto/scheduled-transactions.types';
import { User } from 'src/users/user.entity';
import { ExpenseGroup } from 'src/expense-groups/expense-groups.entity.ts';
import { IncomeGroup } from 'src/income-groups/income-groups.entity';

@Entity('scheduled_transactions')
export class ScheduledTransaction {
  
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  amount: number;

  @Column()
  description: string;

  @Column({ type: "datetime" })
  date: Date;

  @Column({ type: 'enum', enum: TransactionEnum })
  type: TransactionEnum;

  @Column({ nullable: true })
  expense_group_id: number | null;

  @Column({ nullable: true })
  income_group_id: number | null;

  @Column({type: 'boolean', default:false})
  processed: boolean

  @ManyToOne(() => User, (user) => user.scheduledTransactions, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name:"user_id" })
  user: User;

  @ManyToOne(() => ExpenseGroup, (expenseGroup) => expenseGroup.scheduledTransactions, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name:"expense_group_id" })
  expense_group: ExpenseGroup | null;

  @ManyToOne(() => IncomeGroup, (incomeGroup) => incomeGroup.scheduledTransactions, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name:"income_group_id" })
  income_group: IncomeGroup | null;
}
