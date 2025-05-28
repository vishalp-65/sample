import { CommentRepository } from "../repositories/comment.repository"
import { UserService } from "./user.service"
import { Comment } from "../entities/Comment.entity"
import {
    ValidationError,
    AuthorizationError,
    NotFoundError
} from "../utils/errors"
import { logger } from "../config/logger"
import { config } from "@/config"

export class CommentService {
    private commentRepository: CommentRepository
    private userService: UserService

    constructor() {
        this.commentRepository = new CommentRepository()
        this.userService = new UserService()
    }

    async createComment(content: string, authorId: string): Promise<Comment> {
        try {
            // Validate content
            if (!content || content.trim().length === 0) {
                throw new ValidationError("Comment content cannot be empty")
            }

            if (content.length > config.app.comments.maxLength) {
                throw new ValidationError(
                    `Comment cannot exceed ${config.app.comments.maxLength} characters`
                )
            }

            // Verify author exists and is active
            const author = await this.userService.findById(authorId)
            if (!author || !author.isActive) {
                throw new ValidationError("Invalid author")
            }

            // Check if user has write permission
            if (!author.hasPermission("write")) {
                throw new AuthorizationError(
                    "You don't have permission to create comments"
                )
            }

            const comment = await this.commentRepository.create({
                content: content.trim(),
                authorId
            })

            logger.info(`Comment created by user ${authorId}`)
            return comment
        } catch (error) {
            logger.error(`Failed to create comment:`, error)
            throw error
        }
    }

    async getComments(
        page: number = 1,
        limit: number = 20,
        userId?: string
    ): Promise<{
        comments: Comment[]
        total: number
        page: number
        totalPages: number
    }> {
        try {
            // If userId is provided, check read permission
            if (userId) {
                const user = await this.userService.findById(userId)
                if (!user || !user.hasPermission("read")) {
                    throw new AuthorizationError(
                        "You don't have permission to view comments"
                    )
                }
            }

            // Validate pagination params
            const validatedPage = Math.max(1, page)
            const validatedLimit = Math.min(
                Math.max(1, limit),
                config.app.pagination.maxLimit
            )

            return await this.commentRepository.findAll(
                validatedPage,
                validatedLimit
            )
        } catch (error) {
            logger.error(`Failed to get comments:`, error)
            throw error
        }
    }

    async getCommentById(id: string, userId?: string): Promise<Comment> {
        try {
            // If userId is provided, check read permission
            if (userId) {
                const user = await this.userService.findById(userId)
                if (!user || !user.hasPermission("read")) {
                    throw new AuthorizationError(
                        "You don't have permission to view comments"
                    )
                }
            }

            const comment = await this.commentRepository.findById(id)
            if (!comment) {
                throw new NotFoundError("Comment not found")
            }

            return comment
        } catch (error) {
            logger.error(`Failed to get comment ${id}:`, error)
            throw error
        }
    }

    async updateComment(
        id: string,
        content: string,
        userId: string
    ): Promise<Comment> {
        try {
            // Validate content
            if (!content || content.trim().length === 0) {
                throw new ValidationError("Comment content cannot be empty")
            }

            if (content.length > config.app.comments.maxLength) {
                throw new ValidationError(
                    `Comment cannot exceed ${config.app.comments.maxLength} characters`
                )
            }

            // Get the comment
            const comment = await this.commentRepository.findById(id)
            if (!comment) {
                throw new NotFoundError("Comment not found")
            }

            // Get user and check permissions
            const user = await this.userService.findById(userId)
            if (!user || !user.isActive) {
                throw new ValidationError("Invalid user")
            }

            // Check if user is the author or has write permission
            if (comment.authorId !== userId && !user.hasPermission("write")) {
                throw new AuthorizationError(
                    "You don't have permission to update this comment"
                )
            }

            const updatedComment = await this.commentRepository.update(id, {
                content: content.trim()
            })

            logger.info(`Comment ${id} updated by user ${userId}`)
            return updatedComment
        } catch (error) {
            logger.error(`Failed to update comment ${id}:`, error)
            throw error
        }
    }

    async deleteComment(id: string, userId: string): Promise<void> {
        try {
            // Get the comment
            const comment = await this.commentRepository.findById(id)
            if (!comment) {
                throw new NotFoundError("Comment not found")
            }

            // Get user and check permissions
            const user = await this.userService.findById(userId)
            if (!user || !user.isActive) {
                throw new ValidationError("Invalid user")
            }

            // Check if user has delete permission (global delete rights)
            if (!user.hasPermission("delete")) {
                throw new AuthorizationError(
                    "You don't have permission to delete comments"
                )
            }

            await this.commentRepository.delete(id)

            logger.info(`Comment ${id} deleted by user ${userId}`)
        } catch (error) {
            logger.error(`Failed to delete comment ${id}:`, error)
            throw error
        }
    }

    async getUserComments(authorId: string): Promise<Comment[]> {
        try {
            const author = await this.userService.findById(authorId)
            if (!author) {
                throw new NotFoundError("User not found")
            }

            return await this.commentRepository.findByAuthor(authorId)
        } catch (error) {
            logger.error(`Failed to get user comments for ${authorId}:`, error)
            throw error
        }
    }
}
