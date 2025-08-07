import mongoose, { Schema } from 'mongoose';

interface IUser {
    email: string;
    name: string;
    password: string;   
    verificationCode: string;
    emailVerifiedAt: Date;
    lastSentOtp: Date;
    resetPasswordToken: string;
    resetPasswordExpires: Date;
    lastResetRequest: Date;
    language: string;
    accessibilityNeeds: string[];
    preferences: Record<string, any>;
    level: number;
    totalPoints: number;
    loginStreak: number;
    lastLoginDate: Date;
    address: string;
    completedTasks: {
        task: string;
        count: number;
        completedAt: Date;
        requiredCount: number;
        points: number;
    }[];
}

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
    }],
    preferences: {
        type: Map,
        of: Schema.Types.Mixed,
        default: {
            emailNotification: false,
            pushNotification: false,
            theme: 'light',
        }
    },
    level: {
        type: Number,
        default: 1
    },
    totalPoints: {
        type: Number,
        default: 0
    },
    loginStreak: {
        type: Number,
        default: 0
    },
    lastLoginDate: {
        type: Date,
        default: null
    },
    address: {
        type: String,
        default: null
    },
    completedTasks: [{
        task: {
            type: Schema.Types.ObjectId,
            ref: 'Task',
            required: true
        },
        count: {
            type: Number,
            default: 0
        },
        completedAt: {
            type: Date,
            default: Date.now
        },
        requiredCount: {
            type: Number,
            default: 0
        },
        points: {
            type: Number,
            default: 0
        }
    }]
}, {
    timestamps: true,
    toJSON: {
        transform: function (_doc: any, ret: Record<string, any>) {
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

userSchema.index({ level: 1 })
userSchema.index({ totalPoints: -1 })
userSchema.index({ loginStreak: -1 })

export default mongoose.model<IUser>('User', userSchema); 