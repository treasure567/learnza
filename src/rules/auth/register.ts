import { ValidationRules } from '@/types/validation';

export const registerRules: ValidationRules = {
    email: 'required|email',
    name: 'required|string|min:2|max:50',
    password: 'required|string|min:6|max:50'
}; 