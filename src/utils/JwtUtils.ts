import jwt from 'jsonwebtoken';

interface JwtPayload {
    userId: string;
    [key: string]: any;
}

export class JwtUtils {
    static generateToken(payload: JwtPayload): string {
        return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '1d' });
    }

    static verifyToken(token: string): JwtPayload {
        return jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    }
} 