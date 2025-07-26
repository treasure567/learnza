import User from '@models/User';
import { HashUtils } from '@utils/HashUtils';
import { CustomError } from '@middleware/errorHandler';
import { IUser } from '@/types/user';

export class UserService {
    static async getProfile(userId: string): Promise<IUser> {
        const user = await User.findById(userId);
        if (!user) {
            throw new CustomError('User not found', 404);
        }
        return user;
    }

    static async updateProfile(userId: string, updateData: { name?: string; email?: string }): Promise<IUser> {
        const user = await User.findById(userId);
        if (!user) {
            throw new CustomError('User not found', 404);
        }

        if (updateData.email && updateData.email !== user.email) {
            const emailExists = await User.findOne({ email: updateData.email });
            if (emailExists) {
                throw new CustomError('Email already in use', 400);
            }
            user.emailVerifiedAt = null;
            user.verificationCode = Math.floor(100 + Math.random() * 900).toString();
            // TODO: Send verification email
            console.log(`New verification code ${user.verificationCode} would be sent to ${updateData.email}`);
        }

        Object.assign(user, updateData);
        await user.save();
        return user;
    }

    static async changePassword(
        userId: string, 
        currentPassword: string, 
        newPassword: string
    ): Promise<void> {
        const user = await User.findById(userId);
        if (!user) {
            throw new CustomError('User not found', 404);
        }

        const isValidPassword = await HashUtils.compare(currentPassword, user.password);
        if (!isValidPassword) {
            throw new CustomError('Current password is incorrect', 400);
        }

        if (currentPassword === newPassword) {
            throw new CustomError('New password must be different from current password', 400);
        }

        user.password = await HashUtils.hash(newPassword);
        await user.save();
    }
}
