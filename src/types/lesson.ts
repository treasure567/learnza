import { Document, Types } from 'mongoose';

export interface ILesson extends Document {
    title: string;
    description: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    estimatedTime: number;
    lastAccessedAt: Date | null;
    userId: Types.ObjectId;
    userRequest: string;
    contents: ILessonContent[];
    createdAt: Date;
    updatedAt: Date;
    generatingStatus: 'not_started' | 'in_progress' | 'completed' | 'failed';
    status: 'not_started' | 'in_progress' | 'completed';
}

export interface ILessonContent extends Document {
    lessonId: Types.ObjectId | ILesson;
    title: string;
    description: string;
    content: string;
    sequenceNumber: number;
    completionStatus: 'not_started' | 'in_progress' | 'completed';
    currentProgress: number;
    lastAccessedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface GenerateLessonRequest {
    message: string;
    languageCode?: 'en' | 'yo' | 'ha' | 'ig';
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