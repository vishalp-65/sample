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

    @Column({ type: "text", nullable: true })
    permissions: string | null

    @Column({ type: "boolean", default: true })
    isActive: boolean

    @Column({ type: "timestamp", nullable: true })
    lastLoginAt: Date | null

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date

    // Helper method to get permissions as array
    getPermissions(): string[] {
        return this.permissions ? this.permissions.split(",") : []
    }

    // Helper method to check if user has specific permission
    hasPermission(permission: string): boolean {
        return this.getPermissions().includes(permission)
    }

    // Method to exclude password from JSON responses
    toJSON() {
        const { password, ...userWithoutPassword } = this
        return {
            ...userWithoutPassword,
            permissions: this.getPermissions()
        }
    }
}
