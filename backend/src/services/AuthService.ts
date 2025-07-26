import User from '@models/User';
import { HashUtils } from '@utils/HashUtils';
import { JwtUtils } from '@utils/JwtUtils';
import { RateLimitUtils } from '@utils/RateLimitUtils';
import { IUser, UserResponse } from '@/types/user';
import { CustomError } from '@middleware/errorHandler';
import crypto from 'crypto';

export class AuthService {
    private static generateVerificationCode(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    private static generateResetToken(): string {
        return crypto.randomBytes(32).toString('hex');
    }

    static async register(email: string, name: string, password: string): Promise<UserResponse> {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw new CustomError('Email already registered', 400);
        }

        const hashedPassword = await HashUtils.hash(password);
        const verificationCode = this.generateVerificationCode();
        const hashedVerificationCode = await HashUtils.hashVerificationCode(verificationCode);
        
        const user = await User.create({
            email,
            name,
            password: hashedPassword,
            verificationCode: hashedVerificationCode,
            lastSentOtp: new Date()
        });

        console.log(`Verification code ${verificationCode} would be sent to ${email}`);

        const token = JwtUtils.generateToken({ userId: user._id as string });
        return { user, token };
    }

    static async login(email: string, password: string): Promise<UserResponse> {
        const user = await User.findOne({ email });
        if (!user) {
            throw new CustomError('Invalid credentials', 401);
        }

        const isValidPassword = await HashUtils.compare(password, user.password);
        if (!isValidPassword) {
            throw new CustomError('Invalid credentials', 401);
        }

        const token = JwtUtils.generateToken({ userId: user._id as string });
        return { user, token };
    }

    static async verifyEmail(userId: string, code: string): Promise<IUser> {
        const user = await User.findById(userId);
        if (!user) {
            throw new CustomError('User not found', 404);
        }

        if (user.emailVerifiedAt) {
            throw new CustomError('Email already verified', 400);
        }

        if (!user.verificationCode) {
            throw new CustomError('No verification code found', 400);
        }

        const isValidCode = await HashUtils.compareVerificationCode(code, user.verificationCode);
        if (!isValidCode) {
            throw new CustomError('Invalid verification code', 400);
        }

        user.emailVerifiedAt = new Date();
        user.verificationCode = undefined;
        await user.save();

        return user;
    }

    static async resendVerificationCode(userId: string): Promise<void> {
        const user = await User.findById(userId);
        if (!user) {
            throw new CustomError('User not found', 404);
        }

        if (user.emailVerifiedAt) {
            throw new CustomError('Email already verified', 400);
        }

        if (!RateLimitUtils.canResendOtp(user.lastSentOtp)) {
            const secondsRemaining = RateLimitUtils.getTimeUntilNextAttempt(user.lastSentOtp);
            const minutes = Math.floor(secondsRemaining / 60);
            const seconds = secondsRemaining % 60;
            throw new CustomError(`Please wait ${minutes} minute${minutes > 1 ? 's' : ''} and ${seconds} second${seconds > 1 ? 's' : ''} before requesting a new code`, 429);
        }

        const verificationCode = this.generateVerificationCode();
        user.verificationCode = await HashUtils.hashVerificationCode(verificationCode);
        user.lastSentOtp = new Date();
        await user.save();

        console.log(`New verification code ${verificationCode} would be sent to ${user.email}`);
    }

    static async forgotPassword(email: string): Promise<void> {
        const user = await User.findOne({ email });
        if (!user) {
            throw new CustomError('User not found', 404);
        }

        if (!RateLimitUtils.canResendOtp(user.lastResetRequest, 5)) {
            const secondsRemaining = RateLimitUtils.getTimeUntilNextAttempt(user.lastResetRequest, 5);
            const minutes = Math.floor(secondsRemaining / 60);
            const seconds = secondsRemaining % 60;
            throw new CustomError(`Please wait ${minutes} minute${minutes > 1 ? 's' : ''} and ${seconds} second${seconds > 1 ? 's' : ''} before requesting another password reset`, 429);
        }

        const resetToken = this.generateResetToken();
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = new Date(Date.now() + 3600000);
        user.lastResetRequest = new Date();
        await user.save();

        console.log(`Reset password link with token ${resetToken} would be sent to ${email}`);
    }

    static async resetPassword(token: string, newPassword: string): Promise<void> {
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            throw new CustomError('Invalid or expired reset token', 400);
        }

        user.password = await HashUtils.hash(newPassword);
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        await user.save();
    }
} 