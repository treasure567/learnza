import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';
import { UserResponse } from '../types/user';

export class AuthController {
    static async register(req: Request, res: Response): Promise<void> {
        try {
            const { email, name, password } = req.body;
            const result: UserResponse = await AuthService.register(email, name, password);
            res.status(201).json(result);
        } catch (error) {
            res.status(400).json({ error: (error as Error).message });
        }
    }

    static async login(req: Request, res: Response): Promise<void> {
        try {
            const { email, password } = req.body;
            const result: UserResponse = await AuthService.login(email, password);
            res.status(200).json(result);
        } catch (error) {
            res.status(401).json({ error: (error as Error).message });
        }
    }
} 