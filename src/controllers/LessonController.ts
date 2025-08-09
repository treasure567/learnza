import { Response } from 'express';
import { Buffer } from 'buffer';
import { AuthRequest } from '@middleware/authMiddleware';
import { ResponseUtils } from '@utils/ResponseUtils';
import { LessonService } from '@services/LessonService';
import OpenAI from 'openai';
import { Readable } from 'stream';
import dotenv from 'dotenv';
import { OpenAIUtils } from '@utils/OpenAIUtils';
import { SpitchUtils } from '@utils/SpitchUtils';

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export class LessonController {
    static async getLessons(req: AuthRequest, res: Response): Promise<void> {
        try {
            const { page, limit, sort } = req.query;
            const paginationOptions = {
                page: page ? parseInt(page as string) : undefined,
                limit: limit ? parseInt(limit as string) : undefined,
                sort: sort ? JSON.parse(sort as string) : undefined
            };

            const lessons = await LessonService.getLessons(req.user._id, paginationOptions);
            const progressStats = await LessonService.getProgressStats(req.user._id);
            const data = {
                lessons: lessons.data,
                progressStats: progressStats
            }
            ResponseUtils.success(res, data, 'Lessons retrieved successfully');
        } catch (error) {
            ResponseUtils.error(res, (error as Error).message);
        }
    }

    static async getLesson(req: AuthRequest, res: Response): Promise<void> {
        try {
            const lesson = await LessonService.getLesson(req.user._id, req.params.id);
            ResponseUtils.success(res, lesson, 'Lesson fetched successfully');
        } catch (error) {
            ResponseUtils.error(res, (error as Error).message);
        }
    }

    static async checkForGeneratingLessons(req: AuthRequest, res: Response): Promise<void> {
        try {
            const lessons = await LessonService.checkForGeneratingLessons(req.user._id);
            ResponseUtils.success(res, lessons, 'Lessons fetched successfully');
        } catch (error) {
            ResponseUtils.error(res, (error as Error).message);
        }
    }

    static async generateLesson(req: AuthRequest, res: Response): Promise<void> {
        try {
            LessonService.generateLesson(req.user._id, req.body);
            ResponseUtils.success(res, {}, "Lesson is being generated");
        } catch (error) {
            ResponseUtils.error(res, (error as Error).message);
        }
    }

    static async getChatHistory(req: AuthRequest, res: Response): Promise<void> {
        try {
            const history = await LessonService.getChatHistory(req.user._id, req.params.contentId);
            ResponseUtils.success(res, history, 'Chat history retrieved successfully');
        } catch (error) {
            ResponseUtils.error(res, (error as Error).message);
        }
    }

    static async interact(req: AuthRequest, res: Response): Promise<void> {
        try {
            const { message, lessonId, languageCode } = req.body as {
                message: string;
                lessonId: string;
                languageCode?: 'en' | 'yo' | 'ha' | 'ig' | string;
            };
            console.log(message, lessonId);

            const aiResponse = await LessonService.interact(req.user._id, message, lessonId, languageCode);
            console.log(aiResponse);
            try {
                const validLanguages = ['en', 'yo', 'ha', 'ig'];
                const ttsLanguage = typeof languageCode === 'string' && validLanguages.includes(languageCode) ? languageCode : 'en';

                const streamResponse: any = await SpitchUtils.generateSpeech({ text: aiResponse, returnMode: 'stream', language: ttsLanguage });
                const contentType = streamResponse.headers['content-type'] || 'audio/wav';
                const contentDisposition = streamResponse.headers['content-disposition'] || `inline; filename="speech_${ttsLanguage}.wav"`;
                const transcriptBase64 = Buffer.from(aiResponse, 'utf-8').toString('base64');
                res.writeHead(200, {
                    "Content-Type": contentType,
                    "Content-Disposition": contentDisposition,
                    "Transfer-Encoding": "chunked",
                    "X-AI-Response-Base64": transcriptBase64,
                    "Access-Control-Expose-Headers": "X-AI-Response-Base64",
                });
                streamResponse.data.pipe(res);
            } catch (error) {
                console.error('Error in text-to-speech conversion using spitch, falling back to openai:', error);
                try {
                    const response = await OpenAIUtils.generateSpeech(aiResponse);
                    const transcriptBase64 = Buffer.from(aiResponse, 'utf-8').toString('base64');
                    res.writeHead(200, {
                        "Content-Type": "audio/mpeg",
                        "Transfer-Encoding": "chunked",
                        "X-AI-Response-Base64": transcriptBase64,
                        "Access-Control-Expose-Headers": "X-AI-Response-Base64",
                    });
                    const audioStream = response;
                    audioStream.pipe(res);
                    audioStream.on('error', (error: Error) => {
                        console.error('Error streaming audio:', error);
                        if (!res.headersSent) {
                            ResponseUtils.error(res, 'Error streaming audio response');
                        }
                    });
                } catch (error) {
                    console.error('Error in text-to-speech conversion using openai:', error);
                    if (!res.headersSent) {
                        ResponseUtils.error(res, 'Failed to convert response to speech');
                    }
                }
            }
        } catch (error) {
            console.error('Error in lesson interaction:', error);
            if (!res.headersSent) {
                ResponseUtils.error(res, (error as Error).message);
            }
        }
    }
}