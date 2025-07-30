import { ValidationRules } from '@/types/validation';

export const PREFERENCE_RULES = {
    emailNotification: 'boolean',
    pushNotification: 'boolean',
    theme: 'string|in:light,dark',
    timezone: 'string'
};

export const updatePreferencesRules: ValidationRules = Object.entries(PREFERENCE_RULES).reduce((rules, [key, value]) => {
    rules[key] = value;
    return rules;
}, {} as ValidationRules);