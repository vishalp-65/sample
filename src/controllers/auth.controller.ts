import { Request, Response, NextFunction } from "express"
import { AuthService } from "../services/auth.service"
import httpStatus from "http-status"
import { logger } from "../config/logger"
import { UserService } from "../services/user.service"

export class AuthController {
    private authService: AuthService
    private userService: UserService

    constructor() {
        this.authService = new AuthService()
        this.userService = new UserService()
    }

    signup = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { name, email, password } = req.body
            const clientInfo = {
                ipAddress: req.ip,
                userAgent: req.get("User-Agent")
            }

            const result = await this.authService.signup(
                { name, email, password },
                clientInfo
            )

            res.status(httpStatus.CREATED).json({
                success: true,
                message: "User registered successfully",
                data: {
                    user: result.user,
                    tokens: result.tokens
                }
            })
        } catch (error) {
            next(error)
        }
    }

    login = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email, password } = req.body
            const clientInfo = {
                ipAddress: req.ip,
                userAgent: req.get("User-Agent")
            }

            const result = await this.authService.login(
                email,
                password,
                clientInfo
            )

            res.status(httpStatus.OK).json({
                success: true,
                message: "Login successful",
                data: {
                    user: result.user,
                    tokens: result.tokens
                }
            })
        } catch (error) {
            next(error)
        }
    }

    refreshToken = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { refreshToken } = req.body
            const tokens = await this.authService.refreshTokens(refreshToken)

            res.status(httpStatus.OK).json({
                success: true,
                message: "Tokens refreshed successfully",
                data: { tokens }
            })
        } catch (error) {
            next(error)
        }
    }

    logout = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { refreshToken } = req.body
            await this.authService.logout(refreshToken)

            res.status(httpStatus.OK).json({
                success: true,
                message: "Logged out successfully"
            })
        } catch (error) {
            next(error)
        }
    }

    logoutAll = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user!.id
            await this.authService.logoutAll(userId)

            res.status(httpStatus.OK).json({
                success: true,
                message: "All sessions terminated successfully"
            })
        } catch (error) {
            next(error)
        }
    }

    forgotPassword = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const { email } = req.body
            const result = await this.authService.forgotPassword(email)

            res.status(httpStatus.OK).json({
                success: true,
                message: result.message,
                data: { token: result.token } // In production, don't return the token
            })
        } catch (error) {
            next(error)
        }
    }

    resetPassword = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { token, password } = req.body
            await this.authService.resetPassword(token, password)

            res.status(httpStatus.OK).json({
                success: true,
                message: "Password reset successfully"
            })
        } catch (error) {
            next(error)
        }
    }

    getProfile = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user!.id
            const user = await this.userService.findById(userId)

            res.status(httpStatus.OK).json({
                success: true,
                message: "Profile retrieved successfully",
                data: { user }
            })
        } catch (error) {
            next(error)
        }
    }

    getActiveSessions = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const userId = req.user!.id
            const sessions = await this.authService.getUserActiveSessions(
                userId
            )

            res.status(httpStatus.OK).json({
                success: true,
                message: "Active sessions retrieved successfully",
                data: { sessions }
            })
        } catch (error) {
            next(error)
        }
    }
}
