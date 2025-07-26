import mongoose, { Schema } from 'mongoose';
import { IUser } from '@/types/user';

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    verificationCode: {
        type: String,
        length: 3
    },
    email_verified_at: {
        type: Date,
        default: null
    }
}, { timestamps: true });

export default mongoose.model<IUser>('User', userSchema); 