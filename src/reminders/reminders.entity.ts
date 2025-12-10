import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { User } from 'src/users/user.entity';
import { ReminderEnum } from './reminders-types';

@Entity('reminders')
export class Reminder {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: true })
  weekday: number | null;

  @Column({ type: 'int', nullable: true })
  day_of_month: number | null;

  @Column({ 
    type: 'enum', 
    enum: ReminderEnum 
  })
  type: ReminderEnum;

  @Column({ default: true })
  active: boolean;

  @Column()
  user_id:number

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => User, (user) => user.reminders, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({name:"user_id"})
  user: User;

}
