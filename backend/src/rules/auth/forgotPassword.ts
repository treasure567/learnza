import { ValidationRules } from '@/types/validation';

export const forgotPasswordRules: ValidationRules = {
    email: 'required|email'
}; 