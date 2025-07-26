import { ValidationRules } from '@/types/validation';

export const addLanguageRules: ValidationRules = {
    code: 'required|string|min:2|max:10',
    name: 'required|string|min:2|max:50',
    nativeName: 'required|string|min:2|max:50',
    region: 'required|string|min:2|max:50'
};

export const updateLanguageRules: ValidationRules = {
    name: 'string|min:2|max:50',
    nativeName: 'string|min:2|max:50',
    region: 'string|min:2|max:50'
}; 