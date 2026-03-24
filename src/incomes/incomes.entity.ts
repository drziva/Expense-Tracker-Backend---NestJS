import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from "typeorm";

import { User } from "../users/user.entity";
import { IncomeGroup } from "../income-groups/income-groups.entity";

@Entity("incomes")
export class Income {
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

  @ManyToOne(() => User, user => user.incomes, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user: User;

  @ManyToOne(() => IncomeGroup, group => group.incomes, { onDelete: "CASCADE" })
  @JoinColumn({ name: "group_id" })
  group: IncomeGroup;

}
