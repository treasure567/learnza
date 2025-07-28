
import { Request, Response, NextFunction } from 'express';

export interface AuthRequest extends Request {
    user?: any;
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            res.status(401).json({
                success: false,
                message: 'No token provided'
            });
            return;
        }

        const token = authHeader.split(' ')[1];
        
        // Check if token matches the environment variable
        const expectedToken = process.env.MICROSERVICE_SECRET;
        if (!expectedToken) {
            res.status(500).json({
                success: false,
                message: 'Microservice secret not configured'
            });
            return;
        }

        if (token !== expectedToken) {
            res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
            return;
        }

        // Token is valid, proceed without user verification
        req.user = { authenticated: true };
        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Authentication failed'
        });
        return;
    }
}; 