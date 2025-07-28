import { Schema, model, Types } from 'mongoose';

export interface ILessonContent {
    _id: Types.ObjectId;
    lessonId: Types.ObjectId;
    userId: Types.ObjectId;
    title: string;
    description: string;
    sequenceNumber: number;
    content: string;
    completionStatus: 'not_started' | 'in_progress' | 'completed';
    currentProgress: number;
    lastAccessedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

const lessonContentSchema = new Schema<ILessonContent>({
    lessonId: {
        type: Schema.Types.ObjectId,
        ref: 'Lesson',
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
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
        default: 0
    },
    lastAccessedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

export default model<ILessonContent>('LessonContent', lessonContentSchema); 