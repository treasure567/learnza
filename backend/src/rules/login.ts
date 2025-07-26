import { ValidationRules } from '../types/validation';

export const loginRules: ValidationRules = {
    email: 'required|email',
    password: 'required|string'
}; 