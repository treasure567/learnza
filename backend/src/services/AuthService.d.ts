import { UserResponse } from '../types/user';

export declare class AuthService {
    static register(email: string, name: string, password: string): Promise<UserResponse>;
    static login(email: string, password: string): Promise<UserResponse>;
} 