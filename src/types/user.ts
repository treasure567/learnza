import { Document, Types } from 'mongoose';
import { Language } from './misc';

export interface CompletedTask {
    task: Types.ObjectId;
    count: number;
    completedAt: Date;
    requiredCount: number;
    points: number;
}

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
    preferences: Map<string, any>;
    level: number;
    totalPoints: number;
    loginStreak: number;
    lastLoginDate: Date | null;
    completedTasks: CompletedTask[];
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