import { ValidationRules } from '@/types/validation';

export const updateProfileRules: ValidationRules = {
    name: 'string|min:2|max:50',
    email: 'email'
}; 