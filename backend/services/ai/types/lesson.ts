import { Document, Types } from 'mongoose';

export interface ILessonContent extends Document {
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