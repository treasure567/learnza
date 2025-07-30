import { ValidationRules } from '@/types/validation';

export const changePasswordRules: ValidationRules = {
    currentPassword: 'required|string|min:6',
    newPassword: 'required|string|min:6|max:50'
}; 