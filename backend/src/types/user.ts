import { Document } from 'mongoose';
import { Language } from './misc';

export interface IUser extends Document {
    email: string;
    name: string;
    password: string;
    verificationCode?: string;
    emailVerifiedAt: Date | null;
    lastSentOtp: Date | null;
    resetPasswordToken: string | null;
    resetPasswordExpires: Date | null;
    lastResetRequest: Date | null;
    language: string | null;
    accessibilityNeeds: string[];
    createdAt: Date;
    updatedAt: Date;
    preferences: Map<string, any>;
}

export interface UserResponse {
    user: IUser;
    token: string;
}

export interface VerifyEmailRequest {
    code: string;
}

export interface ForgotPasswordRequest {
    email: string;
}

export interface ResetPasswordRequest {
    token: string;
    password: string;
}

export interface UpdateLanguageRequest {
    languageCode: string;
}

export interface UpdateAccessibilityRequest {
    accessibilityIds: string[];
} 