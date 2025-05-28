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

@Entity("refresh_tokens")
@Index(["token"], { unique: true })
@Index(["userId", "isRevoked"])
export class RefreshToken {
    @PrimaryGeneratedColumn("uuid")
    id: string

    @Column({ type: "text" })
    token: string

    @Column({ type: "uuid" })
    userId: string

    @Column({ type: "timestamp" })
    expiresAt: Date

    @Column({ type: "boolean", default: false })
    isRevoked: boolean

    @Column({ type: "varchar", length: 45, nullable: true })
    ipAddress: string | null

    @Column({ type: "text", nullable: true })
    userAgent: string | null

    @CreateDateColumn()
    createdAt: Date

    @ManyToOne(() => User, { onDelete: "CASCADE" })
    @JoinColumn({ name: "userId" })
    user: User
}
