import { User } from "../users/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity("firebase_tokens")
export class FirebaseToken {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    userId: number;

    @Column({ unique: true })
    token: string;

    @CreateDateColumn()
    createdAt: Date;

    @ManyToOne(() => User, user => user.incomeGroups, {
        onDelete: "CASCADE",
        nullable: false,
    })
    @JoinColumn({ name: "userId" })
    user: User;
}