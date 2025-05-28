import { UserRepository } from "../repositories/user.repository"
import { User } from "../entities/User.entity"
import { ConflictError, ValidationError, NotFoundError } from "../utils/errors"
import { PasswordUtil } from "../utils/password"
import { logger } from "../config/logger"

export class UserService {
    private userRepository: UserRepository

    constructor() {
        this.userRepository = new UserRepository()
    }

    async createUser(userData: {
        name: string
        email: string
        password: string
    }): Promise<User> {
        try {
            // Check if user already exists
            const existingUser = await this.userRepository.findByEmail(
                userData.email
            )
            if (existingUser) {
                throw new ConflictError("User with this email already exists")
            }

            // Validate password
            if (!PasswordUtil.validate(userData.password)) {
                throw new ValidationError(
                    "Password does not meet security requirements"
                )
            }

            // Hash password
            const hashedPassword = await PasswordUtil.hash(userData.password)

            // Create user
            const user = await this.userRepository.create({
                ...userData,
                password: hashedPassword
            })

            logger.info(`User created successfully: ${user.email}`)
            return user
        } catch (error) {
            logger.error(`Failed to create user ${userData.email}:`, error)
            throw error
        }
    }

    async findById(id: string): Promise<User | null> {
        return this.userRepository.findById(id)
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.userRepository.findByEmail(email)
    }

    async validateCredentials(email: string, password: string): Promise<User> {
        return this.userRepository.validateCredentials(email, password)
    }

    async updateLastLogin(id: string): Promise<void> {
        await this.userRepository.updateLastLogin(id)
    }

    async updatePassword(id: string, newPassword: string): Promise<void> {
        await this.userRepository.updatePassword(id, newPassword)
    }

    async deactivateUser(id: string): Promise<void> {
        await this.userRepository.deactivateUser(id)
    }

    async getAllUsers(): Promise<User[]> {
        return this.userRepository.findAll()
    }

    async updateUserPermissions(
        userId: string,
        permissions: string[]
    ): Promise<User> {
        const user = await this.userRepository.findById(userId)
        if (!user) {
            throw new NotFoundError("User not found")
        }

        return this.userRepository.updatePermissions(userId, permissions)
    }
}
