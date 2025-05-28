import { Repository } from "typeorm"
import { AppDataSource } from "../config/database"
import { User } from "../entities/User.entity"
import { NotFoundError, ValidationError } from "../utils/errors"
import { PasswordUtil } from "../utils/password"

export class UserRepository {
    private repository: Repository<User>

    constructor() {
        this.repository = AppDataSource.getRepository(User)
    }

    async create(userData: Partial<User>): Promise<User> {
        const user = this.repository.create(userData)
        return this.repository.save(user)
    }

    async findById(id: string): Promise<User | null> {
        return this.repository.findOne({ where: { id } })
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.repository.findOne({ where: { email } })
    }

    async findAll(): Promise<User[]> {
        return this.repository.find({ where: { isActive: true } })
    }

    async validateCredentials(email: string, password: string): Promise<User> {
        const user = await this.findByEmail(email)
        if (!user) {
            throw new NotFoundError("User not found")
        }

        if (!user.isActive) {
            throw new ValidationError("User account is deactivated")
        }

        const isPasswordValid = await PasswordUtil.compare(
            password,
            user.password
        )
        if (!isPasswordValid) {
            throw new ValidationError("Invalid credentials")
        }

        return user
    }

    async updateLastLogin(id: string): Promise<void> {
        await this.repository.update(id, { lastLoginAt: new Date() })
    }

    async updatePassword(id: string, newPassword: string): Promise<void> {
        if (!PasswordUtil.validate(newPassword)) {
            throw new ValidationError(
                "Password does not meet security requirements"
            )
        }

        const hashedPassword = await PasswordUtil.hash(newPassword)
        await this.repository.update(id, { password: hashedPassword })
    }

    async deactivateUser(id: string): Promise<void> {
        const user = await this.findById(id)
        if (!user) {
            throw new NotFoundError("User not found")
        }

        await this.repository.update(id, { isActive: false })
    }

    async updatePermissions(
        userId: string,
        permissions: string[]
    ): Promise<User> {
        await this.repository.update(userId, {
            permissions: permissions.join(",")
        })
        const user = await this.findById(userId)
        if (!user) {
            throw new NotFoundError("User not found after update")
        }
        return user
    }
}
