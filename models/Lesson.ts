import mongoose, { Schema, Document } from 'mongoose';

interface ILesson extends Document {
    title: string;
    description: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    estimatedTime: number; // Total time in seconds
    userId: string;
    userRequest: string; // Store the original request
    languageCode: string;
    generatingStatus: 'not_started' | 'in_progress' | 'completed' | 'failed';
    status: 'not_started' | 'in_progress' | 'completed';
}

const lessonSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    difficulty: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        default: 'beginner'
    },
    estimatedTime: {
        type: Number,
        required: true // Total time in seconds
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    userRequest: {
        type: String,
        required: true // Store the original user request
    },
    languageCode: {
        type: String,
        required: true,
        enum: ['en', 'yo', 'ha', 'ig'],
        default: 'en'
    },
    generatingStatus: {
        type: String,
        enum: ['not_started', 'in_progress', 'completed', 'failed'],
        default: 'not_started'
    },
    status: {
        type: String,
        enum: ['not_started', 'in_progress', 'completed'],
        default: 'not_started'
    }
}, { 
    timestamps: true,
    toJSON: {
        transform: function(_doc: any, ret: Record<string, any>) {
            const transformed = { ...ret };
            delete transformed.userId;
            delete transformed.__v;
            delete transformed.createdAt;
            delete transformed.updatedAt;
            return transformed;
        }
    }
});

export default mongoose.model<ILesson>('Lesson', lessonSchema); 