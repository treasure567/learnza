import { Response } from 'express';
import { AuthRequest } from '@middleware/authMiddleware';
import { ResponseUtils } from '@utils/ResponseUtils';
import { LessonService } from '@services/LessonService';
import OpenAI from 'openai';
import { Readable } from 'stream';
import dotenv from 'dotenv';

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
            ResponseUtils.success(res, lessons, 'Lessons retrieved successfully');
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
            const { message, lessonId } = req.body;
            console.log(message, lessonId);

            const aiResponse = await LessonService.interact(req.user._id, message, lessonId);

            try {
                const response = await openai.audio.speech.create({
                    model: "tts-1",
                    voice: "alloy",
                    input: aiResponse,
                });
                console.log("ddd");

                if (!response.body) {
                    throw new Error('No audio stream received from OpenAI');
                }

                res.writeHead(200, {
                    "Content-Type": "audio/mpeg",
                    "Transfer-Encoding": "chunked",
                });

                const audioStream = Readable.from(response.body);

                audioStream.pipe(res);

                audioStream.on('error', (error: Error) => {
                    console.error('Error streaming audio:', error);
                    if (!res.headersSent) {
                        ResponseUtils.error(res, 'Error streaming audio response');
                    }
                });

            } catch (error) {
                console.error('Error in text-to-speech conversion:', error);
                if (!res.headersSent) {
                    ResponseUtils.error(res, 'Failed to convert response to speech');
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