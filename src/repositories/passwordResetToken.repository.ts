import { Repository } from "typeorm"
import { AppDataSource } from "../config/database"
import { PasswordResetToken } from "@/entities/PasswordResetToken.entity"

export class PasswordResetTokenRepository {
    private repository: Repository<PasswordResetToken>

    constructor() {
        this.repository = AppDataSource.getRepository(PasswordResetToken)
    }

    async create(
        tokenData: Partial<PasswordResetToken>
    ): Promise<PasswordResetToken> {
        const token = this.repository.create(tokenData)
        return this.repository.save(token)
    }

    async findByToken(token: string): Promise<PasswordResetToken | null> {
        return this.repository.findOne({
            where: { token, isUsed: false },
            relations: ["user"]
        })
    }

    async markAsUsed(token: string): Promise<void> {
        await this.repository.update({ token }, { isUsed: true })
    }

    async deleteExpiredTokens(): Promise<void> {
        await this.repository.delete({
            expiresAt: new Date() // This will need proper date comparison
        })
    }
}
