import mongoose, { Schema } from 'mongoose';
import { IUser } from '../types/user';

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
    }
}, { timestamps: true });

export default mongoose.model<IUser>('User', userSchema); 