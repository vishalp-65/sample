import bcrypt from "bcryptjs"

export class PasswordUtil {
    private static readonly SALT_ROUNDS = 12

    static async hash(password: string): Promise<string> {
        return bcrypt.hash(password, this.SALT_ROUNDS)
    }

    static async compare(
        password: string,
        hashedPassword: string
    ): Promise<boolean> {
        return bcrypt.compare(password, hashedPassword)
    }

    static validate(password: string): boolean {
        // Password must be at least 8 characters long and contain:
        // - At least one lowercase letter
        // - At least one uppercase letter
        // - At least one number
        // - At least one special character
        const passwordRegex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
        return passwordRegex.test(password)
    }
}
