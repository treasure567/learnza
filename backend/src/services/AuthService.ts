import User from '@models/User';
import { HashUtils } from '@utils/HashUtils';
import { JwtUtils } from '@utils/JwtUtils';
import { RateLimitUtils } from '@utils/RateLimitUtils';
import { IUser, UserResponse } from '@/types/user';
import { CustomError } from '@middleware/errorHandler';

export class AuthService {
    static async register(email: string, name: string, password: string): Promise<UserResponse> {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw new CustomError('Email already registered', 400);
        }

        const hashedPassword = await HashUtils.hash(password);
        const verificationCode = Math.floor(100 + Math.random() * 900).toString();
        
        const user = await User.create({
            email,
            name,
            password: hashedPassword,
            verificationCode,
            lastSentOtp: new Date()
        });

        // TODO: Send verification code to user's email
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

        if (user.verificationCode !== code) {
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
            throw new CustomError(`Please wait ${secondsRemaining} seconds before requesting a new code`, 429);
        }

        const verificationCode = Math.floor(100 + Math.random() * 900).toString();
        user.verificationCode = verificationCode;
        user.lastSentOtp = new Date();
        await user.save();

        // TODO: Send new verification code to user's email
        console.log(`New verification code ${verificationCode} would be sent to ${user.email}`);
    }
} 