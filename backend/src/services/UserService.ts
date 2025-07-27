import User from '@models/User';
import Language from '@models/Language';
import Accessibility from '@models/Accessibility';
import { HashUtils } from '@utils/HashUtils';
import { CustomError } from '@middleware/errorHandler';
import { IUser } from '@/types/user';
import { updatePreferencesRules } from '@/rules/user/updatePreferences';
import { UserUtils } from '@/utils/UserUtils';

export class UserService {
    private static generateVerificationCode(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    static async getProfile(userId: string): Promise<IUser> {
        const user = await User.findById(userId);
        if (!user) {
            throw new CustomError('User not found', 404);
        }
        return UserUtils.populateUser(user);
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
            const verificationCode = this.generateVerificationCode();
            user.verificationCode = await HashUtils.hashVerificationCode(verificationCode);
            console.log(`New verification code ${verificationCode} would be sent to ${updateData.email}`);
        }

        Object.assign(user, updateData);
        await user.save();
        return UserUtils.populateUser(user);
    }

    static async updateLanguage(userId: string, languageCode: string): Promise<IUser> {
        const user = await User.findById(userId);
        if (!user) {
            throw new CustomError('User not found', 404);
        }

        const language = await Language.findOne({ code: languageCode, isActive: true });
        if (!language) {
            throw new CustomError('Invalid or inactive language code', 400);
        }

        user.language = language._id as string;
        await user.save();
        return UserUtils.populateUser(user);
    }

    static async updateAccessibilityNeeds(userId: string, accessibilityIds: string[]): Promise<IUser> {
        const user = await User.findById(userId);
        if (!user) {
            throw new CustomError('User not found', 404);
        }

        if (accessibilityIds.length > 0) {
            const accessibilities = await Accessibility.find({
                value: { $in: accessibilityIds },
                isActive: true
            });

            if (accessibilities.length !== accessibilityIds.length) {
                throw new CustomError('One or more invalid or inactive accessibility options', 400);
            }

            user.accessibilityNeeds = accessibilities.map(a => a._id as string);
        } else {
            user.accessibilityNeeds = [];
        }

        await user.save();
        return UserUtils.populateUser(user);
    }

    static async updatePreferences(userId: string, preferences: Record<string, any>): Promise<IUser> {
        const validKeys = Object.keys(updatePreferencesRules);
        const preferenceKeys = Object.keys(preferences);
        const invalidKeys = preferenceKeys.filter(key => !validKeys.includes(key));
        if (invalidKeys.length > 0) {
            throw new CustomError('Invalid preference keys: ' + invalidKeys.join(', '), 400);
        }

        const user = await User.findById(userId);
        if (!user) {
            throw new CustomError('User not found', 404);
        }

        Object.entries(preferences).forEach(([key, value]) => {
            user.preferences.set(key, value);
        });

        await user.save();
        return UserUtils.populateUser(user);
    }

    static async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
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
