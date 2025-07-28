import { Schema, model, Types } from 'mongoose';

export interface ILesson {
    _id: Types.ObjectId;
    title: string;
    description: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    estimatedTime: number;
    userId: Types.ObjectId;
    userRequest: string;
    createdAt: Date;
    updatedAt: Date;
}

const lessonSchema = new Schema<ILesson>({
    title: {
        type: String,
        required: true
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
    userId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    userRequest: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

export default model<ILesson>('Lesson', lessonSchema); 