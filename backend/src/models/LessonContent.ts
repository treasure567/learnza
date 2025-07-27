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
    lastAccessedAt: {
        type: Date,
        default: null
    }
}, { timestamps: true });

lessonContentSchema.index({ lessonId: 1, sequenceNumber: 1 }, { unique: true });
lessonContentSchema.index({ userId: 1, lessonId: 1 });

export default mongoose.model<ILessonContent>('LessonContent', lessonContentSchema); 