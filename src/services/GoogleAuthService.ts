import User from '@models/User';
import { JwtUtils } from '@utils/JwtUtils';
import { CustomError } from '@middleware/errorHandler';
import FirebaseService from './FirebaseService';
import { UserResponse } from '@/types/user';
import * as admin from 'firebase-admin';

export class GoogleAuthService {
    static async authenticate(token: string): Promise<UserResponse> {
        try {
            const decodedToken: admin.auth.DecodedIdToken = await FirebaseService.verifyToken(token);
            const { email, name } = decodedToken;

            if (!email) {
                throw new CustomError('Email not provided in Google account', 400);
            }

            let user = await User.findOne({ email });

            if (user) {
                const authToken = JwtUtils.generateToken({ userId: user._id as string });
                return { user, token: authToken };
            } else {
                user = await User.create({
                    email,
                    name: name || email.split('@')[0],
                    password: await this.generateRandomPassword(),
                    emailVerifiedAt: new Date()
                });

                const authToken = JwtUtils.generateToken({ userId: user._id as string });
                return { user, token: authToken };
            }
        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw new CustomError('Failed to authenticate with Google', 401);
        }
    }

    private static async generateRandomPassword(): Promise<string> {
        const length = 32;
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
        let password = '';
        for (let i = 0; i < length; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return password;
    }
} 