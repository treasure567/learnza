import mongoose, { Schema } from 'mongoose';
import { ILessonContent } from '@/types/lesson';

const lessonContentSchema = new Schema({
    lessonId: {
        type: Schema.Types.ObjectId,
        ref: 'Lesson',
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    generated: {
        type: Boolean,
        default: false
    },
    sequenceNumber: {
        type: Number,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    completionStatus: {
        type: String,
        enum: ['not_started', 'in_progress', 'completed'],
        default: 'not_started'
    },
    currentProgress: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    estimatedTime: {
        type: Number,
        required: true
    },
    lastAccessedAt: {
        type: Date,
        default: null
    }
}, { timestamps: true,
    toJSON: {
        transform: function(_doc: any, ret: Record<string, any>) {
            const transformed = { ...ret };
            delete transformed.userId;
            delete transformed.lessonId;
            delete transformed.userRequest;
            delete transformed.generated;
            delete transformed.completionStatus;
            delete transformed.content;
            delete transformed.sequenceNumber;
            delete transformed.currentProgress;
            delete transformed.estimatedTime;
            delete transformed.lastAccessedAt;
            delete transformed.__v;
            delete transformed.createdAt;
            delete transformed.updatedAt;
            return transformed;
        }
    }
 });

lessonContentSchema.index({ lessonId: 1, sequenceNumber: 1 }, { unique: true });
lessonContentSchema.index({ userId: 1, lessonId: 1 });

export default mongoose.model<ILessonContent>('LessonContent', lessonContentSchema); 