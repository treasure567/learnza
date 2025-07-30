import { Schema, model, Types } from 'mongoose';

export enum ChatAgent {
    USER = 'user',
    AI = 'ai'
}

export interface ILessonChatHistory {
    lessonId: Types.ObjectId;
    userId: Types.ObjectId;
    contentId: string;
    agent: ChatAgent;
    content: string;
    createdAt: Date;
    updatedAt: Date;
}

const lessonChatHistorySchema = new Schema<ILessonChatHistory>({
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
    contentId: {
        type: String,
        required: true
    },
    agent: {
        type: String,
        enum: Object.values(ChatAgent),
        required: true
    },
    content: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

export default model<ILessonChatHistory>('LessonChatHistory', lessonChatHistorySchema); 