import express, { Application } from "express"
import cors from "cors"
import helmet from "helmet"
import { Routes } from "./routes"
import { logger } from "./config/logger"
import { config } from "./config/config"
import { generalRateLimit } from "./middlewares/rateLimit.middleware"
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware"

export class App {
    public app: Application
    private routes: Routes

    constructor() {
        this.app = express()
        this.routes = new Routes()
        this.initializeMiddlewares()
        this.initializeRoutes()
        this.initializeErrorHandling()
    }

    private initializeMiddlewares(): void {
        // Security middleware
        this.app.use(helmet())
        this.app.use(
            cors({
                origin:
                    config.nodeEnv === "production"
                        ? ["your-frontend-domain.com"]
                        : true,
                credentials: true
            })
        )

        // Rate limiting
        this.app.use(generalRateLimit)

        // Body parsing middleware
        this.app.use(express.json({ limit: "10mb" }))
        this.app.use(express.urlencoded({ extended: true, limit: "10mb" }))

        // Trust proxy for accurate IP addresses
        this.app.set("trust proxy", 1)

        // Request logging
        this.app.use((req, res, next) => {
            logger.info(`${req.method} ${req.url} - ${req.ip}`)
            next()
        })
    }

    private initializeRoutes(): void {
        this.app.use("/api/v1", this.routes.router)
    }

    private initializeErrorHandling(): void {
        this.app.use(notFoundHandler)
        this.app.use(errorHandler)
    }

    public listen(): void {
        this.app.listen(config.port, () => {
            logger.info(
                `Server running on port ${config.port} in ${config.nodeEnv} mode`
            )
        })
    }
}
