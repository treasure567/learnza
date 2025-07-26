import { Response } from 'express';
import { ApiResponse, HttpStatus } from '@/types/response';

export class ResponseUtils {
    static success<T>(res: Response, data: T, message: string = 'Success', statusCode: number = HttpStatus.OK): void {
        const response: ApiResponse<T> = {
            status: true,
            message,
            data
        };
        res.status(statusCode).json(response);
    }

    static error(res: Response, message: string = 'Error occurred', statusCode: number = HttpStatus.BAD_REQUEST): void {
        const response: ApiResponse = {
            status: false,
            message
        };
        res.status(statusCode).json(response);
    }

    static validationError(res: Response, errors: Record<string, string[]>): void {
        const response: ApiResponse<Record<string, string[]>> = {
            status: false,
            message: 'Validation failed',
            data: errors
        };
        res.status(HttpStatus.VALIDATION_ERROR).json(response);
    }

    static created<T>(res: Response, data: T, message: string = 'Resource created successfully'): void {
        this.success(res, data, message, HttpStatus.CREATED);
    }

    static unauthorized(res: Response, message: string = 'Unauthorized access'): void {
        this.error(res, message, HttpStatus.UNAUTHORIZED);
    }

    static forbidden(res: Response, message: string = 'Access forbidden'): void {
        this.error(res, message, HttpStatus.FORBIDDEN);
    }

    static notFound(res: Response, message: string = 'Resource not found'): void {
        this.error(res, message, HttpStatus.NOT_FOUND);
    }

    static serverError(res: Response, message: string = 'Internal server error'): void {
        this.error(res, message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
} 