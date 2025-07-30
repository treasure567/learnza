import { ValidationRules } from '@/types/validation';

export const verifyEmailRules: ValidationRules = {
    code: 'required|string|min:6|max:6'
}; 