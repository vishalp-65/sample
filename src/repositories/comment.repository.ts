import { Repository } from "typeorm"
import { AppDataSource } from "../config/database"
import { Comment } from "../entities/Comment.entity"
import { NotFoundError } from "../utils/errors"

export class CommentRepository {
    private repository: Repository<Comment>

    constructor() {
        this.repository = AppDataSource.getRepository(Comment)
    }

    async create(commentData: Partial<Comment>): Promise<Comment> {
        const comment = this.repository.create(commentData)
        return this.repository.save(comment)
    }

    async findById(id: string): Promise<Comment | null> {
        return this.repository.findOne({
            where: { id, isActive: true },
            relations: ["author"]
        })
    }

    async findAll(
        page: number = 1,
        limit: number = 20
    ): Promise<{
        comments: Comment[]
        total: number
        page: number
        totalPages: number
    }> {
        const [comments, total] = await this.repository.findAndCount({
            where: { isActive: true },
            relations: ["author"],
            order: { createdAt: "DESC" },
            skip: (page - 1) * limit,
            take: limit
        })

        return {
            comments,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        }
    }

    async findByAuthor(authorId: string): Promise<Comment[]> {
        return this.repository.find({
            where: { authorId, isActive: true },
            relations: ["author"],
            order: { createdAt: "DESC" }
        })
    }

    async update(id: string, updateData: Partial<Comment>): Promise<Comment> {
        const comment = await this.findById(id)
        if (!comment) {
            throw new NotFoundError("Comment not found")
        }

        await this.repository.update(id, updateData)
        const updatedComment = await this.findById(id)
        if (!updatedComment) {
            throw new NotFoundError("Comment not found after update")
        }
        return updatedComment
    }

    async delete(id: string): Promise<void> {
        const comment = await this.findById(id)
        if (!comment) {
            throw new NotFoundError("Comment not found")
        }

        await this.repository.update(id, { isActive: false })
    }

    async hardDelete(id: string): Promise<void> {
        await this.repository.delete(id)
    }
}
