import { ValidationRules } from '@/types/validation';

export const updateLanguageRules: ValidationRules = {
    languageCode: 'required|string|min:2|max:10'
}; 