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
        type: String
    },
    emailVerifiedAt: {
        type: Date,
        default: null
    },
    lastSentOtp: {
        type: Date,
        default: null
    },
    resetPasswordToken: {
        type: String,
        default: null
    },
    resetPasswordExpires: {
        type: Date,
        default: null
    },
    lastResetRequest: {
        type: Date,
        default: null
    },
    language: {
        type: Schema.Types.ObjectId,
        ref: 'Language',
        default: null
    },
    accessibilityNeeds: [{
        type: Schema.Types.ObjectId,
        ref: 'Accessibility'
    }]
}, { 
    timestamps: true,
    toJSON: {
        transform: function(_doc: any, ret: Record<string, any>) {
            const transformed = { ...ret };
            delete transformed._id;
            delete transformed.password;
            delete transformed.verificationCode;
            delete transformed.lastSentOtp;
            delete transformed.resetPasswordToken;
            delete transformed.resetPasswordExpires;
            delete transformed.lastResetRequest;
            delete transformed.__v;
            delete transformed.createdAt;
            delete transformed.updatedAt;
            return transformed;
        }
    }
});

export default mongoose.model<IUser>('User', userSchema); 