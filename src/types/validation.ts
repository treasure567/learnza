export interface ValidationRules {
    [key: string]: string;
}

export interface ValidationErrors {
    [key: string]: string[];
}

export interface ValidationResult {
    status: string;
    errors: ValidationErrors;
} 