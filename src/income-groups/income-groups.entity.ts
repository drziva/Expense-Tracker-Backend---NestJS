import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn } from "typeorm";
import { User } from "src/users/user.entity";
import { Income } from "src/incomes/incomes.entity";
import { ScheduledTransaction } from "src/scheduled-transactions/scheduled-transactions.entity";

@Entity("income_groups")
export class IncomeGroup {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "varchar", length: 100 })
    name: string;

    @Column({ type: "text" })
    description: string;
    
    @Column()
    user_id: number

    @ManyToOne(() => User, user => user.incomeGroups, {
    onDelete: "CASCADE",
    nullable: false,
    })
    @JoinColumn({ name: "user_id" })
    user: User;

    @OneToMany(() => Income, income => income.group)
    incomes: Income[];
    
    @OneToMany(() => ScheduledTransaction, schedTransaction => schedTransaction.income_group)
    scheduledTransactions: ScheduledTransaction[];

    @CreateDateColumn()
    created_at: Date;
}
