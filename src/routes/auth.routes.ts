import { Router } from "express"
import { AuthController } from "../controllers/auth.controller"
import { validate } from "../middleware/validation.middleware"
import { authenticate } from "../middleware/auth.middleware"
import { authRateLimit } from "../middleware/rateLimit.middleware"
import {
    signupSchema,
    loginSchema,
    refreshTokenSchema,
    forgotPasswordSchema,
    resetPasswordSchema
} from "../validators/auth.validator"

export class AuthRoutes {
    public router: Router
    private authController: AuthController

    constructor() {
        this.router = Router()
        this.authController = new AuthController()
        this.initializeRoutes()
    }

    private initializeRoutes(): void {
        // Public routes
        this.router.post(
            "/signup",
            authRateLimit,
            validate(signupSchema),
            this.authController.signup
        )

        this.router.post(
            "/login",
            authRateLimit,
            validate(loginSchema),
            this.authController.login
        )

        this.router.post(
            "/refresh-token",
            authRateLimit,
            validate(refreshTokenSchema),
            this.authController.refreshToken
        )

        this.router.post(
            "/forgot-password",
            authRateLimit,
            validate(forgotPasswordSchema),
            this.authController.forgotPassword
        )

        this.router.post(
            "/reset-password",
            authRateLimit,
            validate(resetPasswordSchema),
            this.authController.resetPassword
        )

        // Protected routes
        this.router.post("/logout", authenticate, this.authController.logout)
        this.router.post(
            "/logout-all",
            authenticate,
            this.authController.logoutAll
        )
        this.router.get(
            "/profile",
            authenticate,
            this.authController.getProfile
        )
        this.router.get(
            "/sessions",
            authenticate,
            this.authController.getActiveSessions
        )
    }
}
