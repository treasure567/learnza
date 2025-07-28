import mongoose, { Schema } from 'mongoose';

const taskSchema = new Schema({
    title: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    points: {
        type: Number,
        required: true,
        min: 0
    },
    requiredCount: {
        type: Number,
        required: true,
        min: 1
    },
    category: {
        type: String,
        required: true,
        enum: ['LESSON', 'CONTENT', 'STREAK', 'ACHIEVEMENT']
    },
    level: {
        type: Number,
        required: true,
        min: 1
    },
    order: {
        type: Number,
        required: true,
        unique: true
    },
    prerequisites: [{
        type: Schema.Types.ObjectId,
        ref: 'Task'
    }]
}, {
    timestamps: true
});

taskSchema.index({ category: 1, level: 1, requiredCount: 1 });
taskSchema.index({ category: 1, level: 1, title: 1 });

export default mongoose.model('Task', taskSchema); 