import { Document } from 'mongoose';

export interface IUser extends Document {
    email: string;
    name: string;
    password: string;
    verificationCode?: string;
    emailVerifiedAt: Date | null;
    lastSentOtp: Date | null;
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