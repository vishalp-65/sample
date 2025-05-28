import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    Index
} from "typeorm"

@Entity("users")
@Index(["email"], { unique: true })
export class User {
    @PrimaryGeneratedColumn("uuid")
    id: string

    @Column({ type: "varchar", length: 100 })
    name: string

    @Column({ type: "varchar", length: 255, unique: true })
    email: string

    @Column({ type: "varchar", length: 255 })
    password: string

    @Column({ type: "boolean", default: true })
    isActive: boolean

    @Column({ type: "timestamp", nullable: true })
    lastLoginAt: Date | null

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date

    // Method to exclude password from JSON responses
    toJSON() {
        const { password, ...userWithoutPassword } = this
        return userWithoutPassword
    }
}
