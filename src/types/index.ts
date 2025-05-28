export interface JwtPayload {
    userId: string
    email: string
    iat?: number
    exp?: number
}

export interface AuthTokens {
    accessToken: string
    refreshToken: string
}

export interface RequestUser {
    id: string
    email: string
    name: string
}

declare global {
    namespace Express {
        interface Request {
            user?: RequestUser
        }
    }
}
