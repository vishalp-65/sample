import { Request, Response, NextFunction } from "express"
import { JwtUtil } from "../utils/jwt"
import { AuthenticationError } from "../utils/errors"
import { UserService } from "../services/user.service"

export const authenticate = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new AuthenticationError("Access token is required")
        }

        const token = authHeader.substring(7)
        const payload = JwtUtil.verifyAccessToken(token)

        // Verify user still exists and is active
        const userService = new UserService()
        const user = await userService.findById(payload.userId)

        if (!user || !user.isActive) {
            throw new AuthenticationError("User not found or inactive")
        }

        req.user = {
            id: user.id,
            email: user.email,
            name: user.name
        }

        next()
    } catch (error) {
        next(error)
    }
}
