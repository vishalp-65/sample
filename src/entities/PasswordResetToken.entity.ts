import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    Index
} from "typeorm"
import { User } from "./User.entity"

@Entity("password_reset_tokens")
@Index(["token"], { unique: true })
@Index(["userId"])
export class PasswordResetToken {
    @PrimaryGeneratedColumn("uuid")
    id: string

    @Column({ type: "varchar", length: 255 })
    token: string

    @Column({ type: "uuid" })
    userId: string

    @Column({ type: "timestamp" })
    expiresAt: Date

    @Column({ type: "boolean", default: false })
    isUsed: boolean

    @CreateDateColumn()
    createdAt: Date

    @ManyToOne(() => User, { onDelete: "CASCADE" })
    @JoinColumn({ name: "userId" })
    user: User
}
