import mongoose, { Schema } from 'mongoose';
import { IAccessibility } from '@/types/misc';

const accessibilitySchema = new Schema({
    value: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { 
    timestamps: true,
    toJSON: {
        transform: function(_doc: any, ret: Record<string, any>) {
            const transformed = { ...ret };
            delete transformed._id;
            delete transformed.__v;
            delete transformed.createdAt;
            delete transformed.updatedAt;
            delete transformed.isActive;
            return transformed;
        }
    }
});

export default mongoose.model<IAccessibility>('Accessibility', accessibilitySchema); 