import { Request, Response, NextFunction } from 'express';
import { ResponseUtils } from '@utils/ResponseUtils';

export class CustomError extends Error {
    constructor(
        public message: string,
        public statusCode: number = 500
    ) {
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

export const notFoundHandler = (req: Request, res: Response): void => {
    ResponseUtils.notFound(res, `Route ${req.originalUrl} not found`);
};

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction): void => {
    // console.error('Error:', {
    //     name: err.name,
    //     message: err.message,
    //     stack: err.stack,
    //     path: req.path,
    //     method: req.method
    // });

    if (err instanceof CustomError) {
        ResponseUtils.error(res, err.message, err.statusCode);
        return;
    }

    if (err.name === 'ValidationError') {
        ResponseUtils.validationError(res, { general: [err.message] });
        return;
    }

    if (err.name === 'CastError') {
        ResponseUtils.error(res, 'Invalid ID format');
        return;
    }

    if (err.name === 'MongoServerError' && (err as any).code === 11000) {
        ResponseUtils.error(res, 'Duplicate key error');
        return;
    }
    
    ResponseUtils.serverError(res, 'Something went wrong');
}; 