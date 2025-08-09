import { ValidationRules } from '@/types/validation';

export const updateLessonLanguageRules: ValidationRules = {
    lessonId: 'required|string|min:1|max:1000',
    languageCode: 'required|string|in:en,yo,ha,ig'
}; 