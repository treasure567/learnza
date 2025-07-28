
import { Request, Response } from 'express';
import { InteractService } from '../services/InteractService';
import { InteractionRequest } from '../types/interact';

const interactService = new InteractService();

export const handleInteraction = async (req: Request, res: Response) => {
    try {
        const { userId, userChat, contentId } = req.body as InteractionRequest;

        if (!userId || !userChat || !contentId) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        const response = await interactService.handleInteraction({ userId, userChat, contentId });

        return res.status(200).json(response);
    } catch (error) {
        console.error('Error handling interaction:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}; 