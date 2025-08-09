import { ValidationRules } from '@/types/validation';

export const ADDRESS_RULES = {
    address: 'string|required|min:42|max:42',
};

export const updateAddress: ValidationRules = Object.entries(ADDRESS_RULES).reduce((rules, [key, value]) => {
    rules[key] = value;
    return rules;
}, {} as ValidationRules);