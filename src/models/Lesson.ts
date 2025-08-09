import mongoose, { Schema } from 'mongoose';
import { ILesson } from '@/types/lesson';

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
        required: true
    },
    lastAccessedAt: {
        type: Date,
        default: null
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    userRequest: {
        type: String,
        required: true
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
    },
    languageCode: {
        type: String,
        enum: ['en', 'yo', 'ha', 'ig'],
        default: 'en'
    }
}, { 
    timestamps: true,
    toJSON: {
        virtuals: true,
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

lessonSchema.virtual('contents', {
    ref: 'LessonContent',
    localField: '_id',
    foreignField: 'lessonId'
});

export default mongoose.model<ILesson>('Lesson', lessonSchema); 