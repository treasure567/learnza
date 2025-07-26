export interface ApiResponse<T = any> {
    status: boolean;
    message: string;
    data?: T;
}

export enum HttpStatus {
    OK = 200,
    CREATED = 201,
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    VALIDATION_ERROR = 422,
    INTERNAL_SERVER_ERROR = 500
} 