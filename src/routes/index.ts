import { Router } from "express"
import { AuthRoutes } from "./auth.routes"

export class Routes {
    public router: Router

    constructor() {
        this.router = Router()
        this.initializeRoutes()
    }

    private initializeRoutes(): void {
        const authRoutes = new AuthRoutes()

        this.router.use("/auth", authRoutes.router)

        // Health check endpoint
        this.router.get("/health", (req, res) => {
            res.status(200).json({
                success: true,
                message: "Server is running",
                timestamp: new Date().toISOString()
            })
        })
    }
}
