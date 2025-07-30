import { ValidationRules } from '@/types/validation';

export const updateProfileRules: ValidationRules = {
    name: 'required|string|min:2|max:50',
    email: 'required|email'
}; 