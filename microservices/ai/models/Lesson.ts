import mongoose, { Schema, Document } from 'mongoose';

interface ILesson extends Document {
    title: string;
    description: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    estimatedTime: number; // Total time in seconds
    userId: string;
    userRequest: string; // Store the original request
    contents?: any[]; // Store the generated lesson contents
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
    contents: [{
        type: Schema.Types.Mixed // Store the generated lesson contents
    }]
}, { timestamps: true });

export default mongoose.model<ILesson>('Lesson', lessonSchema); 