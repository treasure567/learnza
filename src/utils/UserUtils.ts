import { IUser } from '@/types/user';
import { Document } from 'mongoose';

export class UserUtils {
    static async populateUser(user: Document & IUser): Promise<IUser> {
        return user.populate(['language', 'accessibilityNeeds']);
    }
} 