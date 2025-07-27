import { ValidationRules } from '@/types/validation';

export const resetPasswordRules: ValidationRules = {
    token: 'required|string',
    password: 'required|string|min:6|max:50'
}; 