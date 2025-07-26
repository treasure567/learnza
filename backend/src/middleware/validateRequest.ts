import { Request, Response, NextFunction } from 'express';
import { ValidationService } from '../services/ValidationService';
import { ValidationRules } from '../types/validation';

const validateRequest = (rules: ValidationRules) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const validator = new ValidationService(req.body, rules);
        const isValid = validator.validate();

        if (!isValid) {
            res.status(422).json({
                status: 'error',
                errors: validator.getErrors()
            });
            return;
        }

        next();
    };
};

export default validateRequest; 