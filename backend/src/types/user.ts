import { Document } from 'mongoose';

export interface IUser extends Document {
    email: string;
    name: string;
    password: string;
    verificationCode?: string;
    email_verified_at: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface UserResponse {
    user: IUser;
    token: string;
}

export interface VerifyEmailRequest {
    code: string;
} 