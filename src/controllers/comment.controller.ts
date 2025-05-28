import { Request, Response, NextFunction } from "express"
import { CommentService } from "../services/comment.service"
import httpStatus from "http-status"

export class CommentController {
    private commentService: CommentService

    constructor() {
        this.commentService = new CommentService()
    }

    createComment = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { content } = req.body
            const authorId = req.user!.id

            const comment = await this.commentService.createComment(
                content,
                authorId
            )

            res.status(httpStatus.CREATED).json({
                success: true,
                message: "Comment created successfully",
                data: { comment }
            })
        } catch (error) {
            next(error)
        }
    }

    getComments = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const page = parseInt(req.query.page as string) || 1
            const limit = parseInt(req.query.limit as string) || 20
            const userId = req.user?.id

            const result = await this.commentService.getComments(
                page,
                limit,
                userId
            )

            res.status(httpStatus.OK).json({
                success: true,
                message: "Comments retrieved successfully",
                data: result
            })
        } catch (error) {
            next(error)
        }
    }

    getComment = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params
            const userId = req.user?.id

            const comment = await this.commentService.getCommentById(id, userId)

            res.status(httpStatus.OK).json({
                success: true,
                message: "Comment retrieved successfully",
                data: { comment }
            })
        } catch (error) {
            next(error)
        }
    }

    updateComment = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params
            const { content } = req.body
            const userId = req.user!.id

            const comment = await this.commentService.updateComment(
                id,
                content,
                userId
            )

            res.status(httpStatus.OK).json({
                success: true,
                message: "Comment updated successfully",
                data: { comment }
            })
        } catch (error) {
            next(error)
        }
    }

    deleteComment = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params
            const userId = req.user!.id

            await this.commentService.deleteComment(id, userId)

            res.status(httpStatus.OK).json({
                success: true,
                message: "Comment deleted successfully"
            })
        } catch (error) {
            next(error)
        }
    }

    getUserComments = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const { userId } = req.params

            const comments = await this.commentService.getUserComments(userId)

            res.status(httpStatus.OK).json({
                success: true,
                message: "User comments retrieved successfully",
                data: { comments }
            })
        } catch (error) {
            next(error)
        }
    }
}
