import { DataSource } from "typeorm"
import { User } from "../entities/User.entity"
import { RefreshToken } from "@/entities/RefershToken.entity"
import { config } from "./config"

export const AppDataSource = new DataSource({
    type: "mysql",
    host: config.database.host,
    port: config.database.port,
    username: config.database.username,
    password: config.database.password,
    database: config.database.database,
    synchronize: config.nodeEnv === "development", // Only in development
    logging: config.nodeEnv === "development",
    entities: [User, RefreshToken],
    migrations: ["src/migrations/*.ts"],
    subscribers: ["src/subscribers/*.ts"],
    charset: "utf8mb4",
    timezone: "Z",
    extra: {
        connectionLimit: 10
    }
})
