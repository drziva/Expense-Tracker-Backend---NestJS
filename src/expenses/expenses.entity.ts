import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from "typeorm";

import { User } from "../users/user.entity";
import { ExpenseGroup } from "../expense-groups/expense-groups.entity";

@Entity("expenses")
export class Expense {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "text" })
  description: string;

  @Column({ type: "decimal", precision: 14, scale: 2 })
  amount: number;

  @Column()
  user_id: number;

  @Column()
  group_id: number;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => User, user => user.expenses, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user: User;

  @ManyToOne(() => ExpenseGroup, group => group.expenses, { onDelete: "CASCADE" })
  @JoinColumn({ name: "group_id" })
  group: ExpenseGroup;
  
}
