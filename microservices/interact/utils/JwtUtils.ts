
import jwt from 'jsonwebtoken';

interface JwtPayload {
    userId: string;
    [key: string]: any;
}

export class JwtUtils {
    static verifyToken(token: string): JwtPayload {
        return jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    }
} 