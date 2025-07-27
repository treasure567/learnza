import mongoose, { Schema, Document } from 'mongoose';

// Minimal interface for authentication purposes only
interface IUser extends Document {
    _id: string;
    email: string;
    name: string;
    emailVerifiedAt?: Date;
}

// Minimal schema - only fields needed for authentication
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
    emailVerifiedAt: {
        type: Date,
        default: null
    }
}, { 
    timestamps: true,
    // Disable any transformations to keep it simple
    toJSON: {
        transform: function(_doc: any, ret: Record<string, any>) {
            delete ret.password;
            delete ret.__v;
            return ret;
        }
    }
});

export default mongoose.model<IUser>('User', userSchema); 