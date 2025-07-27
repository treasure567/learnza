import { Document, Types } from 'mongoose';

export interface ILesson extends Document {
    _id: Types.ObjectId;
    title: string;
    description: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    estimatedTime: number;
    userId: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

export interface ILessonContent extends Document {
    _id: Types.ObjectId;
    lessonId: Types.ObjectId;
    userId: Types.ObjectId;
    sequenceNumber: number;
    content: string;
    completionStatus: 'not_started' | 'in_progress' | 'completed';
    currentProgress: number;
    lastAccessedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateLessonRequest {
    title: string;
    description: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    estimatedTime: number;
}

export interface UpdateLessonRequest extends Partial<CreateLessonRequest> {}

export interface CreateLessonContentRequest {
    content: string;
    sequenceNumber: number;
}

export interface UpdateLessonContentRequest {
    content?: string;
    sequenceNumber?: number;
}

export interface UpdateProgressRequest {
    progress: number;
    completionStatus?: 'not_started' | 'in_progress' | 'completed';
} 