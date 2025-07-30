import { Request, Response, NextFunction } from 'express';
import { ValidationService } from '@services/ValidationService';
import { ValidationRules } from '@/types/validation';
import { ResponseUtils } from '@utils/ResponseUtils';

const validateRequest = (rules: ValidationRules) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const validator = new ValidationService(req.body, rules);
        const isValid = validator.validate();

        if (!isValid) {
            ResponseUtils.validationError(res, validator.getErrors());
            return;
        }

        next();
    };
};

export default validateRequest; 