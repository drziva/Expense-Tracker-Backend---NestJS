import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn } from "typeorm";
import { User } from "../users/user.entity";
import { Expense } from "../expenses/expenses.entity";
import { ScheduledTransaction } from "../scheduled-transactions/scheduled-transactions.entity";
import { scheduled } from "rxjs";

@Entity("expense_groups")
export class ExpenseGroup {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "varchar", length: 100 })
    name: string;

    @Column({ type: "text" })
    description: string;
    
    @Column()
    user_id: number

    @ManyToOne(() => User, user => user.expenseGroups, {
    onDelete: "CASCADE",
    nullable: false,
    })
    @JoinColumn({ name: "user_id" })
    user: User;

    @OneToMany(() => Expense, expense => expense.group)
    expenses: Expense[];

    @OneToMany(() => ScheduledTransaction, schedTransaction => schedTransaction.expense_group)
    scheduledTransactions: ScheduledTransaction[];

    @Column({ type: 'datetime', nullable: true })
    last_budget_alert: Date | null;

    @CreateDateColumn()
    created_at: Date;

    @Column({ type: 'decimal', precision: 14, scale: 2, nullable: true })
    monthly_budget_cap: number | null;
}
