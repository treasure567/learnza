import mongoose, { Schema } from 'mongoose';

interface ILanguage {
    code: string;
    name: string;
    nativeName: string;
    region: string;
    isActive: boolean;
}

const languageSchema = new Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    nativeName: {
        type: String,
        required: true,
        trim: true
    },
    region: {
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

export default mongoose.model<ILanguage>('Language', languageSchema); 