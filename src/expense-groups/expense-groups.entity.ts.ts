import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn } from "typeorm";
import { User } from "src/users/user.entity";
import { Expense } from "src/expenses/expenses.entity";

@Entity("expense_groups")
export class ExpenseGroup {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "varchar", length: 100 })
    name: string;

    @Column({ type: "varchar", length: 100 })
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

    @CreateDateColumn()
    created_at: Date;

}