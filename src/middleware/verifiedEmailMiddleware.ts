import { Response, NextFunction } from 'express';
import { CustomError } from '@middleware/errorHandler';
import { AuthRequest } from '@middleware/authMiddleware';

export const verifiedEmailMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user?.emailVerifiedAt) {
        throw new CustomError('Please verify your email address to access this resource', 403);
    }
    next();
}; 