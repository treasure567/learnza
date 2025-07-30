import { Request, Response, NextFunction } from 'express';
import { JwtUtils } from '@utils/JwtUtils';
import { CustomError } from '@middleware/errorHandler';
import User from '@models/User';
import { ResponseUtils } from '@utils/ResponseUtils';

export interface AuthRequest extends Request {
    user?: any;
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            throw new CustomError('No token provided', 401);
        }

        const token = authHeader.split(' ')[1];
        const decoded = JwtUtils.verifyToken(token);

        const user = await User.findById(decoded.userId);
        if (!user) {
            throw new CustomError('User not found', 404);
        }

        req.user = user;
        next();
    } catch (error) {
        if (error instanceof Error) {
            return ResponseUtils.unauthorized(res, "Authentication failed");
        }
        return ResponseUtils.unauthorized(res, 'Authentication failed');
    }
}; 