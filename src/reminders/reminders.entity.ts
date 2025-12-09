import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { User } from 'src/users/user.entity';

@Entity('reminders')
export class Reminder {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ 
    type: 'enum', 
    enum: ['weekly', 'monthly'] 
  })
  type: 'weekly' | 'monthly';

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
