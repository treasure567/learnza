import { ValidationRules } from '@/types/validation';

export const verifyEmailRules: ValidationRules = {
    code: 'required|string|min:3|max:3'
}; 