import { z } from "zod"

export const signupSchema = z.object({
    body: z.object({
        name: z
            .string()
            .min(2, "Name must be at least 2 characters long")
            .max(100, "Name must not exceed 100 characters")
            .regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces"),
        email: z
            .string()
            .email("Invalid email format")
            .max(255, "Email must not exceed 255 characters")
            .toLowerCase(),
        password: z
            .string()
            .min(8, "Password must be at least 8 characters long")
            .max(128, "Password must not exceed 128 characters")
            .regex(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character"
            )
    })
})

export const loginSchema = z.object({
    body: z.object({
        email: z.string().email("Invalid email format").toLowerCase(),
        password: z.string().min(1, "Password is required")
    })
})

export const refreshTokenSchema = z.object({
    body: z.object({
        refreshToken: z.string().min(1, "Refresh token is required")
    })
})

export const forgotPasswordSchema = z.object({
    body: z.object({
        email: z.string().email("Invalid email format").toLowerCase()
    })
})

export const resetPasswordSchema = z.object({
    body: z.object({
        token: z.string().min(1, "Reset token is required"),
        password: z
            .string()
            .min(8, "Password must be at least 8 characters long")
            .max(128, "Password must not exceed 128 characters")
            .regex(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character"
            )
    })
})
