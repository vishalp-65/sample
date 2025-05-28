import { Request, Response, NextFunction } from "express"
import { UserService } from "../services/user.service"
import httpStatus from "http-status"

export class UserController {
    private userService: UserService

    constructor() {
        this.userService = new UserService()
    }

    getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const users = await this.userService.getAllUsers()

            res.status(httpStatus.OK).json({
                success: true,
                message: "Users retrieved successfully",
                data: { users }
            })
        } catch (error) {
            next(error)
        }
    }

    getUserById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params
            const user = await this.userService.findById(id)

            if (!user) {
                return res.status(httpStatus.NOT_FOUND).json({
                    success: false,
                    message: "User not found"
                })
            }

            res.status(httpStatus.OK).json({
                success: true,
                message: "User retrieved successfully",
                data: { user }
            })
        } catch (error) {
            next(error)
        }
    }

    // updateUserPermissions = async (req: Request, res: Response, next: NextFunction) => {
    //     try {
    //         const { id } = req.params
    //         const { permissions } = req.body

    //         const user = await this.userService.updateUserPermissions
}
