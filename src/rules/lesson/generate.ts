import { ValidationRules } from '@/types/validation';

export const generateLessonRules: ValidationRules = {
    message: 'required|string|min:10|max:1000'
}; 