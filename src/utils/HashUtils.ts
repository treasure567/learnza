import bcrypt from 'bcrypt';

export class HashUtils {
    static async hash(password: string): Promise<string> {
        const salt = await bcrypt.genSalt(10);
        return bcrypt.hash(password, salt);
    }

    static async compare(password: string, hashedPassword: string): Promise<boolean> {
        return bcrypt.compare(password, hashedPassword);
    }

    static async hashVerificationCode(code: string): Promise<string> {
        const salt = await bcrypt.genSalt(5); 
        return bcrypt.hash(code, salt);
    }

    static async compareVerificationCode(code: string, hashedCode: string): Promise<boolean> {
        return bcrypt.compare(code, hashedCode);
    }
}