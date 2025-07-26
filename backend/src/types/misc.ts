import { Document } from 'mongoose';

export interface Language {
    code: string;
    name: string;
    nativeName: string;
    region: string;
    isActive?: boolean;
}

export interface ILanguage extends Language, Document {}

export interface LanguageResponse {
    languages: Language[];
} 