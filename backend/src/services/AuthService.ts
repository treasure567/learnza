import User from '../models/User';
import { HashUtils } from '../utils/HashUtils';
import { JwtUtils } from '../utils/JwtUtils';
import { IUser, UserResponse } from '../types/user';

export class AuthService {
    static async register(email: string, name: string, password: string): Promise<UserResponse> {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw new Error('Email already registered');
        }

        const hashedPassword = await HashUtils.hash(password);
        const user = await User.create({
            email,
            name,
            password: hashedPassword
        });

        const token = JwtUtils.generateToken({ userId: user._id as string });
        return { user, token };
    }

    static async login(email: string, password: string): Promise<UserResponse> {
        const user = await User.findOne({ email });
        if (!user) {
            throw new Error('Invalid credentials');
        }

        const isValidPassword = await HashUtils.compare(password, user.password);
        if (!isValidPassword) {
            throw new Error('Invalid credentials');
        }

        const token = JwtUtils.generateToken({ userId: user._id as string });
        return { user, token };
    }
} 