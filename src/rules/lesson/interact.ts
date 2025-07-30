import { ValidationRules } from '@/types/validation';

export const interactRules: ValidationRules = {
    message: 'required|string|min:1|max:1000',
    lessonId: 'required|string|min:1|max:1000'
}; 