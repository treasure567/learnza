import { Request, Response } from 'express';
import { LessonGeneratorModule } from './LessonGeneratorModule';
import { config } from 'dotenv';
import { AuthRequest } from './middleware/authMiddleware';

config();

const lessonGenerator = new LessonGeneratorModule(process.env.GEMINI_API_KEY || '');

export class LessonGeneratorController {
    async generateLessonContent(req: AuthRequest, res: Response) {
        try {
            const { userRequest, userId } = req.body;

            if (!userRequest || !userId) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required fields: userRequest or userId'
                });
            }

            const result = await lessonGenerator.generateAndStoreLessonContent(
                userRequest,
                userId
            );

            return res.status(200).json({
                success: true,
                message: 'Lesson generated and stored successfully',
                data: {
                    lesson: {
                        id: result.lesson._id,
                    }
                }
            });

        } catch (error: any) {
            console.error('Error in generateLessonContent:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Error generating lesson content'
            });
        }
    }
} 