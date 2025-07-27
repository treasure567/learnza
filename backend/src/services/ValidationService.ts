import { ValidationRules, ValidationErrors } from '../types/validation';

export class ValidationService {
    private data: Record<string, any>;
    private rules: ValidationRules;
    private errors: ValidationErrors;

    constructor(data: Record<string, any>, rules: ValidationRules) {
        this.data = data;
        this.rules = rules;
        this.errors = {};
    }

    validate(): boolean {
        if (this.rules._keys) {
            const [ruleName, ruleValue] = this.rules._keys.split(':');
            const validatorMethod = `validate${this.capitalize(ruleName)}` as keyof ValidationService;

            if (this[validatorMethod] && typeof this[validatorMethod] === 'function') {
                const keys = Object.keys(this.data);
                for (const key of keys) {
                    const isValid = (this[validatorMethod] as Function).call(this, '_keys', key, ruleValue);
                    if (!isValid) break;
                }
            }
            delete this.rules._keys;
        }

        for (const field in this.rules) {
            const value = this.data[field];
            const rules = this.rules[field].split('|');

            for (const rule of rules) {
                const [ruleName, ruleValue] = rule.split(':');
                const validatorMethod = `validate${this.capitalize(ruleName)}` as keyof ValidationService;

                if (this[validatorMethod] && typeof this[validatorMethod] === 'function') {
                    const isValid = (this[validatorMethod] as Function).call(this, field, value, ruleValue);
                    if (!isValid) break;
                }
            }
        }

        return Object.keys(this.errors).length === 0;
    }

    private capitalize(string: string): string {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    private addError(field: string, message: string): void {
        if (!this.errors[field]) {
            this.errors[field] = [];
        }
        this.errors[field].push(message);
    }

    private validateRequired(field: string, value: any): boolean {
        if (value === undefined || value === null || value === '') {
            this.addError(field, `${field} is required`);
            return false;
        }
        return true;
    }

    private validateEmail(field: string, value: string): boolean {
        if (!value) return true;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            this.addError(field, `${field} must be a valid email`);
            return false;
        }
        return true;
    }

    private validateMin(field: string, value: string, min: string): boolean {
        if (!value) return true;
        if (typeof value === 'string' && value.length < parseInt(min)) {
            this.addError(field, `${field} must be at least ${min} characters`);
            return false;
        }
        return true;
    }

    private validateMax(field: string, value: string, max: string): boolean {
        if (!value) return true;
        if (typeof value === 'string' && value.length > parseInt(max)) {
            this.addError(field, `${field} must not exceed ${max} characters`);
            return false;
        }
        return true;
    }

    private validateString(field: string, value: any): boolean {
        if (!value) return true;
        if (typeof value !== 'string') {
            this.addError(field, `${field} must be a string`);
            return false;
        }
        return true;
    }

    private validateNumeric(field: string, value: any): boolean {
        if (!value) return true;
        if (isNaN(Number(value))) {
            this.addError(field, `${field} must be numeric`);
            return false;
        }
        return true;
    }

    private validateAlpha(field: string, value: string): boolean {
        if (!value) return true;
        const alphaRegex = /^[a-zA-Z]+$/;
        if (!alphaRegex.test(value)) {
            this.addError(field, `${field} must contain only letters`);
            return false;
        }
        return true;
    }

    private validateAlphaNumeric(field: string, value: string): boolean {
        if (!value) return true;
        const alphaNumericRegex = /^[a-zA-Z0-9]+$/;
        if (!alphaNumericRegex.test(value)) {
            this.addError(field, `${field} must contain only letters and numbers`);
            return false;
        }
        return true;
    }

    private validateBoolean(field: string, value: any): boolean {
        if (!value) return true;
        if (typeof value !== 'boolean') {
            this.addError(field, `${field} must be a boolean`);
            return false;
        }
        return true;
    }

    private validateIn(field: string, value: any, allowedValues: string): boolean {
        if (!value) return true;
        const allowed = allowedValues.split(',');
        if (!allowed.includes(value.toString())) {
            this.addError(field, `${field} must be one of: ${allowedValues}`);
            return false;
        }
        return true;
    }

    getErrors(): ValidationErrors {
        return this.errors;
    }
} 