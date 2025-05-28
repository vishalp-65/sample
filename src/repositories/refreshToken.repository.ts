import { Repository } from "typeorm"
import { AppDataSource } from "../config/database"
import { RefreshToken } from "../entities/RefreshToken.entity"
import { NotFoundError } from "../utils/errors"

export class RefreshTokenRepository {
    private repository: Repository<RefreshToken>

    constructor() {
        this.repository = AppDataSource.getRepository(RefreshToken)
    }

    async create(tokenData: Partial<RefreshToken>): Promise<RefreshToken> {
        const token = this.repository.create(tokenData)
        return this.repository.save(token)
    }

    async findByToken(token: string): Promise<RefreshToken | null> {
        return this.repository.findOne({
            where: { token },
            relations: ["user"]
        })
    }

    async findActiveTokensByUser(userId: string): Promise<RefreshToken[]> {
        return this.repository.find({
            where: {
                userId,
                isRevoked: false,
                expiresAt: new Date() // This will need to be adjusted for proper date comparison
            },
            order: { createdAt: "DESC" }
        })
    }

    async revokeToken(token: string): Promise<void> {
        await this.repository.update({ token }, { isRevoked: true })
    }

    async revokeAllUserTokens(userId: string): Promise<void> {
        await this.repository.update(
            { userId, isRevoked: false },
            { isRevoked: true }
        )
    }

    async cleanExpiredTokens(): Promise<void> {
        await this.repository.delete({
            expiresAt: new Date() // This will need proper date comparison
        })
    }
}
