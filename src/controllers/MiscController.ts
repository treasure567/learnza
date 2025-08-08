import { Request, Response } from 'express';
import { ResponseUtils } from '@utils/ResponseUtils';
import MiscService from '@services/MiscService';
import { MicroserviceUtils, MicroService } from '@utils/MicroserviceUtils';

export class MiscController {
    static async getLanguages(req: Request, res: Response): Promise<void> {
        try {
            const languages = await MiscService.getLanguages();
            ResponseUtils.success(res, { languages }, 'Languages retrieved successfully');
        } catch (error) {
            ResponseUtils.error(res, (error as Error).message);
        }
    }

    static async getAccessibilities(req: Request, res: Response): Promise<void> {
        try {
            const accessibilities = await MiscService.getAccessibilities();
            ResponseUtils.success(res, { accessibilities }, 'Accessibility options retrieved successfully');
        } catch (error) {
            ResponseUtils.error(res, (error as Error).message);
        }
    }

    static async generateSpeech(req: Request, res: Response): Promise<void> {
        try {
            const { text, language, voice, filename, returnMode } = req.body as {
                text: string;
                language: 'en' | 'yo' | 'ha' | 'ig';
                voice?: string;
                filename?: string;
                returnMode?: 'base64' | 'stream';
            };

            if (!text || !language) {
                return ResponseUtils.validationError(res, {
                    text: !text ? ['text is required'] : [],
                    language: !language ? ['language is required'] : []
                });
            }

            const payload = { text, language, voice, filename, return: returnMode } as any;
            const response = await MicroserviceUtils.post<{ filename: string; contentType: string; audioBase64?: string }>(
                MicroService.AI,
                '/speech',
                payload
            );

            ResponseUtils.success(res, response.data, 'Speech generated');
        } catch (error) {
            ResponseUtils.error(res, (error as Error).message);
        }
    }
}
